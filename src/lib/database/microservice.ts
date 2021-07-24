import { MicroserviceUpdate, StoredMicroservice, keyable } from "../../types"
import safePatch from "./privateMethods/safePatch"
import deepEqual from "deep-equal"
import listenForUpdates from "./privateMethods/listenForUpdates"

type onChangeCallback = (newList: keyable<StoredMicroservice>) => void

class Microservice {
    #initComplete = false
    #callbacks: onChangeCallback[] = []
    #collection = null
    constructor() {

    }
    async update(microserviceUpdate: MicroserviceUpdate) {
        await safePatch(`microservices/${microserviceUpdate.name}`, (oldDeployment): object => {
            const newData = Object.assign({}, oldDeployment.currentConfig, microserviceUpdate)

            const needNewPods = !deepEqual(//compare configs without scale
                Object.assign({}, oldDeployment.currentConfig, { scale: -1 }),
                Object.assign({}, newData, { scale: -1 }),
            )
            if (needNewPods) {
                oldDeployment.currentPodNames = []
            }

            oldDeployment.currentConfig = newData

            return oldDeployment
        })
    }
    #init() {
        if (this.#initComplete) return
        this.#initComplete = true

        listenForUpdates('microservices', (newData: keyable<StoredMicroservice>) => {
            this.#callbacks.map(callback => callback(newData))
        })
    }
    onListChanged(callback: onChangeCallback) {
        if (this.#initComplete === false) {
            this.#init()
            this.#initComplete = true
        }

        if (this.#collection !== null) {
            callback(this.#collection)
        }
        this.#callbacks.push(callback)
    }
}




export default new Microservice()