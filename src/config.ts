const config = {
    ENV: 'dev',
    CLUSTER_API_PORT: 8080,
    MAX_APP_SCALING: 10,
    IS_TEST: undefined
}
config.IS_TEST = false

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
