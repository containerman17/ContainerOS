import Dockerode from "dockerode";

//TODO specify docker compose return type
export default function (containers: Array<Dockerode.ContainerCreateOptions>): any {
    let data = { version: '2.4', services: {} };
    for (let container of containers) {

        //TODO: ports
        //TODO: env
        //TODO: labels
        //TODO: CpuPeriod
        //TODO: CpuQuota
        //TODO: memory
        //TODO: PortBindings

        console.debug("container", container.name, container.ExposedPorts, container?.HostConfig?.PortBindings)

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

        const volumes = (container?.HostConfig?.Binds || []).map(pair => ({
            type: 'bind',
            source: pair.split(':')[0],
            target: pair.split(':')[1],
        }))

        data.services[container.name] = {
            image: container.Image,
            container_name: container.name,
            network_mode: container?.HostConfig?.NetworkMode || 'bridge',
            volumes: volumes,
            labels: container.Labels,
            ports
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

        if (container.Cmd) {
            data.services[container.name].command = container.Cmd.join(' ')
        }
    }
    return data
}