import osUtils from 'os-utils'

let calculatedCpuLoad = 24
const valuesHistory = []
const INTERVAL_SECONDS = 3
const HISTORY_SIZE = 15 / INTERVAL_SECONDS

setInterval(async () => {
    osUtils.cpuUsage(function (usageRaw) {
        const usage = usageRaw * 100
        valuesHistory.push(usage)
        if (valuesHistory.length > HISTORY_SIZE) {
            valuesHistory.shift()
        }
        calculatedCpuLoad = weightedAverage(valuesHistory)

    })
}, INTERVAL_SECONDS * 1000)

const weightedAverage = function (arr) {
    let total = 0
    let counter = 0

    for (let i = 0; i < arr.length; i++) {
        total += arr[i] * (i + 1)
        counter += (i + 1)
    }

    return total / counter
}
export default (): number => calculatedCpuLoad
