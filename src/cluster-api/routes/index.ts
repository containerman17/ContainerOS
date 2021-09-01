import { Router } from 'express';
import updateApp from "./updateApp"
import asyncHandler from "express-async-handler";
import requestJoinMiddleware from "../requestJoinMiddleware";
import updateUserToken from "./updateUserToken";
import addUserToTeam from "./addUserToTeam"

const routes = Router();

routes.post("/v1/app/:team/:name", requestJoinMiddleware, asyncHandler(updateApp))
routes.post("/v1/users/:name/token", requestJoinMiddleware, asyncHandler(updateUserToken))
routes.post("/v1/users/:name/teams/add", requestJoinMiddleware, asyncHandler(addUserToTeam))

export default routes