import syncContainersList from "./syncContainersList"
import getDefaultContainers from './getDefaultContainers'
import database from "../../lib/database"
import { NODE_NAME } from "../../config"
import { keyable, StoredPod } from "../../definitions"
import { ContainerCreateOptions } from "dockerode"


async function start(): Promise<void> {
    console.log('Runner is running')
    const defaultContainers = await getDefaultContainers();

    database.listenForUpdates(`pods/${NODE_NAME}`, async function (newPods: keyable<StoredPod>) {
        const containersToBeDeployed: ContainerCreateOptions[] = [...defaultContainers]

        for (let pod of Object.values(newPods)) {
            for (let containerFromConfig of pod.containers) {
                containersToBeDeployed.push({
                    name: containerFromConfig.name,
                    Image: containerFromConfig.image,
                    Env: containerFromConfig.env,
                    ExposedPorts: containerFromConfig.httpPorts,
                    HostConfig: {
                        RestartPolicy: {
                            Name: 'always'
                        },
                        Memory: containerFromConfig.memLimit,
                        CpuPeriod: 100000,
                        CpuQuota: 100000 * containerFromConfig.cpus
                    },
                })
            }
        }

        await syncContainersList(containersToBeDeployed)
    })
}
export default { start }

if (require.main === module) {
    start();
}
