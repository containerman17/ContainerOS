const getNodesSorted = require('../nodes/getNodesSorted')
const db = require('../system/database')
const createLvIfNotExists = require('./createLvIfNotExists')
const applyVolumePlacement = require('./applyVolumePlacement')

module.exports = async function volumeInit(volName) {
    console.log(`- volumeInit:`)
    console.log(`   - started`)

    const nodesToPlace = await getNodesSorted()

    await db.safeUpdate(`volumes/${volName}`, function (vol) {
        if (vol.placement.length === 0) {
            vol.placement.push(nodesToPlace[0])
        }
        return vol
    })

    let vol = await db.getValue(`volumes/${volName}`)
    console.log(`   - set placement to ${vol.placement.join(', ')}`)


    //TODO: create lvm if not exists
    const serverIp = (await db.getValue('nodes'))[vol.placement[0]].ip
    await createLvIfNotExists(volName, serverIp)

    //TODO: initialize DRBD and set to primary
    await applyVolumePlacement(volName)

    //TODO: set to secondary
    //TODO: set initCompleted to  true

    console.log(`   - completed`)
}
