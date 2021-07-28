import database from "../../lib/database"
import { StoredMicroservice, keyable } from "../../types"
import createPods from "./assignPods"
import assignPods from "./createAndDeletePods"

const onMicroservicesChanged = async function (microservices: keyable<StoredMicroservice>) {
    await assignPods(microservices)
    await createPods(microservices)
}

async function start() {
    await database.pod.ready()

    database.microservice.addListChangedCallback(onMicroservicesChanged)
}

async function stop() {
    database.microservice.removeListChangedCallback(onMicroservicesChanged)
}

export default { start, stop }