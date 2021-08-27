import logger from "../../lib/logger"
import { Router } from 'express';
import updateApp from "./updateApp"
import asyncHandler from "express-async-handler";
import requestJoinMiddleware from "../requestJoinMiddleware";


const routes = Router();

routes.post("/v1/app/:namespace/:name", requestJoinMiddleware, asyncHandler(updateApp))


export default routes