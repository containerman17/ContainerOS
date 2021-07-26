import { MicroserviceUpdate, StoredMicroservice, keyable } from "../../../types"
import safePatch from "./safePatch"
import deepEqual from "deep-equal"
import listenForUpdates from "./listenForUpdates"
import consul from "./consul"


export default class AbstractObject<Type> {
    private initComplete = false
    private callbacks: ((newList: keyable<Type>) => void)[] = []
    private collection = null
    protected readonly prefix

    constructor(prefix: string) {
        this.prefix = prefix
    }

    private init() {
        if (this.initComplete) return
        this.initComplete = true

        listenForUpdates('microservices', (newData: keyable<Type>) => {
            this.callbacks.map(callback => callback(newData))
        })
    }
    public onListChanged(callback: (newList: keyable<Type>) => void) {
        if (this.initComplete === false) {
            this.init()
            this.initComplete = true
        }

        if (this.collection !== null) {
            callback(this.collection)
        }
        this.callbacks.push(callback)
    }
    public async update(name: string, data: Type) {
        await consul.kv.set({
            key: this.prefix + '/' + name,
            value: JSON.stringify(data, null, 2)
        })
    }
}