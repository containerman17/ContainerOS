import express from 'express';
import { database } from "containeros-sdk"
import { assert, create } from 'superstruct'
import { MicroserviceUpdate, ScaleCheck } from "../validators"


export default async function (req: express.Request, res: express.Response) {
    const validatedBody = create(req.body, MicroserviceUpdate)
    assert(validatedBody.scale, ScaleCheck)

    await database.microservice.smartUpdate(validatedBody)

    return res.send({
        success: true,
        acceptedValues: validatedBody
    })
}