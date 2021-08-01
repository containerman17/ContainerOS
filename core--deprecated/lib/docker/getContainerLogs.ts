import Dockerode from "dockerode";
import parseDockerBuffer from "./parseDockerBuffer";

const docker = new Dockerode();

export default async function getContainerLogs(containerId: String, includeTs = false) {
    // @ts-ignore: wrong ts typing
    const buffer: Buffer = await docker.getContainer(containerId).logs({
        follow: false,
        stdout: true,
        stderr: true,
        timestamps: includeTs,
        tail: 500,
        details: true
    })

    return parseDockerBuffer(buffer, includeTs)
}