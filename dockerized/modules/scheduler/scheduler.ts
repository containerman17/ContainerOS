import syncContainersList from "./syncContainersList"
import getDefaultContainers from './getDefaultContainers'
import database from "../../lib/database"
import { NODE_NAME } from "../../config"
import { keyable, StoredPod } from "../../definitions"
import { ContainerCreateOptions } from "dockerode"

async function init() {
    const defaultContainers = await getDefaultContainers();
    await syncContainersList(defaultContainers)
}

async function start() {
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
                    ExposedPorts: { "80/tcp": {} },//TODO: containerFromConfig.httpPorts,
                    HostConfig: {
                        RestartPolicy: {
                            Name: 'on-failure',
                            MaximumRetryCount: 10
                        },
                        PortBindings: { '80/tcp': [{ HostPort: '5000' }] },//TODO: containerFromConfig.httpPorts,
                        Memory: containerFromConfig.memLimit,
                        CpuPeriod: 100000,
                        CpuQuota: 100000 * containerFromConfig.cpus
                    },
                    Labels: { "dockerized-pod": pod.name }
                })
            }
        }

        await syncContainersList(containersToBeDeployed)
    })
}
export default { start, init }

if (require.main === module) {
    start();
}
