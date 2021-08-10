import database from "../../lib/database"
import PuppetPromise from "../../lib/utils/createPuppetPromise"
import { StoredMicroservice, keyable } from "../../types"
import assignPods from "./assignPods"
import createAndDeletePods from "./createAndDeletePods"
import createIngress from "./createIngress"

//todo: refactor this weird mix of class instance and global variables
let startCompletePuppet: PuppetPromise<any>


class MicroserviceController {
    private subscribed = false

    public async start() {
        startCompletePuppet = new PuppetPromise()
        await database.pod.ready()
        await database.ingress.ready()
        database.consulLib.onLeaderChanged((leader, isMe) => {
            if (isMe) {
                this.subscribe()
            } else {
                this.unsubscribe()
            }
        })
        return startCompletePuppet.promise
    }
    public stop() {
        this.unsubscribe()
    }
    private async onMicroservicesChanged(microservices: keyable<StoredMicroservice>) {
        await assignPods(microservices)
        await createAndDeletePods(microservices)
        await createIngress(microservices)
        startCompletePuppet.resolve()
    }

    private unsubscribe() {
        if (!this.subscribed) return
        database.microservice.removeListChangedCallback(this.onMicroservicesChanged.bind(this))
        this.subscribed = false
    }
    private async subscribe() {
        if (this.subscribed) return
        database.microservice.addListChangedCallback(this.onMicroservicesChanged.bind(this))
        this.subscribed = true
    }
}

export default new MicroserviceController()