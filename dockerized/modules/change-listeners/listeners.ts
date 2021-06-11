import database from "../../lib/database"
import manageDeploymentPods from "./manageDeploymentPods"
import assignPodsToNodes from "./assignPodsToNodes"
import { keyable, StoredPod, StoredDeployment } from "../../definitions"
import delay from "delay"

let deploymentList: keyable<StoredDeployment> = null
let podList: keyable<StoredPod> = null

let dirty = true

async function start(): Promise<void> {
    console.log('Start update listeners')

    database.listenForUpdates("deployments", function (newDeploymentList: keyable<StoredDeployment>) {
        deploymentList = newDeploymentList
        dirty = true
    })
    database.listenForUpdates("pods", function (newPodList: keyable<StoredPod>) {
        podList = newPodList
        dirty = true
    })

    while (true) {
        await delay(100) // TODO: It's got to be a better way to not run parallel updates
        if (dirty === false) continue

        await updateListener()
    }
}

const updateListener = async function () {

    if (deploymentList !== null) {
        await manageDeploymentPods(deploymentList)
    }
    if (deploymentList !== null && podList !== null) {
        await assignPodsToNodes(deploymentList, podList)
    }
    dirty = false
}

export default { start }

if (require.main === module) {
    start();
}
