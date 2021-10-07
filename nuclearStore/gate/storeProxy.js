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
    const promiseResults = await Promise.allSettled(stores.map(async storeIp => {
        return await axios.get(`http://${storeIp}:3000/replication/get/${key}`)
    }))

    const hasValue = promiseResults.filter(res => res.status === 'fulfilled').length > 0
    if (!hasValue) {
        return { success: false, error: 'All storages are down' }
    }
    console.log('promiseResults', promiseResults)

    let latestTs = 0
    let latestData = null

    for (let promiseResult of promiseResults) {
        if (promiseResult?.value?.data?.ts > latestTs) {
            latestTs = promiseResult.value.data.ts
            latestData = promiseResult.value.data.value
        }
    }

    return { ts: latestTs, value: latestData, key: key }
};


module.exports = { set, get }