const db = require('../system/database')

module.exports = async function getDrbdDeviceName(volName) {
    const minor = await getDrbdDeviceMinor(volName)
    return `/dev/drbd${minor}`
}

async function getDrbdDeviceMinor(volName) {
    //return from cache
    const minorsData = await db.getValue(`drbdDeviceMinors`)
    if (minorsData && minorsData.minors && minorsData.minors[volName]) {
        return minorsData.minors[volName]
    }

    //set port then

    let appliedMinor

    await db.safeUpdate(`drbdDeviceMinors`, function (oldData) {
        const data = oldData || {
            minors: {},
            lastMinor: 0
        }

        //double check just in case if updated since last operation
        if (data.minors[volName]) {
            appliedMinor = data.minors[volName]
            return data
        }

        data.lastMinor++
        appliedMinor = data.lastMinor
        data.minors[volName] = appliedMinor

        return data
    })
    return appliedMinor
}