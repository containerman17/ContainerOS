import express from 'express';
import database from "../../../lib/database"
import { assert, create } from 'superstruct'
import { DeploymentUpdate, ScaleCheck, updateNamespace } from "../validators"


export default async function (req: express.Request, res: express.Response) {
    const validatedBody = create(req.body, updateNamespace)

    await database.safePatch(`namespaces/${validatedBody.name}`, (oldNamespace): object => {
        return Object.assign({}, oldNamespace, validatedBody)
    })

    return res.send({
        success: true,
        validatedBody
    })
}
