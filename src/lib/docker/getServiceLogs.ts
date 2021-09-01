import Dockerode from "dockerode";
import parseDockerBuffer from "./parseDockerBuffer";

const docker = new Dockerode();

export default async function getContainerLogs(serviceId: String, includeTs = false) {
    // @ts-ignore: wrong ts typing
    const buffer: Buffer = await docker.getService(serviceId).logs({
        follow: false,
        stdout: true,
        stderr: true,
        timestamps: includeTs,
        tail: 500,
        details: false
    })

    return parseDockerBuffer(buffer, includeTs)
}