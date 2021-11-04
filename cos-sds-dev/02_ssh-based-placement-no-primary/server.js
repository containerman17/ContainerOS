const db = require('./system/database')
const delay = require('waitms')
const volumeInit = require('./volumes/initVolume')

db.safeUpdate('desiredVolumes', val => val || ['testvol'])
db.safeUpdate('nodes', val => val || {
    'linstor-test-1': { ip: '95.217.131.185' },
    'linstor-test-2': { ip: '65.108.86.219' },
    'linstor-test-3': { ip: '135.181.192.104' },
    'linstor-test-4': { ip: '65.21.48.216' },
})

async function placementLoop() {
    console.log(`\n\nPlacement loop:`)
    const desiredVolumesList = await db.getValue('desiredVolumes') || []

    for (let volName of desiredVolumesList) {
        console.log(`\n${volName}:`)
        const volInfo = await db.getValue(`volumes/${volName}`)

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
    }
}



async function run() {
    while (true) {
        await placementLoop()
        await delay(4000)
    }
}

run().catch(e => console.error(e) && process.exit(1))