import syncContainersList from "./syncContainersList"
import getDefaultContainers from './getDefaultContainers'
import database from "../../lib/database"
import { NODE_NAME } from "../../config"
import { keyable, StoredPod, StoredContainerStatus } from "../../definitions"
import { ContainerCreateOptions } from "dockerode"
import axios from "axios"
import delay from "delay"

async function init() {
    const defaultContainers = await getDefaultContainers();
    await syncContainersList(defaultContainers)
    for (let i = 0; i < 30; i++) {
        await delay(i * 100)
        const isStarted = await isConsulStarted()
        if (isStarted) {
            console.log('Consul started')
            return
        }
    }
    throw "COULD NOT START CONSUL"
}

async function isConsulStarted() {
    try {
        const response = await axios.get(`http://localhost:8500/v1/catalog/nodes`)
        if (response.data[0].ID) {
            return true
        } else {
            return false
        }
    } catch (e) {
        return false
    }
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
                        // PortBindings: { '80/tcp': [{ HostPort: '5000' }] },//TODO: containerFromConfig.httpPorts,
                        Memory: containerFromConfig.memLimit,
                        CpuPeriod: 100000,
                        CpuQuota: 100000 * containerFromConfig.cpus
                    },
                    Labels: { "dockerized-pod": pod.name }
                })
            }
        }
        const results = await syncContainersList(containersToBeDeployed)
    })
}
export default { start, init }

if (require.main === module) {
    start();
}
