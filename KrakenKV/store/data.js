let data = {}

async function getAll() {
    return Object.assign({}, data)
}

async function reset() {
    data = {}
    return data
}

async function set(key, value, ts) {
    if (data[key]?.ts > ts) {
        return { success: false, reason: 'timestamp is older' }
    }

    data[key] = { value, ts }
    return { success: true }
}

module.exports = { set, getAll, reset }