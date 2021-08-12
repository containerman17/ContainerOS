import consul from "./private/consul"
import Consul from "consul"
import { keyable } from "../types"

export class ServiceStore {
    public async getList() {
        const servicesInConsul = await consul.agent.service.list()
        return servicesInConsul
    }
    public async deregisterAllServices() {
        const servicesInConsul: keyable<any> = await consul.agent.service.list()
        await Promise.all(
            Object.keys(servicesInConsul).map(id => consul.agent.service.deregister(id))
        )
    }
    public async getServiceEndpoints(serviceName: string) {
        return (await consul.catalog.service.nodes(serviceName))
            //@ts-ignore
            .map(line => `${line.Address}:${line.ServicePort}`)
    }
}

export default new ServiceStore();