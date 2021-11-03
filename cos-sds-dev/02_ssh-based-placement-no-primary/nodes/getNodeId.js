const db = require('../system/database')

module.exports = async function getNodeId(nodeName) {
    //return from cache
    const idsData = await db.getValue(`nodeIds`)
    if (idsData && idsData.ids && idsData.ids[nodeName]) {
        return idsData.ids[nodeName]
    }

    //set port then

    let appliedId

    await db.safeUpdate(`nodeIds`, function (oldData) {
        const data = oldData || {
            ids: {},
            lastId: 0
        }

        //double check just in case if updated since last operation
        if (data.ids[nodeName]) {
            appliedId = data.ids[nodeName]
            return data
        }

        data.lastId++
        appliedId = data.lastId
        data.ids[nodeName] = appliedId

        return data
    })
    return appliedId
}