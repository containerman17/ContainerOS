import { Request, Response } from "express";
import { REGISTRY_DOMAIN } from "../../../config";

export default async function (req: Request, res: Response) {
    res.send({
        REGISTRY_DOMAIN
    })
}