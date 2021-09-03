import bodyParser from "body-parser"
import express from "express"
import cors from "cors"
import requestJoinMiddleware from "./requestJoinMiddleware";
import { getUserCached } from "../lib/database";
import { HttpCodes, HttpError } from "../lib/http/Error";
import { sha256 } from "../lib/utils";
import { StoredUser } from "../types";
import config from "../config"

export default {
    init(app: express.Application) {
        app.use(bodyParser.json());
        app.use(cors())
        app.use(requestJoinMiddleware)

        //docker registry auth
        app.use('/', async (req, res, next) => {
            try {
                if (new RegExp('^/.+/.+/blobs/uploads/.+-.+-?_state=.+$').test(req.url)) {
                    return res.status(200).end()
                }

                if (!req.headers.authorization) {
                    res.set('WWW-Authenticate', `Basic realm="ContainerOS"`)
                    return res.status(401).end()
                }
                const [login, password] = Buffer.from(req.headers.authorization.split(" ")[1], 'base64').toString().split(':')

                const user: StoredUser = await getUserCached(login)

                console.log({
                    'req.headers.authorization': req.headers.authorization,
                    url: req.url, login, password, user
                })

                //root allowed everything
                if (login === 'root' && password === config.ROOT_TOKEN) {
                    return next();
                }
                //sorry user not found
                if (user === null) {
                    return next(new HttpError(HttpCodes.Unauthorized, `Unknown user "${login}"`))
                }
                //check password
                if (sha256(password) !== user.tokenHash) {
                    return next(new HttpError(HttpCodes.Unauthorized, `Wrong password or token for user "${login}"`))
                }
                //docker registry auth request
                if (req.url === '/v2/') {
                    return next()
                }

                //docker registry access with namespace
                if (req.url.startsWith('/v2/')) {
                    const namespace = req.url.split('/')[2]
                    console.log({ url: req.url, namespace })
                    if (user.teams.indexOf(namespace) === -1) {
                        return next(new HttpError(HttpCodes.Forbiddenn, `User "${login}" is not a member of ${namespace}`))
                    } else {
                        return next();
                    }
                } else {
                    return next(new HttpError(HttpCodes.Forbiddenn, `Unknown url "${req.url}"`))
                }
            } catch (e) {
                next(e)
            }
        });
    }
}