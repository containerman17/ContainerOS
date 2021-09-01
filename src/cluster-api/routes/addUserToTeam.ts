import express from 'express';
import { create } from 'superstruct'
import { UserTeamUpdate } from "../validators"
import { updateUser as updateUserInDatabase, getUser } from "../../lib/database"
import { StoredUser } from '../../types';

export default async function (req: express.Request, res: express.Response) {
    const validatedBody = create(req.body, UserTeamUpdate)

    await updateUserInDatabase(validatedBody.name, function (user: StoredUser): StoredUser {
        if (user.teams.indexOf(validatedBody.team) === -1) {
            user.teams.push(validatedBody.team)
        }
        return user
    })

    return res.send({
        success: true,
        debug: await getUser(validatedBody.name)
    })
}