const db = require('../system/database')

module.exports = async function getVolumePort(volName) {
    //return from cache
    const portsData = await db.getValue(`volumePorts`)
    if (portsData && portsData.ports && portsData.ports[volName]) {
        return portsData.ports[volName]
    }

    //set port then

    let appliedPort

    await db.safeUpdate(`volumePorts`, function (oldData) {
        const data = oldData || {
            ports: {},
            lastPort: 7790
        }

        //double check just in case if updated since last operation
        if (data.ports[volName]) {
            appliedPort = data.ports[volName]
            return data
        }

        data.lastPort++
        appliedPort = data.lastPort
        data.ports[volName] = appliedPort

        return data
    })
    return appliedPort
}