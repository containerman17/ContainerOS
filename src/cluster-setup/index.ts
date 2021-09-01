import stackDeploy from "../lib/docker/stackDeploy";
import fs from "fs";
import path from "path";
import axios from "axios";
import mustache from "mustache";
import config from "../config"
import logger from "../lib/logger"

async function start() {
    const templateYaml = fs.readFileSync(path.join(__dirname, "../..", "cluster-setup/cluster-config.yaml"), "utf8");
    const resultYaml = mustache.render(templateYaml, config, {}, ['<%', '%>'])
    logger.debug(resultYaml)
    await stackDeploy(resultYaml, 'containeros-system')
}

async function getMyExternalIP() {
    const res = await axios.get('https://api.ipify.org?format=json')
    return res.data.ip
}

//TODO: create caddy net
// docker network create -d overlay --attachable caddy

start().catch(e => {
    console.error(e)
    process.exit(1)
})