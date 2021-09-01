import stackDeploy from "../lib/docker/stackDeploy";
import fs from "fs";
import path from "path";

async function start() {
    const yaml = fs.readFileSync(path.join(__dirname, "../..", "cluster-setup/cluster-config.yaml"), "utf8");
    await stackDeploy(yaml, 'containeros-system')
}

start().catch(e => {
    console.error(e)
    process.exit(1)
})
