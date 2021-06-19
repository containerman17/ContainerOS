import listenForUpdates from "./listenForUpdates"
import safePatch from "./safePatch"
import consulInstance from "./consulInstance"
import setWithDelay from "./setWithDelay"
import { getLeastBusyServer, gotNewHealthData, getServers } from "./serverHealthManager"
import { onLeaderChanged } from "./consulLeader"
import Consul from "consul"

export async function getPath(path: string, fallback = {}) {
    const response = await consulInstance.kv.get<Consul.Kv.GetOneResponse>({
        key: path,
    })
    if (!response) {
        return fallback
    }
    return JSON.parse(response.Value)
}

export async function getPathRecurse(path: string) {
    const response: any = await consulInstance.kv.get({
        key: path,
        recurse: true
    })
    if (!response) {
        return []
    }
    const result = {}
    for (let responseLine of response) {
        result[responseLine.Key] = JSON.parse(responseLine.Value)
    }
    return result
}


export async function deletePath(path: string) {
    return await consulInstance.kv.del(path)
}


export async function setPath(path: string, data: any) {
    return await consulInstance.kv.set({
        key: path,
        value: JSON.stringify(data, null, 2)
    })
}

export default {
    listenForUpdates, safePatch, getPath, deletePath, setPath, setWithDelay,
    getPathRecurse, getLeastBusyServer, gotNewHealthData, getServers, onLeaderChanged
}