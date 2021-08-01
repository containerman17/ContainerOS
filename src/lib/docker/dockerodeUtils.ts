import dockerode from "./dockerode"
import Dockerode from "dockerode"
import logger from "../logger"

export async function isImagePulledSuccessfully(img: string): Promise<boolean> {
    try {
        await dockerode.getImage(img).inspect()
        return true
    } catch (e) {
        //all good. image not found in local cache
        try {
            await dockerode.pull(img)
            return true
        } catch (e) {
            logger.debug(e)
            return false
        }
    }
}
export async function getContainerByName(name: string): Promise<Dockerode.ContainerInfo> {
    // filter by name
    var opts = {
        "limit": 1,
        "filters": `{"name": ["${name}"]}`
    }

    return new Promise((resolve, reject) => {
        dockerode.listContainers(opts, function (err, containers) {
            if (err) {
                reject(err)
            } else {
                resolve(containers && containers[0])
            }
        });
    })
}

export async function removeContainerHelper(containerId: string, timeout = 30) {
    try {
        const container = dockerode.getContainer(containerId)
        const inspected = await container.inspect()
        if (inspected.State.Running) {
            await container.stop({ t: timeout })
        }
        await container.remove({ force: true })
    } catch (e) {
        if (e.reason === "container already stopped" || e.reason === "no such container") {
            return//all good
        }
        throw e
    }
}