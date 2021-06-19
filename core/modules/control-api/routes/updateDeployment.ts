import express from 'express';
import database from "../../../lib/database"
import { assert, create } from 'superstruct'
import { DeploymentUpdate, ScaleCheck } from "../validators"


export default async function (req: express.Request, res: express.Response) {
    const validatedBody = create(req.body, DeploymentUpdate)
    assert(validatedBody.scale, ScaleCheck)

    await database.safePatch(`deployments/${validatedBody.name}`, (oldDeployment): object => {

        console.log('oldDeployment.currentConfig', oldDeployment.currentConfig)
        console.log('validatedBody', validatedBody)

        //TODO: update only if config changed
        const needNewPods = true
        if (needNewPods) {
            oldDeployment.currentPodNames = []
        }

        oldDeployment.currentConfig = validatedBody

        return oldDeployment
    })


    return res.send({
        success: true,
        acceptedValues: validatedBody
    })
}