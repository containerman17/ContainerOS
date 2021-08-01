export default class RateLimit {
    private window: number;
    private limit = 0

    constructor(maxConcurrent, window) {
        this.window = window;
        this.limit = maxConcurrent
        setInterval(() => {
            this.limit = maxConcurrent
        }, this.window)
    }

    public async waitForMyTurn(): Promise<void> {
        return new Promise((resolve) => {
            const checkAndResolve = () => {
                if (this.limit > 0) {
                    this.limit--
                    resolve()
                } else {
                    setTimeout(checkAndResolve, this.window)
                }
            }
            checkAndResolve()
        })
    }
}