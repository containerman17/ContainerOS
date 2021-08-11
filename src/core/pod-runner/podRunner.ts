import { database } from "containeros-sdk"
import { keyable, StoredPod, utils } from "containeros-sdk"
import Pod from "./Pod"
import cleanUpDangling from "./cleanUpDangling"
import logger from "../../lib/logger"

const rateLimit = new utils.RateLimit(1, 1000)

class PodRunner {
    private pods: keyable<Pod> = {}

    public getPodNames = () => Object.keys(this.pods)

    //test function. can we do it without extra code?
    public awaitForPodStart(podName: string): Promise<void> {
        if (!this.pods[podName]) {
            throw Error("No such pod " + podName)
        }
        return this.pods[podName].awaitForStart()
    }

    start(): Promise<void> {
        return new Promise((resolve) => {
            let resolved = false

            let currentPodList: keyable<StoredPod>

            const onPodListChanged = async () => {
                for (let [podName, storedPod] of Object.entries(currentPodList)) {
                    if (!this.pods[podName]) {
                        this.pods[podName] = new Pod(storedPod)
                    }
                }

                const podsToStop = Object.keys(this.pods).filter(name => !currentPodList[name])

                for (let podName of podsToStop) {
                    this.pods[podName].stop().then(() => {
                        delete this.pods[podName]
                    })
                }

                await cleanUpDangling(Object.keys(currentPodList))

                if (!resolved) {
                    resolved = true
                    resolve()
                }
            }

            database.pod.addListChangedCallback(async podList => {
                logger.debug('podList', Object.keys(podList))
                currentPodList = podList
                await rateLimit.waitForMyTurn() // not more than 1 update per sec
                await onPodListChanged()
            })
        })
    }
}

export default new PodRunner()