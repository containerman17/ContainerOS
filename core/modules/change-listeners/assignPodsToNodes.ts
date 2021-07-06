import { keyable, StoredDeployment, StoredPod } from "../../definitions"
import { NODE_NAME } from "../../config"
import database from "../../lib/database"
import randomstring from "randomstring"

//TODO: remove this debug

export default async function (deployments: keyable<StoredDeployment>, pods: keyable<StoredPod>) {
    const desiredPods: keyable<string> = {}

    for (let deploymentKey in deployments) {
        deployments[deploymentKey].currentPodNames
            .map((name: string) => desiredPods[name] = deploymentKey)
    }

    const desiredPodsNames = Object.keys(desiredPods)
    const actualPodNames = Object.keys(pods).map(key => key.split('/').slice(-1)[0])

    const podsToCreate = desiredPodsNames.filter(name => !actualPodNames.includes(name))
    const podsToDelete = actualPodNames.filter(name => !desiredPodsNames.includes(name))

    console.log({ desiredPodsNames, actualPodNames, podsToCreate, podsToDelete })

    //TODO: assign new pods
    for (let podName of podsToCreate) {
        const selectedNode = await database.getLeastBusyServer()
        const deployment: StoredDeployment = await database.getPath(desiredPods[podName]);

        //TODO: why do we use safepatch here!?
        await database.safePatch(`pods/${selectedNode}/${podName}`, function (oldPod: StoredPod | null) {
            const result: StoredPod = {
                name: podName,
                deploymentName: deployment.currentConfig.name,
                containers: [],
                nodeName: selectedNode
            }

            for (let containerName in deployment.currentConfig.containers) {
                const container = deployment.currentConfig.containers[containerName]
                result.containers.push({
                    name: containerName,
                    image: container.image,
                    memLimit: container.memLimit,
                    cpus: container.cpus,
                    env: container.env,
                    httpPorts: container.httpPorts,
                })
            }

            return result
        })

    }

    //TODO: delete obsolete pods
    for (let podName of podsToDelete) {
        const podPath = Object.keys(pods).filter(path => path.endsWith(`/${podName}`))[0]
        await database.deletePath(podPath)
    }
}
