import { API_PASSWORD } from "../../config"
import bodyParser from "body-parser"
import express from "express"
import { HttpError, HttpCodes } from "./lib/Error"

export default {
    init(app: express.Application) {
        app.use(bodyParser.json());

        app.use(function (req, res, next) {
            //соберем все данные по запросу
            req.body = Object.assign({}, req.query, req.body)
            next()
        })

        app.use(function (req, res, next) {
            if (req.body.password !== API_PASSWORD) {
                return next(new HttpError("Wromg password", HttpCodes.Forbiddenn))
            } else {
                delete req.body.password
                return next()
            }

        })

    }
}