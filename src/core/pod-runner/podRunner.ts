import database from "../../lib/database"
import pod from "../../lib/database/pod"
import { keyable } from "../../types"
import Pod from "./Pod"
import cleanUpDangling from "./cleanUpDangling"
import RateLimit from "../../lib/utils/RateLimit"

const rateLimit = new RateLimit(1, 1000)

let lastCleanUpExecution = Promise.resolve()

class PodRunner {
    private pods: keyable<Pod> = {}
    start() {
        database.pod.addListChangedCallback(async podList => {
            await rateLimit.waitForMyTurn() // not more than 1 update per sec
            await lastCleanUpExecution // limit container clean up to 1 thread

            for (let [podName, storedPod] of Object.entries(podList)) {
                if (!this.pods[podName]) {
                    this.pods[podName] = new Pod(storedPod)
                }
            }

            lastCleanUpExecution = cleanUpDangling(Object.keys(podList))
        })
    }
}

export default new PodRunner()