import Dockerode from "dockerode"
import { keyable, StoredContainerStatus, containerStatusValues } from "../../definitions";
import { NODE_NAME } from "../../config";

const docker = new Dockerode()

let started = false

const podStatusMap: keyable<containerStatusValues> = {
    "kill": "dead",
    "start": "started",
    "stop": "dead",
    "die": "dead",
    "destroy": "dead",
    "create": "starting",
}

async function start() {
    started = true
    docker.getEvents({
        filters: {
            type: ["container"],
        },
        since: Number(new Date()) - 1000 * 60 * 60
    }, function (err, data) {
        if (err) {
            console.log(err.message);
            throw err
        } else {
            data.on('data', function (chunk) {
                let event = null
                try {
                    event = JSON.parse(chunk.toString('utf8'))
                } catch (e) {
                    console.warn("JSON parsing problem in container status")
                    return
                }


                const mappedStatus: containerStatusValues = podStatusMap[event.status]
                const podName = event?.Actor.Attributes['dockerized-pod']
                const containerName = event.Actor.Attributes?.name

                if (!podName) {
                    throw new Error("No dockerized-pod attribute. That's weird.")
                }

                if (!containerName) {
                    throw new Error("No container name in status report. That's weird.")
                }

                if (!mappedStatus) {
                    throw new Error(`Status ${event.status} is not in possible containerStatusValues`)
                }

                const podStatus: StoredContainerStatus = {
                    status: mappedStatus,
                    time: event.time,
                    containerName: containerName,
                    podName: podName,
                    nodeName: NODE_NAME
                }

                callbacks.map(cb => cb(podStatus))
            });
        }
    });
}
let callbacks = []

interface containerStatusChangedCallback { (podStatus: StoredContainerStatus): void }

export default function (newCallback: containerStatusChangedCallback): void {
    if (!started) start()
    callbacks.push(newCallback)
}