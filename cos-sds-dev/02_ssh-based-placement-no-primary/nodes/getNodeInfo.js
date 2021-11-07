const db = require('../system/database')


module.exports = async function (nodeName) {
    const nodes = await db.getValue('nodes')
    return nodes[nodeName] || {}
}