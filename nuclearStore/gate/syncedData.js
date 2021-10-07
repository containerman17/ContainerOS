const storeLocator = require('./storeLocator')
const axios = require('axios')
let data = {}

async function set(key, value) {
    const stores = storeLocator.getStores()
    let checks = 0

    const now = Number(new Date())

    const result = await Promise.allSettled(stores.map(async storeIp => {
        await axios.post(`http://${storeIp}:3000/sync/bulk`, {
            [key]: { value, ts: now }
        }, { timeout: 2000 })

        checks++
    }))

    if (checks > 0) {
        data[key] = { value, ts: now }
        return { success: true }
    } else {
        return { success: false, error: 'All stores are down' }
    }
}

async function get(key) {
    if (data[key]) {
        return data[key]
    } else {
        return {
            ts: 0, value: null
        }
    };
}
module.exports = { set, get }