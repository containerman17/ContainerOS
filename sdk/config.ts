import delay from "delay"
import { keyable } from "./types"
import crypto from "crypto"

const sha256 = str => crypto.createHash('sha256').update(str).digest('base64');

const config: keyable<any> = {
    SCHEDULING_CONCURRENCY: 5,
    NODE_HEALTH_INTERVAL: 5 * 1000,
    CPU_OVERBOOKING_RATE: 3,
    MEMORY_OVERBOOKING_RATE: 3,
}

function get(key: string) {
    if (typeof config[key] === "undefined") {
        throw "Config key " + key + " does not exist. May be you have to wait for it to appear?"
    }
    return config[key]
}

function set(key: string, value: any) {
    config[key] = value
}

async function waitAndGet(key: string) {
    for (let i = 0; i < 100; i++) {
        if (typeof config[key] === "undefined") {
            await delay(i * 100)
        } else {
            return config[key]
        }
    }
    throw Error(`Could not load config value for ${key}`)
}

export default { get, set, waitAndGet }
