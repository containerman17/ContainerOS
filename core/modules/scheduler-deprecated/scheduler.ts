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
    await syncContainersList(defaultContainers, false)
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

let asyncSyncLock: Promise<StoredContainerStatus[]> = Promise.resolve([])
let containersToBeDeployed: ContainerCreateOptions[] = []

async function start() {
    console.log('Runner is running')
    const defaultContainers = await getDefaultContainers();

    database.listenForUpdates(`pods/${NODE_NAME}`, async function (newPods: keyable<StoredPod>) {
        console.log('got container list updates')
        containersToBeDeployed = [...defaultContainers]

        for (let pod of Object.values(newPods)) {
            for (let containerFromConfig of pod.containers) {
                const ExposedPorts = {}
                const PortBindings = {}
                const Labels = { "dockerized-pod": pod.name }

                for (let portNumber of Object.keys(containerFromConfig.httpPorts)) {
                    const domain = containerFromConfig.httpPorts[portNumber]
                    ExposedPorts[`${portNumber}/tcp`] = {}
                    PortBindings[`${portNumber}/tcp`] = [{ HostPort: '' }]
                    Labels[`service-${portNumber}-name`] = `${pod.deploymentName}-${containerFromConfig.name}`;
                    Labels[`service-${portNumber}-tags`] = `routerDomain-${domain},hello-world`
                }

                containersToBeDeployed.push({
                    name: `${pod.name}-${containerFromConfig.name}`,
                    Image: containerFromConfig.image,
                    Env: containerFromConfig.env,
                    ExposedPorts: ExposedPorts,
                    HostConfig: {
                        RestartPolicy: {
                            Name: 'on-failure',
                            MaximumRetryCount: 10
                        },
                        PortBindings: PortBindings,
                        Memory: containerFromConfig.memLimit,
                        CpuPeriod: 100000,
                        CpuQuota: 100000 * containerFromConfig.cpus
                    },
                    Labels: Labels,
                })
            }
        }

        const interval = setInterval(() => console.log(`Waiting for syncContainersList...`), 1000)
        await asyncSyncLock
        clearInterval(interval)

        asyncSyncLock = syncContainersList(containersToBeDeployed)
    })
}
export default { start, init }

if (require.main === module) {
    start();
}
