import startConsul from "./startConsul";
import logger from "../../lib/logger"

export default async function () {
    await startConsul();
}