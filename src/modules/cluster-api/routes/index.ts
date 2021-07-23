import logger from "../../../lib/logger"

import updateMicroservice from "./updateMicroservice"
// import updateProject from "./updateProject"
// import testRegistryPassword from "./testRegistryPassword"
// import getDeploymentLogs from "./getMicroserviceLogs"
// import getDeploymentStatus from "./getMicroserviceStatus"
// import configRoute from "./config"

// import cleanTestData from "./testHelpers/cleanTestData"

import { RequestHandler } from "express"

interface RouteMap {
    [key: string]: RequestHandler
}

const routeMap: RouteMap = {
    "/v1/updateMicroservice": updateMicroservice,
    // "/v1/config": configRoute,
    // "/v1/updateProject": updateProject,
    // "/v1/public/testRegistryPassword": testRegistryPassword,
    // "/v1/getDeploymentLogs": getDeploymentLogs,
    // "/v1/getDeploymentStatus": getDeploymentStatus,
    // "/v1/testHelpers/cleanTestData": cleanTestData,
}

logger.debug('routeMap', routeMap)

export default routeMap