import express from "express";
import database from "../../../lib/database"
import { HttpCodes, HttpError } from "../../../lib/http/Error";
import { GetDeploymentLogsValidator } from "../validators";
import { create } from 'superstruct'
import { StoredDeployment } from "../../../definitions";

export default async function (req: express.Request, res: express.Response) {
    const { name } = create(req.body, GetDeploymentLogsValidator)

    const deployment: StoredDeployment | null = await database.getPath(`deployments/${name}`, null)
    if (deployment === null) {
        throw new HttpError(`Deployment ${name} is not found in this ContainerOS cluster`, HttpCodes.NotFound)
    }

    const podInfo = await Promise.all(deployment.currentPodNames.map(podName => database.getPath(`pod/${name}`, null)))

    return res.send({
        name,
        pods: deployment.currentPodNames,
        podInfo
    })
}