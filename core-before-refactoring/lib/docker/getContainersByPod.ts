import Dockerode from "dockerode";
const docker = new Dockerode();

export default async function getContainersByPod(name: string): Promise<Dockerode.ContainerInfo[]> {
    // filter by name
    return await docker.listContainers({
        "filters": `{\"label\": [\"org.containeros.pod.podName=${name}\"]}`
    })
}