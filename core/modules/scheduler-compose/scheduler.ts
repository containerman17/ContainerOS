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

let containersToBeDeployed: ContainerCreateOptions[] = []

async function start() {
    await init();
    console.log('Runner is running')
    const defaultContainers = await getDefaultContainers();

    database.listenForUpdates(`pods/${NODE_NAME}`, async function (newPods: keyable<StoredPod>) {
        console.log('got container list updates', Object.values(newPods).map(pod => pod.name))
        containersToBeDeployed = [...defaultContainers]

        for (let pod of Object.values(newPods)) {
            for (let containerFromConfig of pod.containers) {
                const ExposedPorts = {}
                const PortBindings = {}
                const Labels = {
                    "org.containeros.pod.podName": pod.name,
                    "org.containeros.pod.containerName": containerFromConfig.name,
                }

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


        const MAX_RETRIES = 3
        for (let i = 1; i <= 3; i++) {//
            try {
                await syncContainersList(containersToBeDeployed)
                console.log('syncContainersList complete')
            } catch (e) {
                console.log('syncContainersList error', String(e).slice(0, 200))

                if (i === MAX_RETRIES) {
                    throw e
                } else {
                    await delay(1000)
                }
            }
        }
    })
}
export default { start, init }

if (require.main === module) {
    start();
}
