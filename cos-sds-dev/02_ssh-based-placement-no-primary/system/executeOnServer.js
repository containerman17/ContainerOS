const path = require('path')
const os = require('os')
const { NodeSSH } = require('node-ssh')


module.exports = async function (server, command) {
    const ssh = await getSSHClient(server)
    return ssh.execCommand(command)
}


const clientsCache = {}
async function getSSHClient(server) {
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