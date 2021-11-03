const getNodeId = require('../nodes/getNodeId')
const db = require('../system/database')
const genDrbdConfig = require('./genDRBDConfig')
const getVolumePort = require('./getVolumePort')

module.exports = async function applyVolumePlacement(volName) {
    console.log(`   - applyVolumePlacement`)
    //regenerate config

    const vol = await db.getValue(`volumes/${volName}`)

    const configSource = {
        nodes: [],
        port: await getVolumePort(volName),
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

    const volConfig = await genDrbdConfig(configSource)
    console.log(`volConfig`, volConfig)
}