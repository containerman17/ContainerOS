import { HttpError, HttpCodes } from './Error';
import logger from '../logger';
export default function authMiddleware(apiPassword: string, allowedPrefixes: string[] = []) {
    return function (req, res, next) {
        if (req.path.startsWith(`/v1/public/`)) {
            return next()
        }
        if (req.body.password !== apiPassword) {
            logger.debug(`provided password ${req.body.password}, expected ${apiPassword}`)
            return next(new HttpError("Wrong password", HttpCodes.Forbiddenn))
        } else {
            delete req.body.password
            return next()
        }

    }
}