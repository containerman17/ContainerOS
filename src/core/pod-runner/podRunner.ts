import database from "../../lib/database"
import pod from "../../lib/database/pod"
import { keyable } from "../../types"
import Pod from "./Pod"
import cleanUpDangling from "./cleanUpDangling"

class PodRunner {
    private pods: keyable<Pod> = {}
    start() {
        database.pod.addListChangedCallback(async podList => {
            for (let [podName, storedPod] of Object.entries(podList)) {
                if (!this.pods[podName]) {
                    this.pods[podName] = new Pod(storedPod)
                }
            }
            await cleanUpDangling(Object.keys(podList))
        })
    }
}

export default new PodRunner()