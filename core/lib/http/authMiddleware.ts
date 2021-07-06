import { HttpError, HttpCodes } from '../../lib/http/Error';
import { API_PASSWORD } from "../../config"

export default function authMiddleware(allowedPrefixes: string[] = []) {
    return function (req, res, next) {
        if (req.path.startsWith(`/v1/public/`)) {
            return next()
        }
        if (req.body.password !== API_PASSWORD) {
            return next(new HttpError("Wrong password", HttpCodes.Forbiddenn))
        } else {
            delete req.body.password
            return next()
        }

    }
}