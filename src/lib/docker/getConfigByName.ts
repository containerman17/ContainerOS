import Dockerode from "dockerode";
const docker = new Dockerode();

export default async function getConfigByName(name: string): Promise<Dockerode.ConfigInfo | null> {
    // filter by name
    const result: Dockerode.ConfigInfo[] = await docker.listConfigs({
        "limit": 1,
        "filters": `{"name": ["${name}"]}`
    })

    return result[0] || null
}