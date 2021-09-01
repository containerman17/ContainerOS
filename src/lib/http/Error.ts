import { StructError } from "superstruct"

export enum HttpCodes {
    OK = 200,
    BadRequest = 400,
    Unauthorized,
    PaymentRequired,
    Forbiddenn,
    NotFound,
    ServerError = 500
}

export class HttpError extends Error {
    statusCode: number
    constructor(statusCode: HttpCodes, message: string) {
        super(message);
        this.statusCode = statusCode;

        Object.setPrototypeOf(this, HttpError.prototype);
    }
}

export { StructError as StructError }