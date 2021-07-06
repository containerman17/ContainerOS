import Dockerode from "dockerode";
const docker = new Dockerode();

export default async function getContainerByName(name: string): Promise<Dockerode.ContainerInfo | null> {
    // filter by name
    const result: Dockerode.ContainerInfo[] = await docker.listContainers({
        "limit": 1,
        "filters": `{"name": ["${name}"]}`
    })

    return result[0] || null
}