import { DeploymentUpdate } from "./defenitions"
import safePatch from "./safePatch"

export default async function (deployment: DeploymentUpdate) {
    await safePatch(`deployments/${deployment.name}`, (oldDeployment): object => {
        oldDeployment.current = deployment
        oldDeployment.currentPodNames = []
        return oldDeployment
    })
}