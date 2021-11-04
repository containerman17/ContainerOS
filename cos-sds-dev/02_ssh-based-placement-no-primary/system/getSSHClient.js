const path = require('path')
const os = require('os')
const { NodeSSH } = require('node-ssh')

const clientsCache = {}
module.exports = async function getSSHClient(server) {
    if (!clientsCache[server]) {
        clientsCache[server] = new NodeSSH()

        console.log(`       - Connecting to `, server)

        await clientsCache[server].connect({
            host: server,
            username: 'root',
            privateKey: path.join(os.homedir(), '.ssh', 'id_rsa')
        })
    }
    return clientsCache[server]
}