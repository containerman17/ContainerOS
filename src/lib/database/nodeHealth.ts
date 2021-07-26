import { NodeHealth, keyable } from "../../types";
import AbstractObject from "./private/AbstractObject";
import config from "../../config"
import delay from "delay"

let lastDelay: Promise<void> = Promise.resolve()

const getUtilizationPercent = (nodeHealth: NodeHealth): number => {
    return Math.max(
        nodeHealth.cpuUtilization,
        nodeHealth.cpuBooking / config.get('CPU_OVERBOOKING_RATE'),
        nodeHealth.RamUtilization,
        nodeHealth.RamBooking / config.get('MEMORY_OVERBOOKING_RATE'),
    )
}

const isAlive = (nodeHealth: NodeHealth): boolean => {
    const ts = Number(new Date())
    const healthReportDelay = ts - nodeHealth.lastUpdatedTs
    return healthReportDelay < (config.get('NODE_HEALTH_INTERVAL') * 3)
}

class NodeHealthController extends AbstractObject<NodeHealth> {
    constructor() {
        super('nodeHealth')
    }
    public async getLeastBusyServerName(): Promise<string> {
        await this.ready()

        await lastDelay//await for the next health reports to come since last schedule
        lastDelay = delay(config.get("NODE_HEALTH_INTERVAL"))

        const allServers = this.getAll()

        let result = null
        let minUtilization = Number.MAX_SAFE_INTEGER

        //get alive server with minimum utilization
        for (let [serverName, healthData] of Object.entries(allServers)) {
            if (!isAlive(healthData)) {
                continue
            }
            const utilization = getUtilizationPercent(healthData)
            if (utilization < minUtilization) {
                minUtilization = utilization
                result = serverName
            }
        }
        if (!result) {
            throw Error("Woops! No more alive servers. The cluster is dead")
        }
        return result
    }
}

export default new NodeHealthController()