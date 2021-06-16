import database from "../../lib/database"
import { NodeHealth } from "../../definitions"

import getSmoothedCpuUtlization from "../../lib/system/getSmoothedCpuUtlization"
import getDefaultNetworkInterface from "../../lib/system/getDefaultNetworkInterface"

import { NODE_HEALTH_INTERVAL, NODE_NAME } from "../../config"

let myIp = getDefaultNetworkInterface().then(iface => iface.ip_address)

async function start(): Promise<void> {
    setInterval(async () => {
        const health: NodeHealth = {
            cpuUtilization: getSmoothedCpuUtlization(),
            cpuBooking: 0, //TODO: summ all container limits
            RamUtilization: 0,
            RamBooking: 0,//TODO: summ all container limits
            lastUpdatedUTC: new Date().toUTCString(),
            lastUpdatedTs: Number(new Date()),
            ip: await myIp
        }
        database.setPath(`nodeHealth/${NODE_NAME}`, health)
    }, NODE_HEALTH_INTERVAL)
}

export default { start }

if (require.main === module) {
    start();
}
