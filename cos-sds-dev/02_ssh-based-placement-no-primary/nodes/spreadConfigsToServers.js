const db = require('../system/database')
const copyFileToServer = require('../system/copyFileToServer')
const executeOnServer = require('../system/executeOnServer')
const createLvIfNotExists = require('../volumes/createLvIfNotExists')

module.exports = async function (/*execute = true*/) {
    //1. Update desired configs

    await db.safeUpdate('nodes', async function (oldNodes) {
        const nodes = Object.assign({}, oldNodes)
        const allVolumes = await db.getValuesRecurse(`volumes/`)

        for (let nodeName in nodes) {
            nodes[nodeName].desiredConfig = ``
        }

        for (let [volname, vol] of Object.entries(allVolumes)) {
            if (vol === null) continue
            for (let nodeName in vol.placement) {
                nodes[nodeName].desiredConfig += vol.drbdConfig
            }
        }

        return nodes
    })


    //2. If actual config different, reapply   
    await db.safeUpdate('nodes', async function (nodes) {
        const promiseGen = async function (nodeName) {
            if (nodes[nodeName].appliedConfig !== nodes[nodeName].desiredConfig) {
                try {
                    console.log(`   - applying new config for ${nodeName}`)
                    await copyFileToServer(nodes[nodeName].ip, `/etc/drbd.d/r0.res`, nodes[nodeName].desiredConfig)
                    // if (execute) {
                    //     const adjustOut = await executeOnServer(nodes[nodeName].ip, `drbdadm adjust all; drbdadm status all`)
                    //     console.debug("STDOUT: " + adjustOut.stdout)
                    //     console.debug("STDERR:", adjustOut.stderr)
                    nodes[nodeName].appliedConfig = nodes[nodeName].desiredConfig
                    //     console.log(`       - config for ${nodeName} applied`)
                    // } else {
                    //     console.log(`       - config for ${nodeName} NOT applied (execute set to false)`)
                    // }
                } catch (e) {
                    console.log(`       - ERR: config for ${nodeName} FAILED`)
                    console.error(`Error applying config`, e)
                }
            }
        }
        const promises = Object.keys(nodes).map(name => promiseGen(name))

        await Promise.all(promises)

        return nodes
    })
}