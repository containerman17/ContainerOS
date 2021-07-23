import Dockerode from "dockerode"
import { keyable, StoredPod } from "../../definitions"

export default function podListToContainerList(podList: keyable<StoredPod>): Dockerode.ContainerCreateOptions[] {
    const containerList = []
    for (let pod of Object.values(podList)) {
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

            containerList.push({
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
    return containerList
}