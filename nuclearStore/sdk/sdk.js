const axios = require('axios');

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



module.exports = { get, set, setHost(h) { host = h } }