import Dockerode from "dockerode"
import { UNTOUCHABLE_CONTAINERS } from "../../config"

const docker = new Dockerode()

export default async function sync(containersToStart: Array<Dockerode.ContainerCreateOptions>): Promise<CreateContainerResult> {
    await deleteChangedContainers(containersToStart)
    return await createAbsentContainers(containersToStart)
}

interface CreateContainerResult {
    [key: string]: Promise<void>
}

async function createAbsentContainers(containersToStart: Array<Dockerode.ContainerCreateOptions>): Promise<CreateContainerResult> {
    const containersOnHost = await docker.listContainers({ all: true });

    const promises: CreateContainerResult = {}

    for (let container of containersToStart) {
        if (!hostHasContainer(containersOnHost, container.name!)) {
            promises[container.name!] = runContainer(container);
        }
    }

    return promises
}
async function deleteChangedContainers(containersToStart: Array<Dockerode.ContainerCreateOptions>): Promise<void> {
    const containersOnHost = await docker.listContainers({ all: true });
    // delete changed and absent containers
    for (let containerOnHost of containersOnHost) {
        if (UNTOUCHABLE_CONTAINERS.indexOf(containerOnHost.Names[0]) !== -1) {
            continue;
        }
        let shouldBeDeleted = true
        for (let containerToStart of containersToStart) {
            //should not be deleted only if specs are the same

            if (!areSpecsDifferent(containerToStart, containerOnHost)) {
                shouldBeDeleted = false
            }
        }
        if (shouldBeDeleted) {
            throw 'shouldBeDeleted = true ' + containerOnHost.Names[0]
            const containerToDelete = await docker.getContainer(containerOnHost.Id)
            await containerToDelete.stop()
            await containerToDelete.remove()
        }
    }
}

function areSpecsDifferent(newContainer: Dockerode.ContainerCreateOptions, existingContainer: Dockerode.ContainerInfo) {
    console.log('newContainer', newContainer)
    console.log('existingContainer', existingContainer)
    if ('/' + newContainer.name !== existingContainer.Names[0]) {
        return true // this has to be the first comparison
    }
    if (newContainer.Image !== existingContainer.Image) {
        return true
    }
    if (newContainer?.HostConfig?.NetworkMode !== existingContainer?.HostConfig?.NetworkMode) {
        return true
    }

    //TODO check cmd
    //TODO check env
    return false
}

async function dockerPull(image: string): Promise<void> {
    return new Promise((resolve, reject) => {
        docker.pull(image, function (err: any, stream: any) {
            docker.modem.followProgress(stream, onFinished, () => null);

            function onFinished(err: any, output: any) {
                if (err) reject(err)
                else resolve(output)
            }
        });
    })
}

async function runContainer(containerToCreate: Dockerode.ContainerCreateOptions) {
    await dockerPull(containerToCreate.Image!);
    const createdContainer = await docker.createContainer(containerToCreate)
    await createdContainer.start()
}

function hostHasContainer(containerList: Dockerode.ContainerInfo[], name: string): Boolean {
    return containerList.filter(line => line.Names[0] === '/' + name).length > 0
}