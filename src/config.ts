import delay from "delay"
import { keyable } from "./types"
import md5 from "md5"
import os from "os"

const genConsulKey = base => Buffer.from(md5(md5(base) + base)).toString('base64')

const config: keyable<any> = {
    CLUSTER_API_PORT: 8000,
    DEPLOYMENT_MAX_SCALING: 5,
    API_PASSWORD: "dev",
    CONSUL_IMAGE: 'quay.io/containeros/consul:1.10.0',
    NODE_NAME: os.hostname(),
}

set("CONSUL_ENCRYPTION_KEY", genConsulKey(get("API_PASSWORD")))

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
        }
    }
    return config[key]
}

//TODO: get from CLI
set("EXPECTED_CONTROLLER_IPS", [])
set("IS_DEV", true)


export default { get, set, waitAndGet }