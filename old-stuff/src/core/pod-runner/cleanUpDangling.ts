import dockerode from "../../lib/docker/dockerode";
import { removeContainerHelper } from "../../lib/docker/dockerodeUtils";
import logger from "../../lib/logger";

export default async function cleanUpDangling(validPodNames: string[]): Promise<void> {
    const containers = await dockerode.listContainers({ all: true })

    await Promise.all(containers.map(async (container) => {
        const podName = container.Labels["org.containeros.pod.name"]
        if (podName && false === validPodNames.includes(podName)) {
            logger.info("Removing dangling container " + container.Names[0].slice(1))
            await removeContainerHelper(container.Id);
        }
    }))
}