import Dockerode from "dockerode"
import convertDockerodeToCompose from "./convertDockerodeToCompose"
import yaml from "js-yaml"
import fs from "fs"
import execa from "execa"


export default async function sync(containersToStart: Array<Dockerode.ContainerCreateOptions>, deleteContainers: boolean = true): void {
    const composeParams = deleteContainers
        ? ['up', '-d', '--remove-orphans']
        : ['up', '-d']

    const composeJson = convertDockerodeToCompose(containersToStart)
    let yamlStr = yaml.dump(composeJson);

    fs.writeFileSync(`/tmp/docker-compose.yaml`, yamlStr)

    const composeResponse = await execa('/usr/bin/docker-compose', composeParams, { cwd: '/tmp' });

    console.log('composeResponse', composeResponse.stderr)
}


