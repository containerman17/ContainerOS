import { keyable, NodeHealth } from "../../definitions";
import { SCHEDULE_DELAY, NODE_HEALTH_INTERVAL, RAM_OVERBOOKING_RATE, CPU_OVERBOOKING_RATE } from "../../config";
import delay from "delay"

let healthData: TransformedHealthReport[] = null

type TransformedHealthReport = {
    name: string,
    utilizationPercent: number,
    alive: boolean
}

export function gotNewHealthData(newHealthData: keyable<NodeHealth>) {
    const transformedHealthData = []

    const ts = Number(new Date())

    for (let key in newHealthData) {
        const report = newHealthData[key]
        const healthReportDelay = ts - report.lastUpdatedTs

        const result: TransformedHealthReport = {
            name: key.split('/').slice(-1)[0],
            utilizationPercent: Math.max(
                report.cpuUtilization,
                report.cpuBooking / CPU_OVERBOOKING_RATE,
                report.RamUtilization,
                report.RamBooking / RAM_OVERBOOKING_RATE,
            ),
            alive: healthReportDelay < (NODE_HEALTH_INTERVAL * 3)
        }
        transformedHealthData.push(result)
    }
    healthData = transformedHealthData;
}

let lastDelay = Promise.resolve()
export async function getLeastBusyServer() {
    await waitForHealthData()
    //wait 3 seconds between schedule next container
    await lastDelay
    lastDelay = delay(SCHEDULE_DELAY)

    const result = healthData
        .filter(server => server.alive === true)
        .sort((x, y) => x.utilizationPercent < y.utilizationPercent ? 1 : -1)[0]

    if (!result) {
        throw "No alive servers to schedule"
    }
    return result.name
}

let waitForHealthData = async function () {
    const frequency = 1000
    for (let i = 0; i < NODE_HEALTH_INTERVAL / frequency * 3; i++) {
        if (healthData !== null) {
            waitForHealthData = () => Promise.resolve()// dirty optimization
            return
        }
        await delay(frequency)
    }
    console.error("No server health data for NODE_HEALTH_INTERVAL * 3")
}