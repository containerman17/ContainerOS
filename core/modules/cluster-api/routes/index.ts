import updateDeployment from "./updateDeployment"
import updateProject from "./updateProject"
import testRegistryPassword from "./testRegistryPassword"
import getDeploymentLogs from "./getDeploymentLogs"
import configRoute from "./config"

import cleanTestData from "./testHelpers/cleanTestData"

import express from "express"

interface RouteMap {
    [key: string]: express.RequestHandler
}

const routeMap: RouteMap = {
    "/v1/updateDeployment": updateDeployment,
    "/v1/config": configRoute,
    "/v1/updateProject": updateProject,
    "/v1/public/testRegistryPassword": testRegistryPassword,
    "/v1/getDeploymentLogs": getDeploymentLogs,
    "/v1/testHelpers/cleanTestData": cleanTestData,
}

console.log('routeMap', routeMap)

export default routeMap