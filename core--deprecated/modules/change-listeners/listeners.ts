import database from "../../lib/database"
import manageDeploymentPods from "./manageDeploymentPods"
import assignPodsToNodes from "./assignPodsToNodes"
import { keyable, StoredPod, StoredDeployment } from "../../definitions"
import getDefaultNetworkInterface from "../../lib/system/getDefaultNetworkInterface"

import delay from "delay"

let deploymentList: keyable<StoredDeployment> = null
let podList: keyable<StoredPod> = null

let dirty = true

async function start() {
    let started = false
    const myIp = (await getDefaultNetworkInterface()).ip_address

    database.onLeaderChanged((newLeader) => {
        if (newLeader === myIp) {
            console.error("Cool! I am a leader. Starting listeners")
            if (started) {
                return
            } else {
                started = true
                actuallyStart()
            }
        } else if (started) {
            console.error("I am not a conslu leader anymore :/")
            process.exit(1)
        } else {
            console.log("I am a follower. Not listening for updates")
        }
    })
}

async function actuallyStart(): Promise<void> {
    console.log('Start update listeners')

    database.listenForUpdates("deployments", function (newDeploymentList: keyable<StoredDeployment>) {
        deploymentList = newDeploymentList
        dirty = true
    })
    database.listenForUpdates("pods", function (newPodList: keyable<StoredPod>) {
        podList = newPodList
        dirty = true
    })

    database.listenForUpdates("nodeHealth", database.gotNewHealthData) //special case, does not depend on main change loop

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
