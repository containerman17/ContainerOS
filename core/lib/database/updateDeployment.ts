import safePatch from "./safePatch"
import { DeploymentUpdate } from "../../definitions"
import deepEqual from "deep-equal"


export default async function updateDeployment(deploymentUpdate: DeploymentUpdate) {
    await safePatch(`deployments/${deploymentUpdate.name}`, (oldDeployment): object => {
        //TODO: update only if config changed

        console.log('oldDeployment.currentConfig', oldDeployment.currentConfig)
        console.log('deploymentUpdate', deploymentUpdate)

        const needNewPods = !deepEqual(//compare configs without scale
            Object.assign({}, oldDeployment.currentConfig, { scale: -1 }),
            Object.assign({}, deploymentUpdate, { scale: -1 }),
        )
        if (needNewPods) {
            oldDeployment.currentPodNames = []
        }

        oldDeployment.currentConfig = deploymentUpdate

        return oldDeployment
    })
}