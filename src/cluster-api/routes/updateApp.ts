import express from 'express';
import { assert, create } from 'superstruct'
import { AppUpdate, ScaleCheck } from "../validators"
import updateService from '../../lib/docker/updateService';
import { DockerStack, updateStack as updateStackInDatabase } from "../../lib/database"

export default async function (req: express.Request, res: express.Response) {
    const validatedBody = create(req.body, AppUpdate)
    assert(validatedBody.scale, ScaleCheck)

    await updateStackInDatabase(validatedBody.namespace, function (stack: DockerStack): DockerStack {
        stack.services[validatedBody.name] = {
            image: validatedBody.image,
            networks: {
                [validatedBody.namespace]: {
                    aliases: [`${validatedBody.namespace}--${validatedBody.namespace}`]
                }
            },
        }
        return stack
    })

    return res.send({
        success: true,
        acceptedValues: validatedBody
    })
}