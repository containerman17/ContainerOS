import { keyable } from "../../definitions"
import { setPath } from "./index"

const delays: keyable<ReturnType<typeof setTimeout>> = {}

/* 
    We need this function to protect consul from many concurrent writes

    will wait for 1000 ms before updating the value
    if any new value would come during 1000ms, will update with new value instead of old one

    if update fails, throws uncought error, that should restart whole container
 */


export default function setWithDelay(path: string, data: any, delayMs = 1000) {
    if (delays[path] !== undefined) {
        clearTimeout(delays[path])
        delays[path] = undefined
    }
    delays[path] = setTimeout(async function () {
        try {
            await setPath(path, data)
        } catch (e) {
            console.error("Whoops! setWithDelay failed. Looks like Consul is not doing good. Throwing uncought error to kill the app.")
            throw e
        }
    }, delayMs)
}