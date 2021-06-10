import express from 'express';
import { API_PORT } from '../../config';
import asyncHandler from "express-async-handler";
import middleware from "./middleware"
import { HttpError, StructError, HttpCodes } from './lib/Error';

const app = express();
app.get('/', (req, res) => res.send('Express + TypeScript Server'));

//middleware
middleware.init(app);

//routes
import routes from "./routes"
import { STATUS_CODES } from 'http';
for (let routePath of Object.keys(routes)) {
    app.all(routePath, asyncHandler(routes[routePath]))
}


function start(): void {

    app.listen(API_PORT, () => {
        console.log(`⚡️[server]: Server is running at port ${API_PORT}`);
    });


    app.use(function onError(e: HttpError, req: express.Request, res: express.Response, next: Function) {
        let err = e
        if (err instanceof StructError) {
            let message = e.message
            if (err.failures()[0]) {
                message += `. Expected format: ${err.failures()[0].refinement}`
            }
            err = new HttpError(message, HttpCodes.BadRequest)
        }

        if (err instanceof HttpError) {
            res.status(err.statusCode).send({
                errorMessage: err.message,
                statusCode: err.statusCode,
                app: 'control-api'
            });
        } else {//Unexpected error
            console.error("Unexpected error", err)
            res.status(500).send({
                errorMessage: "Internal server error. Please contact technical support.",
                statusCode: 500
            });
        }
    });
}

export default { start }

if (require.main === module) {
    start();
}