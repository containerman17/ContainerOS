import database from '../../lib/database'
import { keyable, StoredRoute } from '../../types'

type CaddyConfig = any//TOOD: define type

function ConfigGenerator() {
    const callbacks: ((CaddyConfig) => void)[] = []

    const regenerateConfig = function (routes: keyable<StoredRoute>) {
        const config: CaddyConfig = {
            routes: Object.keys(routes).map(key => {
                const route = routes[key]
                return route
            })
        }
        callbacks.forEach(callback => callback(config))
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