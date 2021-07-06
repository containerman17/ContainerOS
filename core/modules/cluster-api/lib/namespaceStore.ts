import database from "../../../lib/database"
import { keyable, StoredNamespace } from "../../../definitions";

let namespaceList: keyable<StoredNamespace> = null

let started = false
export function isReady() {
    if (!started) {
        started = true
        database.listenForUpdates("namespaces", function (newNamespaceList: keyable<StoredNamespace>) {
            namespaceList = newNamespaceList
        })
    }

    return namespaceList !== null
}

export function getNamespace(nsName) {
    return namespaceList[nsName]
}