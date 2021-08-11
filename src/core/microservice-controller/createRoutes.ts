import { keyable, StoredRoute, StoredMicroservice, StoredPod } from "containeros-sdk";
import { database } from "containeros-sdk"
import generateServiceName from "./generateServiceName";

export default async function (microserviceList: keyable<StoredMicroservice>) {

    const routeList: keyable<StoredRoute> = database.routes.getAll()

    //TODO: create new route for each microservice

    let promises = []
    const desiredRouteNames = []

    for (let [msName, microservice] of Object.entries(microserviceList)) {
        if (microservice.currentConfig.scale < 1) continue

        for (let [containerName, container] of Object.entries(microservice.currentConfig.containers)) {
            for (let [port, domain] of Object.entries(container.httpPorts)) {
                const routeName = generateServiceName(msName, containerName, Number(port))

                desiredRouteNames.push(routeName)//later we will use it to delete unneeded routes

                if (!routeList[routeName]) {//create if not exist
                    promises.push(database.routes.update(routeName, {
                        name: routeName,
                        service: routeName,
                        domain: domain
                    }))
                }
            }
        }
    }

    const routesToDelete = Object.keys(routeList).filter(name => !desiredRouteNames.includes(name))

    for (let routeName of routesToDelete) {
        promises.push(database.routes.delete(routeName))
    }

    await Promise.all(promises)

}