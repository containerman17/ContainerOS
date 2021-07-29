import { StoredPod } from "../../types";
import logger from "../../lib/logger"
import { isImagePulledSuccessfully } from "../../lib/docker/dockerodeUtils"
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
            reason: "Starting",
            message: ""
        })

        //pull
        const pullResults = await Promise.all(
            this.storedPod.containers.map(cont => isImagePulledSuccessfully(cont.name))
        )
        for (let i = 0; i < pullResults.length; i++) {
            if (pullResults[i] === false) {
                await database.podStatus.report(this.storedPod.name, {
                    status: "Failed",
                    reason: "ContainerFailedPulling",
                    message: "Failed pulling container " + this.storedPod.containers[i]
                })
                return;
            }
        }
    }
}