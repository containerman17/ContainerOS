import crypto from "crypto"
import axios from "axios"
import logger from "./logger"
import delay from "delay"

export function sha256(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex')
}

export async function getMyExternalIP() {
    const res = await axios.get('https://api.ipify.org?format=json')
    return res.data.ip
}


// export async function waitForConsul() {
//     for (let i = 0; i < 30; i++) {
//         const isStarted = await isConsulStarted()
//         if (isStarted) {
//             logger.info('Consul started')
//             return
//         } else {
//             logger.debug('Waiting for consul to start')
//             await delay(i * 100)
//         }
//     }
//     throw "COULD NOT START CONSUL"
// }


// async function isConsulStarted() {
//     try {
//         const response = await axios.get(`http://${config.CONSUL_HOST}:8500/v1/catalog/nodes`)
//         if (response.data[0].ID) {
//             return true
//         } else {
//             return false
//         }
//     } catch (e) {
//         return false
//     }
// }