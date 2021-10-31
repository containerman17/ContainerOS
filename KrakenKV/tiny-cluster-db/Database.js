const http = require('http');
const delay = require('./delay');

const LONG_POLLING_LIMIT = 10 * 1000

function createSimpleHttpPostServer(handler, port) {
    http.createServer(function (req, res) {
        let data = '';
        req.on('data', chunk => {
            data += chunk;
        })
        req.on('end', () => {
            console.log(JSON.parse(data).todo); // 'Buy the milk'
            res.end();
        })

        let response

        try {
            response = await handler(JSON.parse(data));
        } catch (e) {
            console.log(e);
            response = { error: e.message || String(e) }
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(response));
    }).listen(port);
}

class Database {
    store = null
    constructor({ port }) {
        if (!port) {
            port = 23009;
        }

        //For workers to detect server restart
        this.serverId = Math.random().toString(36).substring(2, 15)
        createSimpleHttpPostServer(this.onRequest.bind(this), port);
    }

    async onRequest(data) {
        if (this.store == null) {
            this.store = {};
        }
        //get updates from backup node
        for (const [key, { value, ts }] of Object.entries(data.items || {})) {
            if (this.store[key] && this.store[key].ts > ts) {
                continue;
            }
            this.store[key] = { value, ts };
        }
        //send updates to backup node
        let updates = {}

        const stopWaitingAt = Date.now() + LONG_POLLING_LIMIT;

        while (stopWaitingAt > Date.now()) {
            //very ineffective with 1000+ keys
            for (const [key, { value, ts }] of Object.entries(this.store)) {
                if (ts > data.lastUpdate) {
                    updates[key] = { value, ts };
                }
            }
            if (Object.keys(updates).length == 0) {
                await delay(1000);
            } else {
                break;
            }
        }

        return { serverId: this.serverId, updates }
    }

    async get(key) {
        while (this.store == null) {
            await delay(100);
        }
        return this.store[key];
    }

    async getValue(key) {
        return (await this.get(key)).value;
    }

    async set(key, value, expectedTs = null) {
        while (this.store == null) {
            await delay(100);
        }
        if (expectedTs === 0 && this.store[key]) {
            throw new Error(`Key '${key}' already exists but got expectedTs = 0`);
        }
        if (expectedTs !== null && expectedTs > 0 && this.store[key].ts !== expectedTs) {
            throw new Error(`Key '${key}' expected to have ts=${expectedTs} but has ts=${this.store[key].ts}`)
        }
        this.store[key] = {
            value: value,
            ts: Date.now()
        };
    }
}

module.exports = Database