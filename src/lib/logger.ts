import { Logger, TLogLevelName } from "tslog";
import config from "../config"


let minLevel: TLogLevelName = 'silly'
if (config.get('IS_TEST')) {
    minLevel = "warn"
}

const logger = new Logger({
    overwriteConsole: false,
    displayFilePath: "displayAll",
    displayDateTime: false,
    minLevel: minLevel,
});

logger.info('Starting with env=' + config.get("ENV"))

export default logger
