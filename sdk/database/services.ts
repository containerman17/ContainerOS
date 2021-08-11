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
}

export default new ServiceStore();