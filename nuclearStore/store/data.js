const data = {}

async function get(key) {
    return data[key] || { ts: 0, value: null }
}


async function set(key, value, ts) {
    if (data[key]?.ts > ts) {
        return { success: false, reason: 'timestamp is older' }
    }

    data[key] = { value, ts }
    return { success: true }
}

module.exports = { get, set }