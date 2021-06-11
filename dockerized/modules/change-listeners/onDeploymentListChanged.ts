import { keyable, StoredDeployment } from "../../definitions"
import database from "../../lib/database"
import randomstring from "randomstring"

//TODO use locks

export default async function (deployments: keyable<StoredDeployment>) {
    for (let deploymentKey in deployments) {
        const deployment = deployments[deploymentKey]

        await spinCurrentPods(deploymentKey, deployment)
    }
}

async function spinCurrentPods(deploymentKey: string, deployment: StoredDeployment) {
    //naive update controller

    if (deployment.currentPodNames.length === deployment.currentConfig.scale) {
        return
    }

    console.log('deployment', deploymentKey, deployment)
    await database.safePatch(deploymentKey, spinCurrentPodsPatcher)
}

const spinCurrentPodsPatcher = (oldDeployment: StoredDeployment): object => {
    const diff = oldDeployment.currentPodNames.length - oldDeployment.currentConfig.scale

    if (diff > 0) {
        //delete a pod
        oldDeployment.currentPodNames = oldDeployment.currentPodNames.slice(0, -1 * diff)
    } else {
        //add a pod

        for (let i = 0; i < (-1 * diff); i++) {
            const randomId = randomstring.generate({ length: 5, charset: 'alphanumeric', capitalization: 'lowercase' })
            const newPodName = `${oldDeployment.currentConfig.name}-${randomId}`
            oldDeployment.currentPodNames.push(newPodName)
        }
    }
    return oldDeployment
}
