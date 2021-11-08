const getNodeId = require('../nodes/getNodeId')
const db = require('../system/database')
const genDrbdConfig = require('./genDRBDConfig')
const getVolumePort = require('./getVolumePort')
const getDrbdDeviceName = require('./getDrbdDeviceName')

module.exports = async function regenerateVolumeConfig(volName) {
    console.log(`   - regenerateVolumeConfig`)

    //regenerate config
    await db.safeUpdate(`volumes/${volName}`, async function (vol) {
        const configSource = {
            nodes: [],
            port: await getVolumePort(volName),
            device: await getDrbdDeviceName(volName),
            disk: `/dev/vg/${volName}`,
            volName,
        }

        for (let nodeName of Object.keys(vol.placement)) {
            configSource.nodes.push({
                name: nodeName,
                diskless: false,
                id: await getNodeId(nodeName),
                ip: (await db.getValue('nodes'))[nodeName].ip
            })
        }

        vol.drbdConfig = await genDrbdConfig(configSource)
        return vol
    })
}