import Dockerode from "dockerode"
import { UNTOUCHABLE_CONTAINERS, NODE_NAME } from "../../config"
import { containerStatusValues, keyable, StoredContainerStatus } from "../../definitions"
import delay from "delay"
import convertDockerodeToCompose from "./convertDockerodeToCompose"
const docker = new Dockerode()

export default async function sync(containersToStart: Array<Dockerode.ContainerCreateOptions>, deleteContainers: boolean = true): Promise<StoredContainerStatus[]> {
    const composeJson = convertDockerodeToCompose(containersToStart)
    console.log(composeJson)
    // let yamlStr = yaml.dump(data);
    // fs.writeFileSync(`/tmp/docker-compose.yaml`, yamlStr)
    // await execa('/usr/bin/docker-compose', ['up', '-d'], { cwd: '/tmp' });
    // if (deleteContainers) {
    //      await execa('/usr/bin/docker-compose', ['up', '-d', '--remove-orphans'], { cwd: '/tmp' });
    // }
}


