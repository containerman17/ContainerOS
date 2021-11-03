//this is mock for https://www.npmjs.com/package/tiny-cluster-db
const fs = require('fs')
const FAKE_DB_PATH = __dirname + '/../data.json'
if (!fs.existsSync(FAKE_DB_PATH)) {
    fs.writeFileSync(FAKE_DB_PATH, '{}')
}
module.exports = {
    get: async key => {
        return JSON.parse(fs.readFileSync(FAKE_DB_PATH))[key] || { value: null, ts: 0 }
    },
    set: async (key, value) => {
        let db = JSON.parse(fs.readFileSync(FAKE_DB_PATH))
        db[key] = {
            value, ts: Date.now()
        }
        fs.writeFileSync(FAKE_DB_PATH, JSON.stringify(db, null, 2))
    },
    async getValue(key) {
        return (await this.get(key)).value
    },
    async getRecurse(prefix) {
        let db = JSON.parse(fs.readFileSync(FAKE_DB_PATH))
        let result = {}
        for (let key in db) {
            if (key.startsWith(prefix)) {
                result[key] = db[key].value
            }
        }
        return result
    },
    async getValuesRecurse(prefix) {
        const fromDb = await this.getRecurse(prefix)
        const result = {}
        for (let [key, val] of Object.entries(fromDb)) {
            result[key.slice(-1 * prefix.length + 1)] = val
        }
        return result
    },
    async safeUpdate(key, callback) {
        return this.set(key, callback(await this.getValue(key)))
    }
}