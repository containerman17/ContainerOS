const network = require('network')

interface NetworkReturnInterface {
    name: string,
    ip_address: string,
    mac_address: string,
    type: string,
    netmask: string,
    gateway_ip: string
}

export default async function (): Promise<NetworkReturnInterface> {
    return new Promise((resolve, reject) => {
        network.get_active_interface(function (err: Error, iface: NetworkReturnInterface) {
            if (err) return reject(err)
            return resolve(iface)
        })
    })
}