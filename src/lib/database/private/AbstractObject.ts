import { MicroserviceUpdate, StoredMicroservice, keyable } from "../../../types"
import safePatch from "./safePatch"
import listenForUpdates from "./listenForUpdates"
import consul from "./consul"
import delay from "delay"
import config from "../../../config"
import deepequal from "deep-equal"
import { object } from "superstruct"

export default class AbstractObject<Type> {
    private listeningStarted = false
    private callbacks: ((newList: keyable<Type>) => void)[] = []
    private collection = null
    private dataVersion = 0
    protected readonly prefix

    constructor(prefix: string) {
        this.prefix = prefix
    }
    private startListening() {
        if (this.listeningStarted) return
        this.listeningStarted = true

        listenForUpdates(this.prefix, (newData: keyable<Type>, version: number) => {
            this.dataVersion = Number(version)

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
            throw new Error(`You have to call method "await database.${this.prefix}.ready()" first`)
        }
        return this.collection
    }
    public get(name: string): Type {
        if (this.collection === null) {
            throw new Error(`You have to call method "await database.${this.prefix}.ready()" first`)
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
    public removeListChangedCallback(callback: (newList: keyable<Type>) => void) {
        this.callbacks = this.callbacks.filter(cb => cb !== callback)
    }
    public async safePatch(name: string, patch: (oldValue: Type) => Type | Promise<Type>, defaultStringValue = '{}') {
        await safePatch(`${this.prefix}/${name}`, patch, defaultStringValue)

        const { ModifyIndex } = await consul.kv.get({
            key: this.prefix + '/' + name
        })

        await this.waitForVersion(ModifyIndex)//TODO: warning! if stuck, look here

    }
    public async waitForVersion(lastVersion = null): Promise<void> {

        return new Promise((resolve) => {
            if (lastVersion === null) lastVersion = this.dataVersion

            const cb = (newList: keyable<Type>) => {
                if (this.dataVersion >= lastVersion) {
                    this.removeListChangedCallback(cb)
                    // console.log('resolved with ', this.dataVersion)
                    resolve()
                }
            }
            this.addListChangedCallback(cb)
        })
    }
    public async update(name: string, data: Type) {
        //TODO: name here is redudant, we can get it from data
        await consul.kv.set({
            key: this.prefix + '/' + name,
            value: JSON.stringify(data, null, 2)
        })

        const { ModifyIndex } = await consul.kv.get({
            key: this.prefix + '/' + name
        })

        await this.waitForVersion(ModifyIndex)//TODO: warning! if stuck, look here
    }
    public async delete(name: string) {
        const lastVersion = this.dataVersion // fix version before update

        await consul.kv.del({
            key: this.prefix + '/' + name,
        })

        //check updates happened
        await this.waitForVersion(lastVersion)
    }
    public async dropAll() {
        await this.ready()
        if (Object.keys(this.collection).length === 0) {
            return
        }

        this.collection = null

        await consul.kv.del({
            key: this.prefix,
            recurse: true
        })

        await this.ready()
    }
}