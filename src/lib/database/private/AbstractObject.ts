import { MicroserviceUpdate, StoredMicroservice, keyable } from "../../../types"
import safePatch from "./safePatch"
import deepEqual from "deep-equal"
import listenForUpdates from "./listenForUpdates"
import consul from "./consul"
import delay from "delay"
import config from "../../../config"

export default class AbstractObject<Type> {
    private listeningStarted = false
    private callbacks: ((newList: keyable<Type>) => void)[] = []
    private collection = null
    protected readonly prefix

    constructor(prefix: string) {
        this.prefix = prefix
    }
    private startListening() {
        if (this.listeningStarted) return
        this.listeningStarted = true

        listenForUpdates(this.prefix, (newData: keyable<Type>) => {
            this.collection = newData
            this.callbacks.map(callback => callback(this.collection))
        })
    }
    public async ready(): Promise<void> {
        this.startListening()

        for (let i = 0; i < 30; i++) {
            if (this.collection === null) {
                await delay(i * 20)
            } else {
                return //we are ready
            }
        }
        throw new Error(`${this.prefix} is not ready yet`)
    }
    public getAll(): keyable<Type> {
        if (this.collection === null) {
            throw new Error(`You have to call method "await ${this.prefix}.ready()" first`)
        }
        return this.collection
    }
    public get(name: string): Type {
        if (this.collection === null) {
            throw new Error(`You have to call method "await ${this.prefix}.ready()" first`)
        }
        return this.collection[name] || null
    }
    public addListChangedCallback(callback: (newList: keyable<Type>) => void) {
        this.startListening()//it will check if it is already listening

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