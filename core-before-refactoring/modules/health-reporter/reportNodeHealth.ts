import database from "../../lib/database"
import { NodeHealth } from "../../definitions"
import getSmoothedCpuUtlization from "../../lib/system/getSmoothedCpuUtlization"
import { NODE_NAME } from "../../config"
import getDefaultNetworkInterface from "../../lib/system/getDefaultNetworkInterface"

let myIp = getDefaultNetworkInterface().then(iface => iface.ip_address)

export default async function () {
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
}