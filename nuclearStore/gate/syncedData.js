const storeLocator = require('./storeLocator')
const axios = require('axios')
const delay = require('delay')
let data = {}

let syncComplete = false

storeLocator.subscribeNewStores(async address => {
    //first download everything
    const res = await axios.get(`http://${address}:3000/sync/bulk`)

    await Promise.allSettled(Object.keys(res.data).map(async key => {
        const { ts, value } = res.data[key]
        if (!data[key] || data[key].ts < ts) {
            set(key, value, ts)
        }
    }))

    //then upload
    await axios.post(`http://${address}:3000/sync/bulk`, data)

    syncComplete = true
})

async function awaitSync() {
    while (!syncComplete) {
        console.log(`Waiting for the first sync`)
        await delay(100)
    }
}

let setLock = false

async function set(key, value, ts = null, checkTs = null) {
    while (setLock) {
        await delay(20)
    }
    setLock = true
    try {
        const stores = storeLocator.getStores()
        let checks = 0

        if (checkTs !== null) {
            const existing = await get(key)

            if (existing.ts !== checkTs) {
                return { success: false, error: `checkTs (${checkTs}) does not match existing (${existing.ts})` }
            }
        }

        ts = ts || Number(new Date())

        const result = await Promise.allSettled(stores.map(async storeIp => {
            await axios.post(`http://${storeIp}:3000/sync/bulk`, {
                [key]: { value, ts }
            }, { timeout: 2000 })

            checks++
        }))

        if (checks > 0) {
            data[key] = { value, ts }
            return { success: true }
        } else {
            return { success: false, error: 'All stores are down' }
        }
    } finally {
        setLock = false
    }
}

async function get(key) {
    await awaitSync()
    if (data[key]) {
        return data[key]
    } else {
        return {
            ts: 0, value: null
        }
    };
}
module.exports = { set, get }