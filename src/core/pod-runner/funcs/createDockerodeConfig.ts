import Dockerode from "dockerode";
import { StoredContainer, StoredPod } from "../../../types";

export default function (pod: StoredPod, container: StoredContainer): Dockerode.ContainerCreateOptions {
    const ExposedPorts = {}
    const PortBindings = {}
    const Labels = {
        "org.containeros.pod.name": pod.name,
        "org.containeros.container.containerName": container.name,
    }

    for (let portNumber of Object.keys(container.httpPorts)) {
        ExposedPorts[`${portNumber}/tcp`] = {}
        PortBindings[`${portNumber}/tcp`] = [{ HostPort: '' }]
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