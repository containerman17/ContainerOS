import express from 'express';
import { assert, create } from 'superstruct'
import { AppUpdate, ScaleCheck } from "../validators"
import updateService from '../../lib/docker/updateService';

export default async function (req: express.Request, res: express.Response) {
    const validatedBody = create(req.body, AppUpdate)
    assert(validatedBody.scale, ScaleCheck)

    await updateService(validatedBody)

    return res.send({
        success: true,
        acceptedValues: validatedBody
    })
}