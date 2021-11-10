const db = require('./system/database')
const delay = require('waitms')
// const volumeInit = require('./volumes/initVolume')
// const getNodesSorted = require('./nodes/getNodesSorted')
const spreadConfigsToServers = require('./nodes/spreadConfigsToServers')
const regenerateVolumeConfig = require('./volumes/regenerateVolumeConfig')
const createLvIfNotExists = require('./volumes/createLvIfNotExists')
const addNodesToPlacement = require('./volumes/addNodesToPlacement')
const getNodeInfo = require('./nodes/getNodeInfo')
const executeOnServer = require('./system/executeOnServer')
const getDrbdDeviceName = require('./volumes/getDrbdDeviceName')
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
            await db.set(`volumes/${volName}`, { placement: {}, })
            volInfo = await db.getValue(`volumes/${volName}`)
        }
        if (!volInfo.desiredPrimary) {
            await db.safeUpdate(`volumes/${volName}`, val => Object.assign(val || {}, { desiredPrimary: null }))
            volInfo = await db.getValue(`volumes/${volName}`)
        }

        //assign nodes to volumes
        if (Object.keys(volInfo.placement).length < REPLICAS) {
            await addNodesToPlacement(volName, REPLICAS)
            volInfo = await db.getValue(`volumes/${volName}`)
        }

        //TODO: spread out configs
        await regenerateVolumeConfig(volName)
        await spreadConfigsToServers()

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
                volInfo = await db.getValue(`volumes/${volName}`)
            }
        }
        //create md if not exists

        for (let nodeName in volInfo.placement) {

            //create md if not exists

            if (!volInfo.placement[nodeName].mdCreated) {
                const { ip: nodeIp } = await getNodeInfo(nodeName)
                console.log(volName, nodeName, 'Creating MD ', nodeIp)

                const result = await executeOnServer(nodeIp, `drbdadm create-md ${volName} --force; drbdadm up ${volName}`)
                await db.safeUpdate(`volumes/${volName}`, function (vol) {
                    vol.placement[nodeName].mdCreated = true
                    return vol
                })
                volInfo = await db.getValue(`volumes/${volName}`)
                console.log(`Create md result`, result.stdout + "\n\n\n" + result.stderr)
            }
        }

        //TODO: init first node
        if (!volInfo.initialized) {
            const { ip: nodeIp } = await getNodeInfo(Object.keys(volInfo.placement)[0])

            await executeOnServer(nodeIp, `drbdadm primary --force ${volName}`)
            await executeOnServer(nodeIp, `mkfs.ext4 ${await getDrbdDeviceName(volName)} -F`)
            await executeOnServer(nodeIp, `drbdadm secondary ${volName}`)

            await db.safeUpdate(`volumes/${volName}`, function (vol) {
                vol.initialized = true
                return vol
            })
            volInfo = await db.getValue(`volumes/${volName}`)
        }
        if (volInfo.desiredPrimary !== volInfo.primary) {
            for (let nodeName in volInfo.placement) {
                if (volInfo.desiredPrimary !== nodeName) {
                    const { ip: nodeIp } = await getNodeInfo(nodeName)

                    console.log(volName, nodeName, 'Setting secondary')
                    await executeOnServer(nodeIp, `umount ${await getDrbdDeviceName(volName)}`)
                    await executeOnServer(nodeIp, `drbdadm secondary ${volName}`)
                }
            }
            for (let nodeName in volInfo.placement) {
                if (volInfo.desiredPrimary === nodeName) {
                    const { ip: nodeIp } = await getNodeInfo(nodeName)

                    console.log(volName, nodeName, 'Setting primary')
                    await executeOnServer(nodeIp, `drbdadm primary ${volName}`)
                    await executeOnServer(nodeIp, `mkdir -p /data/${volName}`)
                    await executeOnServer(nodeIp, `mount ${await getDrbdDeviceName(volName)} /data/${volName}`)
                }
            }
            await db.safeUpdate(`volumes/${volName}`, function (vol) {
                vol.primary = vol.desiredPrimary
                return vol
            })
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