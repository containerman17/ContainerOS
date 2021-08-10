import database from "../../lib/database"
import { StoredMicroservice, keyable } from "../../types"
import assignPods from "./assignPods"
import createAndDeletePods from "./createAndDeletePods"
import createIngress from "./createIngress"
import PuppetPromise from "../../lib/utils/createPuppetPromise"
import logger from "../../lib/logger"

const onMicroservicesChanged = async function (microservices: keyable<StoredMicroservice>) {
    try {
        await assignPods(microservices)
        await createAndDeletePods(microservices)
        await createIngress(microservices)

        puppetPromise.resolve()
    } catch (e) {
        // logger.error(e)
        throw e
    }
}

let subscribed = false

let puppetPromise = new PuppetPromise()

const start = async function () {
    puppetPromise.reject('it was never started')
    puppetPromise = new PuppetPromise()

    await database.pod.ready()
    await database.microservice.ready()
    await database.ingress.ready()
    database.consulLib.onLeaderChanged(function (leader, isMe) {
        if (isMe) {
            subscribe()
        } else {
            unsubscribe()
        }
    })
    return puppetPromise.promise
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