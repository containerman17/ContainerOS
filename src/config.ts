import delay from "delay"
import { keyable } from "containeros-sdk"
import crypto from "crypto"
import os from "os"
import fs from "fs"
import path from "path"


const sha256 = str => crypto.createHash('sha256').update(str).digest('base64');
const genConsulKey = base => sha256(sha256(base) + base)

const config: keyable<any> = {
    CLUSTER_API_PORT: 8000,
    DEPLOYMENT_MAX_SCALING: 20,
    API_PASSWORD: "dev",
    CONSUL_IMAGE: 'quay.io/containeros/consul:1.10.1',
    NODE_NAME: os.hostname(),
    NODE_HEALTH_INTERVAL: 5 * 1000,
}

const routerVersion = process.env.COS_VERSION || fs.readFileSync(path.join(__dirname, "..", "VERSION"))
set("ROUTER_IMAGE", `quay.io/containeros/router:${routerVersion}`)

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
        } else {
            return config[key]
        }
    }
    throw Error(`Could not load config value for ${key}`)
}

//TODO: get from CLI
set("EXPECTED_CONTROLLER_IPS", [])

//ENV
const looksLikeTestEnv = process.env.NODE_ENV === "test"
    || process.env.npm_lifecycle_event === "test"
    || process.env.npm_lifecycle_event === "test-watch"
    || String(process.env._).endsWith('mocha')
    || process.argv[1].endsWith('mocha')

set("ENV", looksLikeTestEnv ? "test" : "dev")
set("IS_TEST", get("ENV") === "test")
set("IS_DEV", get("ENV") === "dev")
set("IS_PROD", get("ENV") === "prod")

export default { get, set, waitAndGet }
