import { StructError } from "superstruct"

export enum HttpCodes {
    OK = 200,
    BadRequest = 400,
    Unauthorized,
    PaymentRequired,
    Forbiddenn,
    NotFound,
}

export class HttpError extends Error {
    statusCode: number
    constructor(message: string, statusCode: HttpCodes) {
        super(message);
        this.statusCode = statusCode;

        Object.setPrototypeOf(this, HttpError.prototype);
    }
}

export { StructError as StructError }