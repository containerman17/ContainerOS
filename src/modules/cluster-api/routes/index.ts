import logger from "../../../lib/logger"
import { Router } from 'express';
import updateMicroservice from "./updateMicroservice"
// import updateProject from "./updateProject"
// import testRegistryPassword from "./testRegistryPassword"
// import getDeploymentLogs from "./getMicroserviceLogs"
// import getDeploymentStatus from "./getMicroserviceStatus"
// import configRoute from "./config"

// import cleanTestData from "./testHelpers/cleanTestData"

import asyncHandler from "express-async-handler";


const routes = Router();

routes.all("/v1/microservice/update", asyncHandler(updateMicroservice))


export default routes