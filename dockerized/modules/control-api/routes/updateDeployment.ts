import express from 'express';
import database from "../../../lib/database"
import { assert, create } from 'superstruct'
import { DeploymentUpdate, ScaleCheck } from "../validators"


export default async function (req: express.Request, res: express.Response) {
    const validatedBody = create(req.body, DeploymentUpdate)
    assert(validatedBody.scale, ScaleCheck)

    await database.upsertDeployment(req.body)

    return res.send({
        success: true,
        acceptedValues: validatedBody
    })
}