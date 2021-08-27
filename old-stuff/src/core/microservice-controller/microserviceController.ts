import { database } from "containeros-sdk"
import { StoredMicroservice, keyable } from "containeros-sdk"
import assignPods from "./assignPods"
import createAndDeletePods from "./createAndDeletePods"
import createRoutes from "./createRoutes"
import PuppetPromise from "../../lib/utils/createPuppetPromise"
import logger from "../../lib/logger"
import consulLib from "../../lib/consul/consulLib"

const onMicroservicesChanged = async function (microservices: keyable<StoredMicroservice>) {
    try {
        await assignPods(microservices)
        await createAndDeletePods(microservices)
        await createRoutes(microservices)

        puppetPromise.resolve()
    } catch (e) {
        // logger.error(e)
        throw e
    }
}

let subscribed = false

let puppetPromise = new PuppetPromise()

const start = async function () {
    puppetPromise = new PuppetPromise()

    await database.pod.ready()
    await database.microservice.ready()
    await database.routes.ready()
    consulLib.onLeaderChanged(function (leader, isMe) {
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