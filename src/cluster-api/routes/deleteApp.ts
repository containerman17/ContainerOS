import Dockerode from 'dockerode';
import express from 'express';
import { AppWithTeam } from "../validators"
import { create } from 'superstruct'
import stackDeploy from '../../lib/docker/stackDeploy';
import { updateStack as updateStackInDatabase, getStack } from "../../lib/database"
import yaml from "js-yaml"
import logger from '../../lib/logger';
import { DockerStack } from '../../types';

export default async function (req: express.Request, res: express.Response) {
    const validatedBody = create(req.body, AppWithTeam)

    await updateStackInDatabase(validatedBody.team, function (stack: DockerStack): DockerStack {
        stack.services[validatedBody.name] = undefined
        return stack
    })

    const stack = await getStack(validatedBody.team)
    logger.debug("Deploing stack", yaml.dump(stack))

    await stackDeploy(yaml.dump(stack), validatedBody.team)

    return res.send({
        success: true,
        debug: validatedBody
    })
}