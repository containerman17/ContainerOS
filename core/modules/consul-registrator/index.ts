import Dockerode from "dockerode"
import { mapContainerPortsToNodePorts, parseLables } from "./helpers";
import { register, deRegister } from "./serviceStore"
const docker = new Dockerode()

const start = async function () {
    const eventsStream = await docker.getEvents({
        filters: {
            type: ["container"],
        },
    })

    const containers = await docker.listContainers()
    for (let container of containers) {
        await handleContainer({
            id: container.Id,
            name: container.Names[0].slice(1),
            labels: container.Labels,
            state: container.State,
            ports: container.Ports
        })
    }

    eventsStream.on('data', function (chunk) {
        let event = null
        try {
            event = JSON.parse(chunk.toString('utf8'))
        } catch (e) {
            console.warn("JSON parsing problem in container status")
            return
        }
    });

    eventsStream.on('error', function (err) {
        console.error(err)
        throw err
    });
}


async function handleContainer(containerData: {
    id: string, name: string, labels: { [label: string]: string }, state: string, ports: Dockerode.Port[]
}) {
    const publicPortsMapping = mapContainerPortsToNodePorts(containerData.ports)
    const parsedServices = parseLables(containerData.labels, containerData.name, publicPortsMapping)


    if (parsedServices.length > 0 && containerData.state === "running") {
        await register(containerData.id, parsedServices)
    } else {
        await deRegister(containerData.id)
    }
}

export default { start }

if (require.main === module) {
    process.on('unhandledRejection', (error: Error) => {
        console.log('unhandledRejection', error);
        process.exit(1)
    });

    start()
}