import express from "express";

export default async function (req: express.Request, res: express.Response) {
    res.send({
        "hello": "world"
    })
}