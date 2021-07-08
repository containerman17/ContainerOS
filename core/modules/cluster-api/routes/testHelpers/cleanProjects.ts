import express from "express";
import database from "../../../../lib/database"
import { namesArray } from "../../validators"
import { create } from 'superstruct'


export default async function (req: express.Request, res: express.Response) {
    const validatedBody = create(req.body, namesArray)

    const result = await Promise.all(
        validatedBody.names.map(name => database.deletePath(`projects/${name}`))
    )

    return res.send({
        success: true,
        names: validatedBody.names,
        result
    })
}