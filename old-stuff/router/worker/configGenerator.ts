import { database, keyable, StoredRoute } from 'containeros-sdk'

export type CaddySrvConfig = {
    listen: string[]
    routes: CaddyRoute[]
}

export type CaddyRoute = {
    handle: {
        handler: string,
        routes: {
            handle: {
                handler: "reverse_proxy",
                upstreams: {
                    dial: string
                }[]
            }[]
        }[]
    }[],
    match: { host: [string] }[],
    terminal: boolean,
}

function ConfigGenerator() {
    const callbacks: ((CaddyConfig) => void)[] = []

    const regenerateConfig = function (routes: keyable<StoredRoute>) {
        const caddyConf: CaddySrvConfig = {
            "listen": [":443"],
            "routes": []
        }

        for (let route of Object.values(routes)) {
            caddyConf.routes.push({
                "handle": [{
                    "handler": "subroute",
                    "routes": [{
                        "handle": [{
                            "handler": "reverse_proxy",
                            "upstreams": [
                                { "dial": `srv+http://${route.service}.service.consul` }
                            ]
                        }]
                    }]
                }],
                "match": [{ "host": [route.domain] }],
                "terminal": true
            })
        }

        callbacks.forEach(callback => callback(caddyConf))
    }

    return {
        onConfigChanged(callback: (CaddyConfig) => void) {
            if (callbacks.length === 0) {
                database.routes.addListChangedCallback(regenerateConfig)
            }
            callbacks.push(callback)
        },
        offConfigChanged(callback: (CaddyConfig) => void) {
            callbacks.splice(callbacks.indexOf(callback), 1)
            if (callbacks.length === 0) {
                database.routes.removeListChangedCallback(regenerateConfig)
            }
        }
    }
}

export default ConfigGenerator()