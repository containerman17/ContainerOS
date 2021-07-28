import { Logger, TLogLevelName } from "tslog";
import config from "../config"

let minLevel: TLogLevelName = 'silly'
if (config.get('IS_TEST')) {
    minLevel = "warn"
}

export default new Logger({
    overwriteConsole: false,
    displayFilePath: "displayAll",
    displayDateTime: false,
    minLevel: minLevel,
});
