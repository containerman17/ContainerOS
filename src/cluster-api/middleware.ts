import bodyParser from "body-parser"
import express from "express"
import cors from "cors"
import requestJoinMiddleware from "./requestJoinMiddleware";

export default {
    init(app: express.Application) {
        app.use(bodyParser.json());
        app.use(cors())
        app.use(requestJoinMiddleware)

        //TODO: add auth
    }
}