import updateDeployment from "./updateDeployment"
import express from "express"

interface RouteMap {
    [key: string]: express.RequestHandler
}

const routeMap: RouteMap = {
    "/updateDeployment": updateDeployment,
}

export default routeMap