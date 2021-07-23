// import express from "express";
// import { HttpCodes, HttpError } from "../../../lib/http/Error";
// import { OnlyNameValidator } from "../validators";
// import { create } from 'superstruct'
// import { containerStatusValues, deploymentStatusValue, keyable, NodeHealth, podStatusValue, StoredContainerStatus, StoredDeployment, StoredPod } from "../../../definitions";
// import database from "../../../lib/database"
// import axios from "axios"
// import { API_PASSWORD, NODE_API_PORT } from "../../../config";

// export default async function (req: express.Request, res: express.Response) {
//     const { name } = create(req.body, OnlyNameValidator)

//     //still not sure what's better - to ask consul every time or form watchers

//     const deployment: StoredDeployment = await database.getPath(`deployments/${name}`, null)

//     if (deployment === null) {
//         throw new HttpError(`Deployment ${name} is not found in this ContainerOS cluster`, HttpCodes.NotFound)
//     }

//     const byContainer = {

//     }
//     const podStatuses: keyable<podStatusValue> = {}
//     let promises = []
//     for (let podName of [...deployment.currentPodNames, 'unknown']) {
//         promises.push(
//             database.getPathRecurse(`podHealth/${podName}`, null)
//                 .then((statusFromDb: keyable<StoredContainerStatus>) => {
//                     if (statusFromDb) {
//                         let hasNonRunning = Object.values(statusFromDb)
//                             .filter(podStatus => podStatus.status !== "started")
//                             .length > 0
//                         podStatuses[podName] = hasNonRunning
//                             ? "unhealthy"
//                             : "healthy"
//                     } else {
//                         podStatuses[podName] = "unhealthy"
//                     }
//                 })
//         )
//     }
//     await Promise.all(promises)

//     const stats = {
//         healthy: 0,
//         unhealthy: 0,
//     }

//     for (let value of Object.values(podStatuses)) {
//         stats[value] = stats[value] || 0
//         stats[value]++
//     }

//     let deploymentStatus: deploymentStatusValue
//     if (stats["healthy"] === 0) {
//         deploymentStatus = "unhealthy"
//     } else if (stats["unhealthy"] === 0) {
//         deploymentStatus = "healthy"
//     } else {
//         deploymentStatus = "partially_healthy"
//     }

//     return res.send({
//         status: deploymentStatus,
//         pods: podStatuses
//     })
// }