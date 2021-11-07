const db = require('./system/database')
const delay = require('waitms')
const volumeInit = require('./volumes/initVolume')
const getNodesSorted = require('./nodes/getNodesSorted')
const applyNodeConfigs = require('./nodes/applyNodeConfigs')
const regenerateVolumeConfig = require('./volumes/regenerateVolumeConfig')
const createLvIfNotExists = require('./volumes/createLvIfNotExists')
const addNodesToPlacement = require('./volumes/addNodesToPlacement')
const getNodeInfo = require('./nodes/getNodeInfo')
const REPLICAS = 3

async function placementLoop() {
    console.log(`\n\nPlacement loop:`)
    const desiredVolumesList = await db.getValue('desiredVolumes') || []
    const nodes = await db.getValue('nodes')

    for (let volName of desiredVolumesList) {
        //create empty volume config
        console.log(`\n\nPlacing volume ${volName}`)
        let volInfo = await db.getValue(`volumes/${volName}`)

        if (!volInfo || !volInfo.placement) {
            await db.set(`volumes/${volName}`, { placement: {} })
            volInfo = await db.getValue(`volumes/${volName}`)
        }

        //assign nodes to volumes
        if (Object.keys(volInfo.placement).length < REPLICAS) {
            await addNodesToPlacement(volName, REPLICAS)
            volInfo = await db.getValue(`volumes/${volName}`)
        }

        //create lv if not exists
        for (let nodeName in volInfo.placement) {
            if (!volInfo.placement[nodeName].lvCreated) {
                const { ip: nodeIp } = await getNodeInfo(nodeName)
                console.log(volName, nodeName, 'Creating LV ', nodeIp)

                await createLvIfNotExists(volName, nodeIp)
                await db.safeUpdate(`volumes/${volName}`, function (vol) {
                    vol.placement[nodeName].lvCreated = true
                    return vol
                })
            }
        }
    }
}

async function init() {

    await db.safeUpdate('nodes', function (val) {
        // if (!val)
        val = {}

        // if (!val['linstor-test-1'])
        //     val['linstor-test-1'] = { ip: '95.217.131.185' }
        if (!val['linstor-test-2'])
            val['linstor-test-2'] = { ip: '65.108.86.219' }
        if (!val['linstor-test-3'])
            val['linstor-test-3'] = { ip: '135.181.192.104' }
        if (!val['linstor-test-4'])
            val['linstor-test-4'] = { ip: '65.21.48.216' }
        return val
    })

    // await applyNodeConfigs(true)
    await db.safeUpdate('desiredVolumes', val => val || ['testvol3'])

}

async function run() {
    await init()

    while (true) {
        await placementLoop()
        await delay(4000)
    }
}

run().catch(e => console.error(e) && process.exit(1))