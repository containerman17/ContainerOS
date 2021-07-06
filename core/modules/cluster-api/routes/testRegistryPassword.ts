import express from "express";
import StoreCopy from "../../../lib/database/StoreCopy"
import { updateNamespace } from "../validators"
import { create } from 'superstruct'
import { HttpError, HttpCodes } from '../../../lib/http/Error';
import { StoredNamespace } from "../../../definitions"

const namespaceStore = new StoreCopy<StoredNamespace>("namespaces")

export default async function (req: express.Request, res: express.Response) {
    const validatedBody = create(req.body, updateNamespace)

    try {
        const ns = await namespaceStore.getKey(`namespaces/${validatedBody.name}`)

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