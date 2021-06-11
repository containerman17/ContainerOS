import database from "../../lib/database"
import getSmoothedCpuUtlization from "../../lib/system/getSmoothedCpuUtlization"

import { NODE_HEALTH_INTERVAL, NODE_NAME } from "../../config"

async function start(): Promise<void> {
    setInterval(() => {
        database.setPath(`nodeHealth/${NODE_NAME}`, {
            cpuUtilization: getSmoothedCpuUtlization(),
            cpuBooking: 0, //TODO: summ all container limits
            RamUtilization: 0,
            RamBooking: 0,//TODO: summ all container limits
            lastUpdatedUTC: new Date().toUTCString(),
            lastUpdatedTs: Number(new Date()),
        })
    }, NODE_HEALTH_INTERVAL)
}

export default { start }

if (require.main === module) {
    start();
}
