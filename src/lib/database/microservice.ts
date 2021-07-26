import { MicroserviceUpdate, StoredMicroservice, keyable } from "../../types"
import safePatch from "./private/safePatch"
import deepEqual from "deep-equal"
import AbstractObject from "./private/AbstractObject"


class Microservice extends AbstractObject<StoredMicroservice> {
    constructor() {
        super('microservices')
    }
    async update(microserviceUpdate: MicroserviceUpdate) {
        await safePatch(`${this.prefix}/${microserviceUpdate.name}`, (oldDeployment): object => {
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
}




export default new Microservice()