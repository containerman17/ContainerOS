import database from "../../lib/database"
import pod from "../../lib/database/pod"
import { keyable } from "../../types"
import Pod from "./Pod"

class PodRunner {
    private pods: keyable<Pod> = {}
    start() {
        database.pod.addListChangedCallback(podList => {
            for (let [podName, storedPod] of Object.entries(podList)) {
                if (!this.pods[podName]) {
                    this.pods[podName] = new Pod(storedPod)
                }
            }
        })
    }
}

export default new PodRunner()