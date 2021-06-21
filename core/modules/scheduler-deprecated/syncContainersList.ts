import Dockerode from "dockerode"
import { UNTOUCHABLE_CONTAINERS, NODE_NAME } from "../../config"
import { containerStatusValues, keyable, StoredContainerStatus } from "../../definitions"
import delay from "delay"
const docker = new Dockerode()

export default async function sync(containersToStart: Array<Dockerode.ContainerCreateOptions>, deleteContainers: boolean = true): Promise<StoredContainerStatus[]> {
    if (deleteContainers) {
        await deleteChangedContainers(containersToStart)
    }
    return await createAbsentContainers(containersToStart)
}

async function createAbsentContainers(containersToStart: Array<Dockerode.ContainerCreateOptions>): Promise<StoredContainerStatus[]> {
    console.debug('createAbsentContainers', containersToStart.map(cont => cont.name))
    const containersOnHost = await docker.listContainers({ all: true });

    const results: StoredContainerStatus[] = []

    for (let container of containersToStart) {
        if (!hostHasContainer(containersOnHost, container.name!)) {
            const podName = container?.Labels?.['dockerized-pod']

            try {
                console.debug('run container ' + container.name)
                await runContainer(container);
                if (podName) {
                    results.push({
                        status: "starting",
                        time: Math.round(Number(new Date) / 1000),
                        containerName: container.name,
                        podName: podName,
                        nodeName: NODE_NAME
                    })
                }
            } catch (e) {
                if (e instanceof ContainerPullingError) {
                    results[container.name] = "error_pulling"

                    if (podName) {
                        results.push({
                            status: "starting",
                            time: Math.round(Number(new Date) / 1000),
                            containerName: container.name,
                            podName: podName,
                            nodeName: NODE_NAME
                        })
                    }
                } else {
                    console.log({ container, containersOnHost: containersOnHost.map(cont => cont.Names) })
                    throw e //something goes sideways. it's better to die actually
                }
            }
        }
    }
    console.debug('createAbsentContainers finished', containersToStart.map(cont => cont.name))

    return results
}

class ContainerPullingError extends Error { }

async function deleteChangedContainers(containersToStart: Array<Dockerode.ContainerCreateOptions>): Promise<void> {
    const containersOnHost = await docker.listContainers({ all: true });
    // delete changed and absent containers
    for (let containerOnHost of containersOnHost) {
        if (UNTOUCHABLE_CONTAINERS.indexOf(containerOnHost.Names[0]) !== -1) {
            continue;
        }

        if (containerOnHost.State === 'exited') {//TODO: why do we need that here? may be in createAbsentContainers??
            try {//at least try to start an exited container
                const exitedContainer = await docker.getContainer(containerOnHost.Id)
                await exitedContainer.start()
            } catch (e) {
                console.error(`Failed to start container ${containerOnHost.Names[0]} but I can live with it`)
            }
        }

        let shouldBeDeleted = true
        for (let containerToStart of containersToStart) {
            //should not be deleted only if specs are the same

            if (!areSpecsDifferent(containerToStart, containerOnHost)) {
                shouldBeDeleted = false
            }
        }
        if (shouldBeDeleted) {
            console.log("Stopping container", containerOnHost.Names[0])
            const containerToDelete = await docker.getContainer(containerOnHost.Id)

            try {
                await containerToDelete.stop()
            } catch (e) {
                if (String(e?.json?.message).endsWith("is already in progress")
                    || ['container already stopped', 'no such container'].includes(e.reason)) {
                    console.warn(`Could not stop container ${containerOnHost.Names[0]}, but that's ok. let's murder it`)
                } else {
                    throw e // that's an unexpected error
                }
            }

            try {
                await containerToDelete.remove()
            } catch (e) {
                if (['no such container'].includes(e.reason)
                    || String(e?.json?.message).endsWith("is already in progress")) {
                } else {
                    throw e
                }
            }

        }
    }
}

//TODO: may be obsolete since a pod will be replaced with a new pod on any change
function areSpecsDifferent(newContainer: Dockerode.ContainerCreateOptions, existingContainer: Dockerode.ContainerInfo) {
    if ('/' + newContainer.name !== existingContainer.Names[0]) {
        return true // this has to be the first comparison
    }
    if (newContainer.Image !== existingContainer.Image) {
        return true
    }

    //TODO: check cmd
    //TODO: check env
    //TODO: check NetworkMode
    return false
}

async function dockerPull(image: string): Promise<void> {
    return new Promise((resolve, reject) => {
        docker.pull(image, function (err: any, stream: any) {
            if (err) return reject(new ContainerPullingError("ContainerPullingError"))
            docker.modem.followProgress(stream, onFinished, () => null);

            function onFinished(err: any, output: any) {
                if (err) reject(new ContainerPullingError("ContainerPullingError"))
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