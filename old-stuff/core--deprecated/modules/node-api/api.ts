import express from 'express';
import { NODE_API_PORT } from '../../config';
import asyncHandler from "express-async-handler";
import middleware from "./middleware"
import { HttpError, StructError, HttpCodes } from '../../lib/http/Error';

import getPodLogs from "./routes/getPodLogs"
import getContainerLogs from "./routes/getContainerLogs"

const app = express();
app.get('/', (req, res) => res.send('ContainerOS node API server'));

//middleware
middleware.init(app);

//routes
app.get("/v1/podLogs", asyncHandler(getPodLogs))
app.get("/v1/containerLogs", asyncHandler(getContainerLogs))

function start(): void {
    app.listen(NODE_API_PORT, () => {
        console.log(`⚡️[server]: Server is running at port ${NODE_API_PORT}`);
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
                app: 'node-api'
            });
        } else {//Unexpected error
            console.error("Unexpected error", err)
            res.status(HttpCodes.ServerError).send({
                errorMessage: "Internal server error. Please contact technical support.",
                statusCode: HttpCodes.ServerError
            });
        }
    });
}

export default { start }

if (require.main === module) {
    start();
}