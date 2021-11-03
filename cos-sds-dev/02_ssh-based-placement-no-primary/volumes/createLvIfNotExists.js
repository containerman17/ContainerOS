const executeOnServer = require('../system/executeOnServer')

module.exports = async function createLvIfNotExists(volName, serverIp) {
    let execResult = await executeOnServer(serverIp, `lvs --reportformat=json`)
    const lvs = JSON.parse(execResult.stdout).report[0].lv
    for (let lv of lvs) {
        if (lv.lv_name === volName && lv.vg_name === 'vg') {
            console.log(`       - lv vg/${volName} already exists`)
            return
        }
    }
    console.log(`       - creating lv vg/${volName}`)
    const creationResult = await executeOnServer(serverIp, `lvcreate -V1G -T vg/lvmthinpool -n ${volName}`)
    if (creationResult.code !== 0) {
        console.log(`       - failed to create lv vg/${volName}`)
        throw new Error(`failed to create lv vg/${volName}: ${creationResult.stderr}`)
    }
}