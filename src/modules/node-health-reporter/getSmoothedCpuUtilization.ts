import osUtils from 'os-utils'
import config from "../../config"

let calculatedCpuLoad = 24
const valuesHistory = []
const INTERVAL_SECONDS = config.get('NODE_HEALTH_REPORTING_INTERVAL') / 4 / 1000
const HISTORY_SIZE = 15 / INTERVAL_SECONDS

setInterval(async () => {
    osUtils.cpuUsage(function (usageRaw) {
        console.debug('got cpu')

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
