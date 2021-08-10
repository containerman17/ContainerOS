import { keyable, StoredIngress, StoredMicroservice, StoredPod } from "../../types";
import database from "../../lib/database"
import generateServiceName from "./generateServiceName";

export default async function (microserviceList: keyable<StoredMicroservice>) {

    const ingressList: keyable<StoredIngress> = database.ingress.getAll()

    //TODO: create new ingress for each microservice

    let promises = []
    const desiredIngressNames = []

    for (let [msName, microservice] of Object.entries(microserviceList)) {
        if (microservice.currentConfig.scale < 1) continue

        for (let [containerName, container] of Object.entries(microservice.currentConfig.containers)) {
            for (let [port, domain] of Object.entries(container.httpPorts)) {
                const ingressName = generateServiceName(msName, containerName, Number(port))

                desiredIngressNames.push(ingressName)//later we will use it to delete unneeded ingresses

                if (!ingressList[ingressName]) {//create if not exist
                    promises.push(database.ingress.update(ingressName, {
                        name: ingressName,
                        service: ingressName,
                        domain: domain
                    }))
                }
            }
        }
    }

    const ingressesToDelete = Object.keys(ingressList).filter(name => !desiredIngressNames.includes(name))

    for (let ingressName of ingressesToDelete) {
        promises.push(database.ingress.delete(ingressName))
    }

    await Promise.all(promises)

}