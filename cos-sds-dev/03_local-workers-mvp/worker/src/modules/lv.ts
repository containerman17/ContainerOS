import execa from 'execa'

async function createVolume(volName, vg, thinpool) {

}

async function deleteVolume(volName, vg) {

}

async function listVolumes(vg) {
    const execResult = await execa(`lvs --reportformat=json`)
    const lvs = JSON.parse(execResult.stdout).report[0].lv
    return lvs
        .filter(lv => lv.vg_name === vg)
        .map(lv => lv.lv_name)
}

async function volumeExists(volName, vg) {
    const existingVols = await listVolumes(vg)
    return existingVols.filter(name => name === volName).length > 0
}

module.exports = {
    async createVolumeIfNotExists(volName, vg, thinpool) {
        const exists = await volumeExists(volName, vg)
        if (!exists) {
            await createVolume(volName, vg, thinpool)
        }
    },
    async cleanUpVolumes(desiredVolumes, vg) {
        const presentVolumes = await listVolumes(vg)
        for (let volName of presentVolumes) {
            if (!desiredVolumes.incudes(volName)) {
                await deleteVolume(volName, vg)
            }
        }
    }
}