const http = require('http')
const delay = require('waitms')

function makeJsonPost(host, port, data) {
    return new Promise((resolve, reject) => {
        const dataString = JSON.stringify(data)

        const options = {
            hostname: host,
            port: port,
            path: '/',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': dataString.length
            }
        }

        const req = http.request(options, res => {
            let responseCollected = ''

            res.on('data', d => {
                responseCollected += d
            })

            res.on('end', d => {
                try {
                    resolve(JSON.parse(responseCollected))
                } catch (e) {
                    reject(e)
                }
            })
        })

        req.on('error', error => {
            reject(error)
        })

        req.write(dataString)
        req.end()
    })
}

class BackupNode {
    constructor({ dbHost, dbPort, logFunction = null }) {
        this.store = {}
        let lastUpdate = 0
        let lastStoredServerId = ''
        let masterNeedsMyData = false
        this.startComplete = false

        const start = async () => {

            while (!this.killed) {
                try {
                    if (masterNeedsMyData && logFunction) {
                        logFunction('Info', 'Dumping data to the master')
                    }

                    const { serverId, updates } = await makeJsonPost(dbHost, dbPort, {
                        lastUpdate: lastUpdate,
                        items: masterNeedsMyData ? this.store : {},
                        expectedServerId: lastStoredServerId
                    })
                    masterNeedsMyData = false

                    if (lastStoredServerId !== serverId) {
                        lastStoredServerId = serverId
                        masterNeedsMyData = true
                    }

                    for (const [key, { value, ts }] of Object.entries(updates || {})) {
                        if (this.store[key] && this.store[key].ts > ts) {
                            continue;
                        }
                        this.store[key] = { value, ts };
                        logFunction && logFunction('Info', 'Store update', key, value)

                        if (ts > lastUpdate) {
                            lastUpdate = ts
                        }
                    }
                    this.startComplete = true
                } catch (e) {
                    logFunction && logFunction('Error', e)
                    await delay(100)
                }
            }
        }
        start()
    }

    getStoreSnapshot() {
        return Object.assign({}, this.store)
    }

    kill() {
        this.killed = true
    }

    async waitForStart() {
        while (!this.startComplete) {
            await delay(100)
        }
    }
}
module.exports = BackupNode