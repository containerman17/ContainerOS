import { keyable, ServicePayload } from "./types"
import Consul from "consul"
import getDefaultNetworkInterface from "../../lib/system/getDefaultNetworkInterface"

const consul = new Consul({
    promisify: true,
    host: process.env.CONSUL_HOST || '127.0.0.1'
})

let myIp = getDefaultNetworkInterface().then(res => res.ip_address)

const containerServices: keyable<ServicePayload[]> = {}

const registerInConsul = async function (containerId, service) {
    await consul.agent.service.register({
        id: containerId,
        name: service.name,
        port: service.port,
        tags: service.tags,
        check: {
            tcp: `${await myIp}:${service.port}`,
            interval: '15s',
        }
    })
}

export async function register(containerId: string, services: ServicePayload[]) {
    if (!containerServices[containerId]) {
        containerServices[containerId] = services
        for (let service of services) {
            await registerInConsul(containerId, service)
        }
    }
}

export async function deRegister(containerId) {
    if (containerServices[containerId] !== undefined) {
        delete containerServices[containerId]
        await consul.agent.service.deregister(containerId)
    }
}

let syncPromise = Promise.resolve()

export async function fullSync() {
    await syncPromise //to remove concurency issues
    syncPromise = new Promise(async (resolve, reject) => {
        try {
            const servicesInConsul = await consul.agent.service.list()

            const allContainerIds = Object.keys(containerServices)

            //register new services
            for (let [containerId, servicePayloads] of Object.entries(containerServices)) {
                for (let servicePayload of servicePayloads) {
                    console.log(`registering service ${servicePayload.name}`)
                    await registerInConsul(containerId, servicePayload)

                }
            }

            //deregister old ones
            for (let [serviceId, service] of Object.entries(servicesInConsul)) {
                if (allContainerIds.includes(serviceId)) continue
                // await consul.agent.service.deregister(serviceId)
                console.log(`deregister service`, serviceId.slice(0, 4), allContainerIds.map(ser => ser.slice(0, 4)))
            }
            resolve()
        } catch (e) {
            reject(e)
        }
    })
}