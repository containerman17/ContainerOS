import { MicroserviceUpdate } from "../../types"
import { safePatch } from "./privateMethods"
import deepEqual from "deep-equal"

async function update(deploymentUpdate: MicroserviceUpdate) {
    await safePatch(`microservices/${deploymentUpdate.name}`, (oldDeployment): object => {
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
export default { update }