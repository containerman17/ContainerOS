import database from "../../lib/database"
import { StoredMicroservice, keyable } from "../../types"
import createPods from "./assignPods"
import assignPods from "./createAndDeletePods"

const onMicroservicesChanged = async function (microservices: keyable<StoredMicroservice>) {
    await assignPods(microservices)
    await createPods(microservices)
}

let subscribed = false

const start = async function () {
    await database.pod.ready()
    database.system.onLeaderChanged(function (leader, isMe) {
        if (isMe) {
            subscribe()
        } else {
            unsubscribe()
        }
    })
}

async function subscribe() {
    if (subscribed) return
    database.microservice.addListChangedCallback(onMicroservicesChanged)
    subscribed = true
}

async function unsubscribe() {
    if (!subscribed) return
    database.microservice.removeListChangedCallback(onMicroservicesChanged)
    subscribed = false

}

export default { start, stop: unsubscribe }