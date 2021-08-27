import configGenerator, { CaddyRoute, CaddySrvConfig } from "./configGenerator";
import axios from "axios";
import { database } from "containeros-sdk"
import util from "util"
import { printCaddyFile } from "./dbg"

printCaddyFile()

//everything happening here is so dirty and has to be done using srv

let lastConfig = null
async function hackReapplyConfig() {
    if (lastConfig === null) return

    const newConfig = await transformSRVHack(lastConfig)
    await axios.post("http://localhost:2019/config/apps/http/", { "servers": { "srv0": newConfig } })
    console.log('New config pushed to caddy', util.inspect(newConfig, false, null, true /* enable colors */))
}

setInterval(hackReapplyConfig, 5000)

configGenerator.onConfigChanged(async config => {
    console.log("Config changed", config);
    lastConfig = config
    await hackReapplyConfig()
})

async function transformSRVHack(config: CaddySrvConfig) {
    const newCaddyConf = JSON.parse(JSON.stringify(config))//could be slow especially with 1000+ routes
    newCaddyConf.routes = await Promise.all(
        newCaddyConf.routes.map(async route => await SRVHackSignleRoute(route))
    )
    return newCaddyConf
}

async function SRVHackSignleRoute(route: CaddyRoute): Promise<CaddyRoute> {
    if (route.handle.length !== 1
        || route.handle[0].routes.length !== 1
        || route.handle[0].routes[0].handle.length !== 1
        || route.handle[0].routes[0].handle[0].upstreams.length !== 1
    ) {
        console.error("Got route", route)
        throw "Unexpected route structure.Please check in file worker.ts"
    }
    const serviceName = route.handle[0].routes[0].handle[0].upstreams[0].dial
        .split('srv+http://').join('')
        .split('.service.consul').join('')

    const endpoints = await database.services.getServiceEndpoints(serviceName)

    route.handle[0].routes[0].handle[0].upstreams = endpoints
        .map(endpoint => ({ dial: endpoint }))

    return route
}