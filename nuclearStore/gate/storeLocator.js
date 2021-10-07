const { Resolver } = require('dns').promises;
const storesFromConfig = process.env.NUCLEAR_STORES.split(',')
const IP_REGEXP = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/gi;
const resolver = new Resolver();
const axios = require('axios')
const allKnownStores = new Set()
const aliveStores = new Set()



async function discoverStores() {
    for (address of storesFromConfig) {
        if (IP_REGEXP.test(address)) {
            allKnownStores.add(address)
        } else {
            const resolveResult = await resolver.resolve4(address)
            resolveResult.map(ip => allKnownStores.add(ip))
        }
    }
}

async function checkStoreLiveness() {
    for (address of allKnownStores.values()) {
        console.log(`Check alive`, address)
        try {
            const reponse = await axios.get(`http://${address}:3000/healthz`)
            if (reponse.data.app !== 'nuclear-store') {
                throw new Error('Not a nuclear store')
            }
            aliveStores.add(address)
        } catch (e) {
            console.log(e)
            aliveStores.delete(address)
        }
    }
}

async function checkHosts() {
    await discoverStores()
    await checkStoreLiveness()
    console.log(`aliveStores`, aliveStores)
}

async function start() {
    await checkHosts()
    setInterval(checkHosts, 5000)
}

module.exports = { start, getStores: () => [...aliveStores.values()] }