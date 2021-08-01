import express from "express";
import Dockerode from "dockerode";
import { assert, create } from 'superstruct'
import { getContainerLogsValidator } from "../validators";
import getContainerByName from "../../../lib/docker/getContainerByName"
import { HttpCodes, HttpError } from "../../../lib/http/Error";
import getContainerLogs from "../../../lib/docker/getContainerLogs"
const docker = new Dockerode();

export default async function (req: express.Request, res: express.Response) {

    const validatedBody = create(req.body, getContainerLogsValidator)

    const container = await getContainerByName(validatedBody.name)
    if (container === null) {
        throw new HttpError(`Container ${validatedBody.name} is not found on this node`, HttpCodes.NotFound)
    }

    return res.send(await getContainerLogs(container.Id, true))
}