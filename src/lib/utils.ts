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

