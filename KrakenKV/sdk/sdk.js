const axios = require('axios');
const EventEmitter = require('events');

let host = 'http://localhost:3000';

async function get(key, { ts, recurse } = {}) {
    let res = await axios.get(`${host}/kv/${key}${recurse ? '?recurse=true' : ''}`);
    return (ts || recurse) ? res.data : res.data.value;
}

async function set(key, value, checkTs = undefined) {
    await axios.post(`${host}/kv/`, {
        key, value, checkTs
    })
}

class Watch extends EventEmitter {
    stop() {
        this.removeAllListeners()
        this.stopped = true
    }
    constructor(key) {
        super()

        let data = {}
        const start = async () => {
            let lastTs = 0;
            let firstRequest = true;

            while (!this.stopped) {
                try {
                    let url = `${host}/kv/${key}?watch=${lastTs}`

                    if (firstRequest) {
                        url = `${host}/kv/${key}?recurse=true`
                        firstRequest = false;
                    }

                    let res = await axios.get(url);
                    data = Object.assign(data, res.data);
                    lastTs = Math.max(0, ...Object.values(data).map(val => val.ts))

                    //delete null values
                    for (let [key, val] of Object.entries(res.data)) {
                        if (val.value === null) {
                            delete data[key];
                        }
                    }

                    this.emit('data', data);
                } catch (e) {
                    this.emit('error', e);
                }
            }
        }
        start()
    }
}

module.exports = {
    get, set,
    setHost(h) { host = h },
    watch() { return new Watch(...arguments) }
}