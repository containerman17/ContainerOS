import express from "express";
import { isReady as isNsStoreReady, getNamespace } from "../lib/namespaceStore"
import delay from "delay"
import { updateNamespace } from "../validators"
import { create } from 'superstruct'
import { HttpError, HttpCodes } from '../../../lib/http/Error';


export default async function (req: express.Request, res: express.Response) {
    //wait for some data to come from consul 
    if (!isNsStoreReady()) {
        for (let i = 0; i < 120; i++) {
            if (!isNsStoreReady()) {
                console.log('waiting for user list to load')
                await delay(1000)
            }
        }
        if (!isNsStoreReady()) throw new HttpError("Namespace store is not ready", HttpCodes.ServerError)
    }

    const validatedBody = create(req.body, updateNamespace)
    const key = `namespaces/${validatedBody.name}`
    if (!getNamespace(key)) {
        throw new HttpError("No user " + validatedBody.name, HttpCodes.Forbiddenn)
    }
    if (getNamespace(key).token !== validatedBody.token) {
        throw new HttpError("Wrong token for user " + validatedBody.name, HttpCodes.Forbiddenn)
    }

    return res.send({
        success: true,
        validatedBody
    })
}