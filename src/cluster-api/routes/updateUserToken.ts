import express from 'express';
import { create } from 'superstruct'
import { UserTokenUpdate } from "../validators"
import { updateUser as updateUserInDatabase, getUser } from "../../lib/database"
import { StoredUser } from '../../types';

export default async function (req: express.Request, res: express.Response) {
    const validatedBody = create(req.body, UserTokenUpdate)

    await updateUserInDatabase(validatedBody.name, function (user: StoredUser): StoredUser {
        user.tokenHash = validatedBody.tokenHash
        return user
    })

    return res.send({
        success: true,
        debug: await getUser(validatedBody.name)
    })
}