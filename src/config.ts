import delay from "delay"
import { keyable } from "./types"

const config: keyable<any> = {
    CLUSTER_API_PORT: 8000,
    DEPLOYMENT_MAX_SCALING: 5,
    API_PASSWORD: "dev"
}

type CONFIG_KEYS = "REGISTRY_DOMAIN" | "CLUSTER_API_PORT" | "DEPLOYMENT_MAX_SCALING" |
    "API_PASSWORD"

function get(key: CONFIG_KEYS) {
    if (typeof config[key] === "undefined") {
        throw "Config key " + key + " does not exist. May be you have to wait for it to appear?"
    }
    return config[key]
}

function set(key: CONFIG_KEYS, value: any) {
    config[key] = value
}

async function getAsync(key: CONFIG_KEYS) {
    for (let i = 0; i < 100; i++) {
        if (typeof config[key] === "undefined") {
            await delay(i * 100)
        }
    }
    return config[key]
}

export default { get, set }