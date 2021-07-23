module.exports = class Timer {
    lastTs
    constructor() {
        this.lastTs = Number(new Date)
    }
    report(message) {
        const diff = Number(new Date) - this.lastTs
        this.lastTs = Number(new Date)
        console.log("TIMER: " + message + " in " + Math.round(diff / 100) / 10 + " sec.")
    }
}