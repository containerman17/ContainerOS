import Dockerode from "dockerode";
import { PodContainer, StoredContainer, StoredPod } from "containeros-sdk"
    ;

export default function (pod: StoredPod, container: PodContainer): Dockerode.ContainerCreateOptions {
    const ExposedPorts = {}
    const PortBindings = {}
    const Labels = {
        "org.containeros.pod.name": pod.name,
        "org.containeros.container.name": container.name,
    }

    for (let portNumber of Object.keys(container.services)) {
        ExposedPorts[`${portNumber}/tcp`] = {}
        PortBindings[`${portNumber}/tcp`] = [{}]
    }

    const containerName = pod.name.split('/').slice(-1)[0] + '-' + container.name

    return ({
        name: containerName,
        Image: container.image,
        Env: container.env,
        ExposedPorts: ExposedPorts,
        Hostname: containerName,
        HostConfig: {
            RestartPolicy: {
                Name: 'on-failure',
                MaximumRetryCount: 10
            },
            PortBindings: PortBindings,
            Memory: container.memLimit,
            CpuPeriod: 100000,
            CpuQuota: 100000 * container.cpus
        },
        Labels: Labels,
    })
}