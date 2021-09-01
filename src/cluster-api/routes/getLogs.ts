import Dockerode from 'dockerode';
import express from 'express';
import { create } from 'superstruct'
import getServiceLogs from '../../lib/docker/getServiceLogs';
import { HttpCodes, HttpError } from '../../lib/http/Error';
import { AppWithTeam } from "../validators"
const docker = new Dockerode();

export default async function (req: express.Request, res: express.Response) {
    const validatedBody = create(req.body, AppWithTeam)


    let logs


    try {
        logs = await getServiceLogs(validatedBody.team + '_' + validatedBody.name)
        return res.send({
            success: true,
            logs: logs,
        })
    } catch (e) {
        if (e?.reason === "no such service") {
            throw new HttpError(HttpCodes.NotFound, "No such service")
        }
        throw e
    }
}