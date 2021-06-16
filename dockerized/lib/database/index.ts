import listenForUpdates from "./listenForUpdates"
import safePatch from "./safePatch"
import consulInstance from "./consulInstance"
import setWithDelay from "./setWithDelay"

export async function getPath(path: string, fallback = {}) {
    const response = await consulInstance.kv.get(path)
    if (!response) {
        return fallback
    }
    return JSON.parse(response.Value)
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
    listenForUpdates, safePatch, getPath, deletePath, setPath, setWithDelay
}