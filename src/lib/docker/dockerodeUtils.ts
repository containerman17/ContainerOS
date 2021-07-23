import dockerode from "./dockerode"
import Dockerode from "dockerode"

export async function pullImage(img: string): Promise<boolean> {
    try {
        await dockerode.getImage(img).inspect()
        return true
    } catch (e) {
        //all good. image not found in local cache
        try {
            await dockerode.pull(img)
            return true
        } catch (e) {
            return false
        }
    }
}
export async function getContainerByName(name: string): Promise<Dockerode.ContainerInfo> {
    // filter by name
    var opts = {
        "limit": 1,
        "filters": `{"name": ["${name}"]}`
    }

    return new Promise((resolve, reject) => {
        dockerode.listContainers(opts, function (err, containers) {
            if (err) {
                reject(err)
            } else {
                resolve(containers && containers[0])
            }
        });
    })
}