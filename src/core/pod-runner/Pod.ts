import { StoredPod } from "../../types";
import logger from "../../lib/logger"
import { getContainerByName, isImagePulledSuccessfully } from "../../lib/docker/dockerodeUtils"
import dockerode from "../../lib/docker/dockerode"
import createDockerodeConfig from "./funcs/createDockerodeConfig";
import database from "../../lib/database"

export default class Pod {
    storedPod: StoredPod
    constructor(_storedPod: StoredPod) {
        this.storedPod = _storedPod
        this.start()
    }
    async start() {
        logger.info("Starting pod", this.storedPod.name)

        await database.podStatus.report(this.storedPod.name, {
            status: "Pending",
            reason: "PullingContainers",
            message: ""
        })

        //pull
        const pullResults = await Promise.all(
            this.storedPod.containers.map(cont => isImagePulledSuccessfully(cont.image))
        )
        for (let i = 0; i < pullResults.length; i++) {
            if (pullResults[i] === false) {
                await database.podStatus.report(this.storedPod.name, {
                    status: "Failed",
                    reason: "ContainerFailedPulling",
                    message: "Failed pulling image " + this.storedPod.containers[i].image
                })
                return;
            }
        }

        //start
        await database.podStatus.report(this.storedPod.name, {
            status: "Pending",
            reason: "StartingContainers",
            message: ""
        })

        let createdContainers = []
        try {
            createdContainers = await Promise.all(
                this.storedPod.containers.map(async cont => {
                    const conf = createDockerodeConfig(this.storedPod, cont)
                    let createdContainer = await getContainerByName(conf.name)
                    if (!createdContainer) {
                        logger.info('creating container', conf.name)
                        await dockerode.createContainer(conf)
                        createdContainer = await getContainerByName(conf.name)
                    }
                    return createdContainer
                })
            )
        } catch (e) {
            logger.info("Error creating containers", e)
            await database.podStatus.report(this.storedPod.name, {
                status: "Failed",
                reason: "ContainerFailedStarting",
                message: "Failed starting containers " + String(e).slice(0, 100)
            })
            return;
        }

        try {
            await Promise.all(
                createdContainers.map(async cont => {
                    if (cont.State !== 'running') {
                        const containerToStart = dockerode.getContainer(cont.Id);

                        await containerToStart.start()
                    }
                })
            )
        } catch (e) {
            logger.warn("Error starting containers", e)
            await database.podStatus.report(this.storedPod.name, {
                status: "Failed",
                reason: "ContainerFailedStarting",
                message: "Failed starting containers " + String(e).slice(0, 100)
            })
            return;
        }

        await database.podStatus.report(this.storedPod.name, {
            status: "Running",
            reason: "Started",
            message: ""
        })
    }
}