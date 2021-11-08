const db = require('../system/database')
const delay = require('waitms')
const volumeInit = require('../volumes/initVolume')
const getNodesSorted = require('../nodes/getNodesSorted')
const applyNodeConfigs = require('../nodes/spreadConfigsToServers')
const regenerateVolumeConfig = require('../volumes/regenerateVolumeConfig')
const createLvIfNotExists = require('../volumes/createLvIfNotExists')

module.exports = async function (volName, resiredReplicas) {

    const nodesToPlace = await getNodesSorted()

    await db.safeUpdate(`volumes/${volName}`, function (vol) {
        for (let node of nodesToPlace) {
            if (Object.keys(vol.placement).length < resiredReplicas && !vol.placement[node]) {
                vol.placement[node] = {}
                console.log(`   - Placing on node ${node}`)
            }
        }
        return vol
    })

}