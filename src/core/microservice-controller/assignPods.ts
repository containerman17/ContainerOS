import { keyable, StoredMicroservice, StoredPod } from "containeros-sdk";
import { database } from "containeros-sdk"
import randomstring from "randomstring"



export default async function (microserviceList: keyable<StoredMicroservice>) {
    for (let [msName, microservice] of Object.entries(microserviceList)) {
        if (microservice.currentPodNames.length === microservice.currentConfig.scale) {
            continue
        }
        await database.microservice.safePatch(msName, async (oldMicroservice: StoredMicroservice): Promise<StoredMicroservice> => {
            const microservice = { ...oldMicroservice }
            const diff = microservice.currentPodNames.length - microservice.currentConfig.scale

            if (diff > 0) {
                //delete a pod
                microservice.currentPodNames = microservice.currentPodNames.slice(0, -1 * diff)
            } else {
                //add one pod at a time
                // for (let i = 0; i < (-1 * diff); i++) {
                //TODO: this line can really slow down the system, especially on failed update
                const selectedNode = await database.nodeHealth.getLeastBusyServerName()
                const randomId = randomstring.generate({ length: 5, charset: 'alphanumeric', capitalization: 'lowercase' })
                const newPodName = `${selectedNode}/${microservice.currentConfig.name}-${randomId}`
                microservice.currentPodNames.push(newPodName)
                // }
            }
            return microservice
        }
        )
    }
}
