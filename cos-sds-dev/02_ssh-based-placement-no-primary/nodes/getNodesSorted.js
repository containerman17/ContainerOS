const db = require('../system/database')
//just random
module.exports = async function getNodesSorted() {
    const nodes = await db.getValue('nodes')
    const allNodes = Object.keys(nodes)
    return allNodes.sort((a, b) => a > b ? -1 : 1);
}