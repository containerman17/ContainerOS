import express from 'express';
import config from '../../config';
import middleware from "./middleware"
import { HttpError, StructError, HttpCodes } from '../../lib/http/Error';
import logger from '../../lib/logger';
const app = express();
app.get('/', (req, res) => res.send('ContainerOS cluster API server'));

//middleware
middleware.init(app);

//routes
import routes from "./routes"
app.use('/', routes);


function start(skipListening: boolean = false): express.Router {
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
                app: 'cluster-api'
            });
        } else {//Unexpected error
            logger.error("Unexpected error", err)
            res.status(HttpCodes.ServerError).send({
                errorMessage: "Internal server error. Please contact technical support.",
                statusCode: HttpCodes.ServerError
            });
        }
    });

    if (!skipListening) {
        app.listen(config.get("CLUSTER_API_PORT"), () => {
            logger.info(`⚡️[server]: Server is running at port ${config.get("CLUSTER_API_PORT")}`);
        });
    }

    return app
}

export default { start }

// if (require.main === module) {
//     start();
// }