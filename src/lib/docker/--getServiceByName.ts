import Dockerode from "dockerode";
const docker = new Dockerode();

export default async function get(name: string): Promise<Dockerode.Service | null> {
    const result: Dockerode.Service[] = await docker.listServices({
        Filters: { name: [name] },
    })

    return result[0] || null
}