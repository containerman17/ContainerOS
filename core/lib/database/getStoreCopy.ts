import database from "."
import { keyable } from "../../definitions";
import delay from "delay"

//TODO: cache to not create multiple copies StoreCopy for the same key

const storeCopies = {}
export default function getStoreCopy<TypeName>(key): StoreCopy<TypeName> {
    if (!storeCopies[key]) {
        storeCopies[key] = new StoreCopy<TypeName>(key)
    }
    return storeCopies[key]
}

class StoreCopy<TypeName> {
    #keyPrefix = null
    #started = false
    #objectsList: keyable<TypeName> | null = null
    #nameEndingsMap: keyable<string> | null = null
    #nameEndingsMapEnabled = false

    constructor(keyPrefix: string) {
        this.#keyPrefix = keyPrefix
    }
    async #init() {
        if (!this.#started) {
            this.#started = true
            database.listenForUpdates(this.#keyPrefix, (newData: keyable<TypeName>) => {
                this.#objectsList = newData
                this.#formEndingsMap()
            })
        }
        if (this.#objectsList !== null) return

        for (let ms of [1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192]) { // wait for 16 seconds
            await delay(ms)
            if (this.#objectsList !== null) return
        }
        throw "The store for " + this.#keyPrefix + " is not ready"
    }
    #formEndingsMap() {
        if (!this.#nameEndingsMapEnabled) return
        const result = {}
        for (let key of Object.keys(this.#objectsList || {})) {
            const ending = key.split('/').slice(-1)[0]
            result[ending] = key
        }
        this.#nameEndingsMap = result
    }
    async getAll(): Promise<keyable<TypeName>> {
        await this.#init()
        return Object.assign({}, this.#objectsList)
    }
    async getAllKeys(): Promise<string[]> {
        await this.#init()
        return Object.keys(this.#objectsList)
    }
    async getKey(key: string): Promise<TypeName> {
        await this.#init()
        return this.#objectsList[key] || null
    }
    async getByEnding(ending: string) {
        await this.#init()

        if (!this.#nameEndingsMapEnabled) {
            this.#nameEndingsMapEnabled = true
            this.#formEndingsMap()
        }

        const key = this.#nameEndingsMap[ending]
        if (!key) return null
        return this.#objectsList[key]
    }
}