import express from "express";
import getStoreCopy from "../../../lib/database/getStoreCopy"
import { updateProject } from "../validators"
import { create } from 'superstruct'
import { HttpError, HttpCodes } from '../../../lib/http/Error';
import { StoredProject } from "../../../definitions"

const projectStore = getStoreCopy<StoredProject>("projects")

export default async function (req: express.Request, res: express.Response) {
    const validatedBody = create(req.body, updateProject)

    try {
        const ns = await projectStore.getKey(`projects/${validatedBody.name}`)

        if (!ns) {
            throw new HttpError("No user " + validatedBody.name, HttpCodes.Forbiddenn)
        }
        if (ns.token !== validatedBody.token) {
            throw new HttpError("Wrong token for user " + validatedBody.name, HttpCodes.Forbiddenn)
        }

        return res.send({
            success: true,
            validatedBody
        })
    } catch (e) {
        if (typeof e === "string") {
            throw new HttpError(e, HttpCodes.ServerError)
        } else {
            throw e
        }
    }

}