import database from "."
import { keyable } from "../../definitions";
import delay from "delay"

export default class StoreCopy<TypeName> {
    #keyPrefix = null
    #started = false
    #objectsList: keyable<TypeName> | null = null

    constructor(keyPrefix: string) {
        this.#keyPrefix = keyPrefix
    }
    async #init() {
        if (!this.#started) {
            this.#started = true
            database.listenForUpdates(this.#keyPrefix, (newData: keyable<TypeName>) => {
                this.#objectsList = newData
            })
        }
        if (this.#objectsList !== null) return

        for (let ms of [1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192]) { // wait for 16 seconds
            await delay(ms)
            if (this.#objectsList !== null) return
        }
        throw "The store for " + this.#keyPrefix + " is not ready"
    }
    async getKey(key: string): Promise<TypeName> {
        await this.#init()
        return this.#objectsList[key]
    }
}