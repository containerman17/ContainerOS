import safePatch from "./safePatch"
import { DeploymentUpdate } from "../../definitions"

export default async function updateDeployment(validatedBody: DeploymentUpdate) {
    await safePatch(`deployments/${validatedBody.name}`, (oldDeployment): object => {
        //TODO: update only if config changed
        const needNewPods = true
        if (needNewPods) {
            oldDeployment.currentPodNames = []
        }

        oldDeployment.currentConfig = validatedBody

        return oldDeployment
    })
}