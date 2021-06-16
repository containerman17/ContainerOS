import express from "express";
import database from "../../../lib/database"

export default async function (req: express.Request, res: express.Response) {
    const dbResponse = await database.getServers();
    console.log('dbResponse', dbResponse)
    res.send(dbResponse)
}