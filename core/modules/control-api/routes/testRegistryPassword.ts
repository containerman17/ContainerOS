import express from "express";
import { keyable, StoredNamespace } from "../../../definitions";
import database from "../../../lib/database"
import delay from "delay"
import { DeploymentUpdate, ScaleCheck, updateNamespace } from "../validators"
import { assert, create } from 'superstruct'
import { HttpError, StructError, HttpCodes } from '../lib/Error';

let namespaceList: keyable<StoredNamespace> = null
database.listenForUpdates("namespaces", function (newNamespaceList: keyable<StoredNamespace>) {
    namespaceList = newNamespaceList
})

export default async function (req: express.Request, res: express.Response) {
    //wait for some data to come from consul 
    if (namespaceList === null) {
        for (let i = 0; i < 120; i++) {
            if (namespaceList === null) {
                console.log('waiting for user list to load')
                await delay(1000)
            }
        }
        if (namespaceList === null) return res.status(500).end()
    }

    const validatedBody = create(req.body, updateNamespace)
    const key = `namespaces/${validatedBody.name}`
    if (!namespaceList[key]) {
        throw new HttpError("No user " + validatedBody.name, HttpCodes.Forbiddenn)
    }
    if (namespaceList[key].token !== validatedBody.token) {
        throw new HttpError("Wrong token for user " + validatedBody.name, HttpCodes.Forbiddenn)
    }

    return res.send({
        success: true,
        validatedBody
    })
}