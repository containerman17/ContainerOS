const storeLocator = require('./storeLocator')
const axios = require('axios')

async function set(key, value) {
    const stores = storeLocator.getStores()
    let checks = 0

    const result = await Promise.allSettled(stores.map(async storeIp => {
        await axios.post(`http://${storeIp}:3000/replication/set`, {
            key, value, ts: Number(new Date())
        }, { timeout: 2000 })
        checks++
    }))
    console.log('result', result)

    return { success: checks > 0, error: checks > 0 ? undefined : 'All storages are down' }; //TODO: return non-200 code
}

async function get(key) {
    const stores = storeLocator.getStores()
    const responses = await Promise.all(stores.map(async storeIp => {
        await axios.get(`http://${storeIp}:3000/replication/get/${key}`)
    }))

    const latestTs = 0
    const latestData = null

    for (let response of responses) {
        if (response?.data?.ts > latestTs) {
            latestTs = response.data.ts
            latestData = response.data.value
        }
    }

    return { ts: latestTs, value: latestData, key: key }
};


module.exports = { set, get }