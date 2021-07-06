import express from "express";
import Dockerode from "dockerode";
import { assert, create } from 'superstruct'
import { getContainerLogs as getContainerLogsValidator } from "../validators";
import getContainerByName from "../../../lib/docker/getContainerByName"
import { HttpCodes, HttpError } from "../../../lib/http/Error";
import parseDockerBuffer from "../../../lib/docker/parseDockerBuffer"
const docker = new Dockerode();

export default async function (req: express.Request, res: express.Response) {

    const validatedBody = create(req.body, getContainerLogsValidator)

    const container = await getContainerByName(validatedBody.name)
    if (container === null) {
        throw new HttpError(`Container ${validatedBody.name} is not found on this node`, HttpCodes.NotFound)
    }

    // @ts-ignore: wrong ts typing
    const buffer: Buffer = await docker.getContainer(container.Id).logs({
        follow: false,
        stdout: true,
        stderr: true,
        timestamps: true,
        tail: 500,
        details: true
    })

    return res.send(parseDockerBuffer(buffer, true))
}