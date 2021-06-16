import updateDeployment from "./updateDeployment"
import getNodes from "./getNodes"

import express from "express"

interface RouteMap {
    [key: string]: express.RequestHandler
}

const routeMap: RouteMap = {
    "/updateDeployment": updateDeployment,
    "/getNodes": getNodes,
}

export default routeMap