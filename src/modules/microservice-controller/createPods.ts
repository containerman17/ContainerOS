import { keyable, StoredMicroservice, StoredPod } from "../../types";
import database from "../../lib/database"

export default function (microserviceList: keyable<StoredMicroservice>) {
    // const pods: keyable<StoredPod> = database.pod.getAll()
    // const desiredPods: keyable<string> = {}

    // for (let [msName, storedMs] of Object.entries(microserviceList)) {
    //     storedMs.currentPodNames.map(podName => desiredPods[podName] = msName)
    // }

    // const desiredPodsNames = Object.keys(desiredPods)
    // const actualPodNames = Object.keys(pods).map(key => key.split('/').slice(-1)[0])

    // const podsToAssign = desiredPodsNames.filter(name => !actualPodNames.includes(name))
    // const podsToDelete = actualPodNames.filter(name => !desiredPodsNames.includes(name))

    // console.log({ desiredPodsNames, actualPodNames, podsToAssign, podsToDelete })

    // //TODO: assign new pods
    // for (let podName of podsToAssign) {
    //     const selectedNode = await database.nodeHealth.getLeastBusyServerName()
    // }
}