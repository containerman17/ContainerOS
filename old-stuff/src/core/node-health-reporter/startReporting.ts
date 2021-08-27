import { database } from "containeros-sdk"
import { NodeHealth } from "containeros-sdk"
import config from "../../config"
import getSmoothedCpuUtlization from "./getSmoothedCpuUtilization"

const nodeName = config.get('NODE_NAME')

const report = function () {
    const health: NodeHealth = {
        cpuUtilization: getSmoothedCpuUtlization(),
        cpuBooking: 0, //TODO: summ all container limits
        RamUtilization: 0,
        RamBooking: 0,//TODO: summ all container limits
        lastUpdatedTs: Number(new Date()),
    }
    if (config.get('IS_DEV')) {
        health.lastUpdatedUTC = new Date().toUTCString()
    }
    database.nodeHealth.update(nodeName, health)
}

export default async function start() {
    setInterval(report, config.get('NODE_HEALTH_INTERVAL'))
    report();
}


if (require.main === module) {
    start();
}
