import Dockerode from "dockerode";

//TODO specify docker compose return type
export default function (containers: Array<Dockerode.ContainerCreateOptions>): any {
    let data = { version: '2.4', services: {} };
    for (let container of containers) {
        console.log(container)


        //TODO: ports
        //TODO: env
        //TODO: labels
        //TODO: CpuPeriod
        //TODO: CpuQuota
        //TODO: memory
        //TODO: PortBindings

        const volumes = (container?.HostConfig?.Binds || []).map(pair => ({
            type: 'bind',
            source: pair.split(':')[0],
            target: pair.split(':')[1],
        }))

        containers[container.name] = {
            image: container.Image,
            container_name: container.name,
            network_mode: container?.HostConfig?.NetworkMode || 'bridge',
            volumes: volumes,
        }

        //like restart=failure:5
        if (container?.HostConfig?.RestartPolicy?.Name) {
            containers[container.name].restart = container?.HostConfig?.RestartPolicy?.Name

            const max = container?.HostConfig?.RestartPolicy?.MaximumRetryCount ||
                container?.HostConfig?.RestartPolicy?.MaxAttempts
            if (max) { // add restart count
                containers[container.name].restart += `:${max}`
            }
        }

        if (container.Cmd) {
            containers[container.name].command = container.Cmd.join(' ')
        }

        console.log(containers[container.name])
    }
    return data
}