import osUtils from 'os-utils'
import config from "../../config"

let calculatedCpuLoad = 24
const valuesHistory = []
const NODE_HEALTH_REPORTING_INTERVAL = config.get('NODE_HEALTH_REPORTING_INTERVAL')
const HISTORY_SIZE = 45 / (NODE_HEALTH_REPORTING_INTERVAL / 1000)

setInterval(async () => {
    osUtils.cpuUsage(function (usageRaw) {
        const usage = usageRaw * 100
        valuesHistory.push(usage)
        if (valuesHistory.length > HISTORY_SIZE) {
            valuesHistory.shift()
        }
        calculatedCpuLoad = weightedAverage(valuesHistory)
    })
}, NODE_HEALTH_REPORTING_INTERVAL)

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
