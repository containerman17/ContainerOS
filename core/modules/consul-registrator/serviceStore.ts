import { keyable, ServicePayload } from "./types"
import Consul from "consul"

const consul = new Consul({
    promisify: true,
    host: process.env.CONSUL_HOST || '127.0.0.1'
})

const containerServices: keyable<ServicePayload[]> = {}

export async function register(containerId: string, services: ServicePayload[]) {
    containerServices[containerId] = services
    sync()//no await
}

export async function deRegister(containerId) {
    if (containerServices[containerId] !== undefined) {
        delete containerServices[containerId]
        sync()//no await
    }
}

let syncPromise = Promise.resolve()

export async function sync() {
    await syncPromise //to remove concurency issues
    syncPromise = new Promise(async (resolve, reject) => {
        try {
            const servicesInConsul = await consul.agent.service.list()

            console.log('servicesInConsul', servicesInConsul)
            console.log('containerServices', Object.values(containerServices))

            const allContainerIds = Object.keys(containerServices)

            //register new services
            for (let [containerId, servicePayloads] of Object.entries(containerServices)) {
                for (let servicePayload of servicePayloads) {
                    console.info("registering service", containerId)

                    await consul.agent.service.register({
                        id: containerId,
                        name: servicePayload.name,
                        port: servicePayload.port,
                        tags: servicePayload.tags,
                        //check: { }//TODO: healthcheck
                    })
                }
            }

            //deregister old ones
            for (let [serviceId, service] of Object.entries(servicesInConsul)) {
                if (allContainerIds.includes(serviceId)) continue
                console.info("deregistering service", serviceId)
                await consul.agent.service.deregister(serviceId)
            }
            resolve()
        } catch (e) {
            reject(e)
        }
    })
}