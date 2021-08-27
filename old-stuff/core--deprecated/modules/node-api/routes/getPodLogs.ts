import express from "express";
import Dockerode from "dockerode";
import { assert, create } from 'superstruct'
import { getPodLogsValidator } from "../validators";
import getContainerByName from "../../../lib/docker/getContainerByName"
import { HttpCodes, HttpError } from "../../../lib/http/Error";
import getContainerLogs from "../../../lib/docker/getContainerLogs"
const docker = new Dockerode();
import getContainersByPod from "../../../lib/docker/getContainersByPod";

export default async function (req: express.Request, res: express.Response) {

    const validatedBody = create(req.body, getPodLogsValidator)

    const containers = await getContainersByPod(validatedBody.name)

    const promises = []
    const result = {}

    for (let cont of containers) {
        const contName = cont.Labels['org.containeros.pod.containerName']
        promises.push(getContainerLogs(cont.Id)
            .then(logs => result[contName] = logs))
    }

    await Promise.all(promises)

    return res.send(result)
}