export default class PuppetPromise<T>{
    resolve: (value?: T | PromiseLike<T>) => void
    reject: (value?: T | PromiseLike<T>) => void
    promise: Promise<T>

    private alreadyFullfilled = false

    isFulfilled(): boolean {
        return this.alreadyFullfilled
    }

    constructor() {
        this.promise = new Promise((resolve, reject) => {
            this.resolve = (...args) => {
                this.alreadyFullfilled = true
                return resolve(...args)
            }
            this.reject = (...args) => {
                this.alreadyFullfilled = true
                return reject(...args)
            }
        })
    }
}
