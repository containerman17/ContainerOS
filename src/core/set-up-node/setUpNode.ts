import startConsul from "./startConsul";
import startRouter from "./startRouter";

import logger from "../../lib/logger"

export default async function () {
    await startConsul();
    await startRouter();
}