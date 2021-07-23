import Dockerode from "dockerode"
import { keyable } from "../../definitions"
const docker = new Dockerode()

const pullResultCache: keyable<{ ttl: number, value: boolean }> = {}

const SUCCESS_PULL_CACHE_TIME = 360 * 1000
const ERROR_PULL_CACHE_TIME = 60 * 1000

export async function pullMultipleImages(images: string[]): Promise<keyable<boolean>> {
    const pullImageResults: keyable<boolean> = {}
    await Promise.all(
        images.map(img =>
            pullImage(img)
                .then(result => pullImageResults[img] = result)
        )
    )
    return pullImageResults
}

export async function pullImage(img: string): Promise<boolean> {
    if (pullResultCache[img]?.ttl > Number(new Date)) {
        return pullResultCache[img].value
    }

    try {
        await docker.getImage(img).inspect()
        pullResultCache[img] = {
            value: true,
            ttl: Number(new Date) + SUCCESS_PULL_CACHE_TIME
        }
        return true
    } catch (e) {
        //all good. image not found in local cache
        try {
            await docker.pull(img)
            //all good, pull complete
            pullResultCache[img] = {
                value: true,
                ttl: Number(new Date) + SUCCESS_PULL_CACHE_TIME
            }
            return true
        } catch (e) {
            console.warn("ERROR pulling image", img, String(e).slice(0, 100))
            pullResultCache[img] = {
                value: false,
                ttl: Number(new Date) + ERROR_PULL_CACHE_TIME
            }
            return true
        }
    }
}