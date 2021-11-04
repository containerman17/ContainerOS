const getSSHClient = require('./getSSHClient')

module.exports = async function (server, command) {
    const ssh = await getSSHClient(server)
    return ssh.execCommand(command)
}

