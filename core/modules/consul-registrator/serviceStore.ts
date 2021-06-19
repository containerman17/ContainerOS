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
    delete containerServices[containerId]
    sync()//no await
}

let syncPromise = Promise.resolve()


export async function sync() {
    await syncPromise //to remove concurency issues
    syncPromise = new Promise(async (resolve, reject) => {
        try {
            const servicesInConsul = await consul.agent.service.list()
            // console.log('servicesInConsul', servicesInConsul)
            // console.log('containerServices', containerServices)
            for (let [containerId, servicePayloads] of Object.entries(containerServices)) {
                for (let servicePayload of servicePayloads) {
                    await consul.agent.service.register({
                        name: servicePayload.name,
                        port: servicePayload.port,
                        tags: servicePayload.tags,
                        //check: { }//TODO: healthcheck
                    })
                }
            }

            resolve()
        } catch (e) {
            reject(e)
        }
    })
}