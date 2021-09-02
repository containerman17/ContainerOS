import bodyParser from "body-parser"
import express from "express"
import cors from "cors"
import requestJoinMiddleware from "./requestJoinMiddleware";
import { getUserCached } from "../lib/database";
import { HttpCodes, HttpError } from "../lib/http/Error";
import { sha256 } from "../lib/utils";
import { StoredUser } from "../types";

export default {
    init(app: express.Application) {
        app.use(bodyParser.json());
        app.use(cors())
        app.use(requestJoinMiddleware)

        //docker registry auth
        app.use('/v2/', async (req, res, next) => {
            try {
                if (!req.headers.authorization) {
                    res.set('WWW-Authenticate', `Basic realm="Dockerize"`)
                    return res.status(401).end()
                }
                const [login, password] = Buffer.from(req.headers.authorization.split(" ")[1], 'base64').toString().split(':')

                const user: StoredUser = await getUserCached(login)

                console.log({
                    'req.headers.authorization': req.headers.authorization,
                    login, password, user
                })

                if (user === null) {
                    return next(new HttpError(HttpCodes.Unauthorized, `Unknown user "${login}"`))
                }
                if (sha256(password) !== user.tokenHash) {
                    return next(new HttpError(HttpCodes.Unauthorized, `Wrong password or token for user "${login}"`))
                }
                next();
            } catch (e) {
                next(e)
            }
        });
    }
}