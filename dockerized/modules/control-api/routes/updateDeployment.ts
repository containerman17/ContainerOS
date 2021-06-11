import express from 'express';
import database from "../../../lib/database"
import { assert, create } from 'superstruct'
import { DeploymentUpdate, ScaleCheck } from "../validators"


export default async function (req: express.Request, res: express.Response) {
    const validatedBody = create(req.body, DeploymentUpdate)
    assert(validatedBody.scale, ScaleCheck)

    await database.safePatch(`deployments/${validatedBody.name}`, (oldDeployment): object => {
        oldDeployment.currentConfig = validatedBody

        //TODO do not clear currentPodNames only if scale changed

        oldDeployment.currentPodNames = []
        return oldDeployment
    })


    return res.send({
        success: true,
        acceptedValues: validatedBody
    })
}