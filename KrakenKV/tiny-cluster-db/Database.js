const http = require('http');
const delay = require('waitms');
const { createHttpTerminator } = require('http-terminator');
const EventEmitter = require('events');
const LONG_POLLING_LIMIT = 10 * 1000

function createSimpleHttpPostServer(handler, port) {
    const server = http.createServer(async function (req, res) {
        let data = '';
        req.on('data', chunk => {
            data += chunk;
        })
        req.on('end', async () => {

            let response

            try {
                response = await handler(JSON.parse(data));
            } catch (e) {
                response = { error: e.message || String(e) }
            }

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(response));
        })


    })
    server.listen(port);
    return server
}

class Database {
    store = null
    constructor({ port }) {
        if (!port) {
            port = 23009;
        }

        //For workers to detect server restart
        this.serverId = Math.random().toString(36).substring(2, 15)
        this.server = createSimpleHttpPostServer(this.onRequest.bind(this), port);
        this.serverTerminator = createHttpTerminator({ server: this.server })
        this.watchers = []
    }

    getServerId() {
        return this.serverId
    }

    async kill() {
        await this.serverTerminator.terminate();
    }

    async onRequest(data) {
        if (data.expectedServerId !== this.serverId) {
            return { serverId: this.serverId, updates: {} }
        }

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

        //wait only if communication already established
        let lastDelay = 100
        const stopWaitingAt = Date.now() + LONG_POLLING_LIMIT;

        while (stopWaitingAt > Date.now()) {
            //very ineffective with 1000+ keys
            for (const [key, { value, ts }] of Object.entries(this.store)) {
                if (ts > data.lastUpdate) {
                    updates[key] = { value, ts };
                }
            }

            if (Object.keys(updates).length == 0) {
                await delay(lastDelay);
                lastDelay *= 2;
            } else {
                break;
            }
        }


        const response = { serverId: this.serverId, updates }

        return response
    }

    async get(key) {
        while (this.store == null) {
            await delay(100);
        }
        return this.store[key];
    }

    async getRecurse(prefix) {
        const result = {}
        for (const [key, { value, ts }] of Object.entries(this.store)) {
            if (key.startsWith(prefix)) {
                result[key] = { value, ts };
            }
        }
        return result;
    }

    async getValue(key) {
        return (await this.get(key)).value;
    }

    async safeUpdate(key, callback) {
        for (let i = 0; i < 100; i++) {
            try {
                let { value, ts } = await this.get(key)
                const newValue = await callback(value)
                await this.set(key, newValue, ts)
                return
            } catch (e) {
                await delay(10 * i + 10 * Math.random())
            }
        }
        throw new Error(`Failed to update key '${key}'`)
    }

    async set(key, value, expectedTs = null) {
        while (this.store == null) {
            await delay(100);
        }
        await delay(3)//Dirty hack allowing us to use timestamp as a unique id for concurrent writes
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
        //notify watchers
        for (let { watcher, prefix } of this.watchers) {
            if (key.startsWith(prefix)) {
                watcher.emit('data', await this.getRecurse(prefix))
            }
        }
    }

    watch(prefix) {
        const watcher = new EventEmitter()
        watcher.stop = () => {
            this.watchers = this.watchers.filter(w => w.watcher !== watcher)
        }
        this.watchers.push({ watcher, prefix })

        this.getRecurse(prefix)
            .then(values => watcher.emit('data', values))

        return watcher
    }
}

module.exports = Database