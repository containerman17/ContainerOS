import Dockerode from 'dockerode';
import fs from "fs"
import path from "path"

const dockerode = new Dockerode()

const TEST_CONTAINER_NAME = 'cos-e2e'

export async function removeContainer(containerName) {
    const container = await getContainerByName(containerName)
    await container.remove();
}

export async function getContainerByName(name) {
    const result = await dockerode.listContainers({
        "limit": 1,
        "filters": `{"name": ["${name}"]}`
    })

    if (result[0]) {
        return dockerode.getContainer(result[0].Id);
    } else {
        return null
    }
}

export async function stopContainerOS() {
    await stopContainer(TEST_CONTAINER_NAME)
}

export async function stopConsul() {
    await stopContainer('consul')
}

export async function getRunningContainers() {
    const list = await dockerode.listContainers()
    return list.map(cont => cont.Names[0].slice(1))
}

export async function stopContainer(name) {
    let container = await getContainerByName(name)
    if (container) {
        try { await container.stop() } catch (e) { }
        try { await container.remove() } catch (e) { }
    }
}

export async function getContainerOsLogs() {
    const container = await getContainerByName(TEST_CONTAINER_NAME)

    return String(await container.logs({
        follow: false,
        stdout: true,
        stderr: true,
        details: false,
        tail: 50,
        timestamps: true
    }))
}

export async function reStartContainerOS() {
    const version = fs.readFileSync(path.join(fs.realpathSync('.'), '..', 'VERSION'))
    const imageName = `quay.io/containeros/containeros:${version}`

    await stopContainer('cos-router')
    await stopContainer(TEST_CONTAINER_NAME)

    let container = await dockerode.createContainer({
        Image: imageName,
        name: TEST_CONTAINER_NAME,
        HostConfig: {
            Binds: [
                "/var/run/docker.sock:/var/run/docker.sock"
            ],
            NetworkMode: "host",
        }
        //     PortBindings: {
        //         '8000/tcp': [{ HostPort: 8000 }]
        //     }
        // }
    });

    await container.start();
}