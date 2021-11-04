const getNodesSorted = require('../nodes/getNodesSorted')
const db = require('../system/database')
const createLvIfNotExists = require('./createLvIfNotExists')
const regenerateVolumeConfig = require('./regenerateVolumeConfig')
const applyNodeConfigs = require('../nodes/applyNodeConfigs')
const executeOnServer = require('../system/executeOnServer')
const getDrbdDeviceName = require('./getDrbdDeviceName')

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


    //place volume into 1 node
    const serverIp = (await db.getValue('nodes'))[vol.placement[0]].ip
    await createLvIfNotExists(volName, serverIp)
    await regenerateVolumeConfig(volName)
    await applyNodeConfigs(false)

    //initialize drbd
    await executeOnServer(serverIp, `
        drbdadm create-md ${volName} --force;
        drbdadm up ${volName};
        drbdadm primary ${volName} --force;
        mkfs.ext4 ${await getDrbdDeviceName(volName)} -F;
        drbdadm secondary ${volName};
    `)

    console.log(`   - init completed`)
}
