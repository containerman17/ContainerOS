import dotenv from 'dotenv';
import fs from 'fs'
dotenv.config()

const config = {
    ENV: process.env.ENV || 'dev',
    CLUSTER_API_PORT: 8080,
    MAX_APP_SCALING: 10,
    IS_TEST: undefined,
    IS_DEV: undefined,
    IS_PROD: undefined,
    KRAKENKV_HOST: undefined,
    REGISTRY_HOST: undefined,
    REGISTRY_STORAGE_S3_ACCESSKEY: process.env.REGISTRY_STORAGE_S3_ACCESSKEY,
    REGISTRY_STORAGE_S3_SECRETKEY: process.env.REGISTRY_STORAGE_S3_SECRETKEY,
    REGISTRY_STORAGE_S3_BUCKET: process.env.REGISTRY_STORAGE_S3_BUCKET,
    REGISTRY_STORAGE_S3_REGIONENDPOINT: process.env.REGISTRY_STORAGE_S3_REGIONENDPOINT,
    REGISTRY_STORAGE_S3_REGION: process.env.REGISTRY_STORAGE_S3_REGION,
    ROOT_TOKEN: undefined,
    API_HOST: undefined
}

if (process.env.NODE_ENV === "production") {
    config.IS_TEST = false
    config.IS_DEV = false
    config.IS_PROD = true
} else if (process.env.ENV === "test") { //TODO adapt for mocha
    config.IS_TEST = true
    config.IS_DEV = false
    config.IS_PROD = false
} else {
    config.IS_TEST = false
    config.IS_DEV = true
    config.IS_PROD = false
}

if (config.IS_DEV) {
    config.KRAKENKV_HOST = 'localhost'
} else {
    config.KRAKENKV_HOST = 'krakenkv'
}

if (config.IS_DEV) {
    config.ROOT_TOKEN = 'dev'
} else {
    config.ROOT_TOKEN = () => fs.readFileSync('/var/run/secrets/root_token', 'utf8')
}


if (config.IS_DEV) {
    config.REGISTRY_HOST = 'localhost'
} else {
    config.REGISTRY_HOST = 'registry'
}

if (config.IS_DEV) {
    config.API_HOST = 'localhost:8080'
} else {
    config.API_HOST = () => process.env.API_HOST
}

function isFunction(functionToCheck) {
    return functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';
}

var proxy = new Proxy(
    config,
    {
        get: function (obj, name) {
            if (typeof obj[name] === "undefined") {
                const logger = require("./lib/logger").default
                logger.fatal("undefined config value: " + String(name) + ". Avalable values: ", Object.keys(obj).join(", "))
                process.exit(1)
            }

            if (isFunction(obj[name])) {
                return obj[name]()
            } else {
                return obj[name]
            }
        },
    }
);

export default proxy
