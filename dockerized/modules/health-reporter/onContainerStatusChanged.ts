import Dockerode from "dockerode"
import { keyable, StoredPodStatus } from "../../definitions";
const docker = new Dockerode()

async function run() {
    docker.getEvents({}, function (err, data) {
        if (err) {
            console.log(err.message);
        } else {
            data.on('data', function (chunk) {
                const event = JSON.parse(chunk.toString('utf8'))
                console.log(event)
            });
        }
    });
}

run().catch(console.error)

let callbacks = []

interface containerStatusChangedCallback { (podName: string, podStatus: StoredPodStatus): void }


export default function (newCallback: containerStatusChangedCallback): void {
    callbacks.push(newCallback)
}