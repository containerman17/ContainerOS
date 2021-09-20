import { Router } from 'express';
import updateApp from "./updateApp"
import asyncHandler from "express-async-handler";
import requestJoinMiddleware from "../requestJoinMiddleware";
import updateUserToken from "./updateUserToken";
import addUserToTeam from "./addUserToTeam"
import getLogs from "./getLogs"
import deleteApp from "./deleteApp"

const routes = Router();

//apps
routes.get("/v1/app/:team/:name/logs", requestJoinMiddleware, asyncHandler(getLogs))
routes.post("/v1/app/:team/:name", requestJoinMiddleware, asyncHandler(updateApp))
routes.post("/v1/app/:team/:name/delete", requestJoinMiddleware, asyncHandler(deleteApp))

//users
routes.post("/v1/users/:name/token", requestJoinMiddleware, asyncHandler(updateUserToken))
routes.post("/v1/users/:name/teams/add", requestJoinMiddleware, asyncHandler(addUserToTeam))

export default routes