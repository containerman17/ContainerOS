import Dockerode from "dockerode"
import { UNTOUCHABLE_CONTAINERS, NODE_NAME } from "../../config"
import { containerStatusValues, keyable, StoredContainerStatus } from "../../definitions"
import delay from "delay"
import convertDockerodeToCompose from "./convertDockerodeToCompose"
import yaml from "js-yaml"
import fs from "fs"
import execa from "execa"
const docker = new Dockerode()

const pullErrorsCache = {}

export default async function sync(containersToStart: Array<Dockerode.ContainerCreateOptions>, deleteContainers: boolean = true): Promise<StoredContainerStatus[]> {
    const composeParams = deleteContainers
        ? ['up', '-d', '--remove-orphans']
        : ['up', '-d']

    const pullhandler = async function (img, contName, podName): Promise<StoredContainerStatus> {
        const response: StoredContainerStatus = {
            status: "not_changed",
            time: Math.floor(Number(new Date) / 1000),
            containerName: contName,
            podName: podName,
            nodeName: NODE_NAME
        }

        //already tried this image for this container
        const cacheKey = `${img}/${contName}/${podName}`
        if (pullErrorsCache[cacheKey]) {
            response.status = "error_pulling"
            return response
        }

        try {
            await docker.getImage(img).inspect()
            return response
        } catch (e) {
            //all good. continue
        }
        try {
            console.log("pulling image " + img)
            await docker.pull(img)
            return response
        } catch (e) {
            console.warn("ERROR pulling image", img, String(e).slice(0, 100))
            response.status = "error_pulling"
            pullErrorsCache[cacheKey] = true // do not try to pull the same image again
            return response
        }
    }

    const pullErrorPromises = containersToStart
        .map(cont => pullhandler(cont.Image, cont?.Labels?.['org.containeros.pod.containerName'], cont?.Labels?.['org.containeros.pod.podName']))

    const pullErrors = (await Promise.all(pullErrorPromises)).filter(status => status.status === "error_pulling")

    const excludePods = pullErrors.map(status => status.podName).filter(podName => !!podName)

    const filteredContainersToStart = containersToStart.filter(function (container) {
        const podName = container?.Labels?.['org.containeros.pod.podName']
        if (!podName) return true
        return !excludePods.includes(podName)
    })


    const composeJson = convertDockerodeToCompose(filteredContainersToStart)
    let yamlStr = yaml.dump(composeJson);

    fs.writeFileSync(`/tmp/docker-compose.yaml`, yamlStr)

    const composeResponse = await execa('/usr/bin/docker-compose', composeParams, { cwd: '/tmp' });

    console.log('composeResponse', composeResponse.stderr)

    return pullErrors
}


