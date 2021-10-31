const http = require('http')
const delay = require('./delay')

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
            console.log(`statusCode: ${res.statusCode}`)
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

        req.write(data)
        req.end()
    })
}

class BackupNode {
    constructor({ dbHost, dbPort, logFunction = null }) {
        this.store = {}
        let lastUpdate = 0
        let lastStoredServerId = ''
        let masterNeedsMyData = false

        while (true) {
            try {
                if (masterNeedsMyData && logFunction) {
                    logFunction('Info', 'Dumping data to the master')
                }

                const { serverId, updates } = await makeJsonPost(dbHost, dbPort, {
                    lastUpdate: this.lastUpdate,
                    items: masterNeedsMyData ? this.store : {}
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
                    if (ts > lastUpdate) {
                        lastUpdate = ts
                    }
                }
            } catch (e) {
                logFunction && logFunction('Error', e)
                await delay(1000)
            }
        }
    }
}
module.exports = BackupNode