// import express from "express";
// import database from "../../../../lib/database"
// import { namesArray } from "../../validators"
// import { create } from 'superstruct'
// import { StoredDeployment, StoredProject } from "../../../../definitions"
// import getStoreCopy from "../../../../lib/database/getStoreCopy"

// const projectStore = getStoreCopy<StoredProject>("projects")
// const deploymentStore = getStoreCopy<StoredDeployment>("deployments")


// export default async function (req: express.Request, res: express.Response) {
//     const [allProjectKeys, allDeploymentKeys] = await Promise.all([
//         await projectStore.getAllKeys(),
//         await deploymentStore.getAllKeys(),
//     ])

//     const promises = []
//     const keysDeleted = []
//     for (let key of [...allProjectKeys, ...allDeploymentKeys]) {
//         if (key.indexOf('/test') !== -1) {
//             promises.push(database.deletePath(key))
//             keysDeleted.push(key)
//         }
//     }
//     await Promise.all(promises)

//     return res.send({
//         success: true,
//         keysDeleted
//     })
// }