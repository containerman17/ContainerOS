import Dockerode from "dockerode";

//TODO specify docker compose return type
export default function (containers: Array<Dockerode.ContainerCreateOptions>): any {
    let data = { version: '2.4', services: {}, networks: {} };
    for (let container of containers) {

        //TODO: CpuPeriod
        //TODO: CpuQuota
        //TODO: memory

        data.services[container.name] = {
            image: container.Image,
            container_name: container.name,
            volumes: container?.HostConfig?.Binds,
            labels: container.Labels,
            environment: container?.Env || []
        }

        if (container?.HostConfig?.NetworkMode) {
            data.services[container.name].network_mode = container?.HostConfig?.NetworkMode
        }

        const podName = container?.Labels?.['org.containeros.pod.podName']
        const originalContainerName = container?.Labels?.['org.containeros.pod.containerName']
        //ports

        //TODO: do not hardcode. move to scheduler instead
        data.services[container.name].logging = {
            driver: "json-file",
            options: {
                "max-size": "10m",
                "max-file": "3",
                labels: `pod-${podName}`
            }
        }

        if (container?.HostConfig?.NetworkMode !== "host") {
            //open ports
            const ports = []
            if (container?.HostConfig?.PortBindings) {
                for (let [containerPort, exposed] of Object.entries(container?.HostConfig?.PortBindings)) {
                    const fixedHostPort = exposed[0].HostPort
                    if (fixedHostPort) {
                        ports.push(`${fixedHostPort}:${containerPort}`)
                    } else {
                        ports.push(containerPort)
                    }
                }
            }
            data.services[container.name].ports = ports
            //connect pod containers into a netowrk
            //TODO: check if this required for single-pod deployments
            if (podName) {
                data.networks[podName] = {}
                data.services[container.name].networks = {}
                data.services[container.name].networks[podName] = { aliases: [originalContainerName] }

            }
        }


        //like restart=failure:5
        if (container?.HostConfig?.RestartPolicy?.Name) {
            data.services[container.name].restart = container?.HostConfig?.RestartPolicy?.Name

            const max = container?.HostConfig?.RestartPolicy?.MaximumRetryCount ||
                container?.HostConfig?.RestartPolicy?.MaxAttempts
            if (max) { // add restart count
                data.services[container.name].restart += `:${max}`
            }
        }

        //cmd
        if (container.Cmd) {
            data.services[container.name].command = container.Cmd.join(' ')
        }
    }
    return data
}