import stackDeploy from "../lib/docker/stackDeploy";
import fs from "fs";
import path from "path";
import mustache from "mustache";
import config from "../config"
import logger from "../lib/logger"
import execa from "execa"

async function start() {
    //set up stack
    const templateYaml = fs.readFileSync(path.join(__dirname, "../..", "installer/cluster-config.yaml"), "utf8");
    const resultYaml = mustache.render(templateYaml, config, {}, ['<%', '%>'])
    logger.debug(resultYaml)
    await stackDeploy(resultYaml, 'containeros-system')
}

start().catch(e => {
    console.error(e)
    process.exit(1)
})
