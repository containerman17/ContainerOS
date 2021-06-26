import updateDeployment from "./updateDeployment"
import getNodes from "./getNodes"
import updateNamespace from "./updateNamespace"

import express from "express"

interface RouteMap {
    [key: string]: express.RequestHandler
}

const routeMap: RouteMap = {
    "/v1/updateDeployment": updateDeployment,
    "/v1/getNodes": getNodes,
    "/v1/updateNamespace": updateNamespace,
}

console.log('routeMap', routeMap)

export default routeMap