const getNodeId = require('../nodes/getNodeId')
const db = require('../system/database')
const genDrbdConfig = require('./genDRBDConfig')
const getVolumePort = require('./getVolumePort')

module.exports = async function applyVolumePlacement(volName) {
    console.log(`   - applyVolumePlacement`)
    //regenerate config
    const port = await getVolumePort(volName)

    await db.safeUpdate(`volumes/${volName}`, async function (vol) {
        const configSource = {
            nodes: [],
            port,
            device: `/dev/cossds-${volName}`,
            disk: `/dev/vg/${volName}`
        }

        for (let nodeName of vol.placement) {
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