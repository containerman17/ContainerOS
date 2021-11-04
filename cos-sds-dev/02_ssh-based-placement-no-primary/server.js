const db = require('./system/database')
const delay = require('waitms')
const volumeInit = require('./volumes/initVolume')
const getNodesSorted = require('./nodes/getNodesSorted')
const applyNodeConfigs = require('./nodes/applyNodeConfigs')
const regenerateVolumeConfig = require('./volumes/regenerateVolumeConfig')
db.safeUpdate('desiredVolumes', val => val || ['testvol'])
db.safeUpdate('nodes', val => val || {
    'linstor-test-1': { ip: '95.217.131.185' },
    'linstor-test-2': { ip: '65.108.86.219' },
    'linstor-test-3': { ip: '135.181.192.104' },
    'linstor-test-4': { ip: '65.21.48.216' },
})

const REPLICAS = 3

async function placementLoop() {
    console.log(`\n\nPlacement loop:`)
    const desiredVolumesList = await db.getValue('desiredVolumes') || []

    for (let volName of desiredVolumesList) {
        console.log(`\n${volName}:`)
        let volInfo = await db.getValue(`volumes/${volName}`)

        //initialize value
        if (!volInfo?.initCompleted) {
            await db.safeUpdate(`volumes/${volName}`, vol => vol || {
                placement: [],
                initCompleted: false
            })

            await volumeInit(volName)
            await db.safeUpdate(`volumes/${volName}`, function (vol) {
                return Object.assign({}, vol, { initCompleted: true })
            })
        }
        //place volumes
        volInfo = await db.getValue(`volumes/${volName}`)
        if (volInfo.placement.length < REPLICAS) {
            const nodesToPlace = await getNodesSorted()

            await db.safeUpdate(`volumes/${volName}`, function (vol) {
                for (let node of nodesToPlace) {
                    if (vol.placement.length < REPLICAS && !vol.placement.includes(node)) {
                        vol.placement.push(node)
                        console.log(`   - Placing on node ${node}`)
                    }
                }
                return vol
            })
            await regenerateVolumeConfig(volName)
        }
    }
    await applyNodeConfigs()
}



async function run() {
    while (true) {
        await placementLoop()
        await delay(4000)
    }
}

run().catch(e => console.error(e) && process.exit(1))