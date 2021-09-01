const config = {
    ENV: 'dev',
    CLUSTER_API_PORT: 8080,
    MAX_APP_SCALING: 10,
    IS_TEST: undefined,
    IS_DEV: undefined,
    IS_PROD: undefined,
    CONSUL_HOST: undefined
}

if (process.env.ENV === "production") {
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
    config.CONSUL_HOST = 'localhost'
} else {
    config.CONSUL_HOST = 'consul1'
}


var proxy = new Proxy(
    config,
    {
        get: function (obj, name) {
            if (typeof obj[name] === undefined) {
                throw Error(`Trying to get ${String(name)} config value, which is not initialized(yet)`)
            }
            return obj[name];
        },
    }
);

export default proxy
