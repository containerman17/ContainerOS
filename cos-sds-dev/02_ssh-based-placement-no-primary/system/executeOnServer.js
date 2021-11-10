const getSSHClient = require('./getSSHClient')

module.exports = async function (server, command) {
    const ssh = await getSSHClient(server)
    const result = await ssh.execCommand(command)
    console.log('\x1b[36m%s\x1b[0m', server, command);
    console.log('\x1b[31m%s\x1b[0m', result.stderr);
    console.log('\x1b[32m%s\x1b[0m', result.stdout);
    return result
}

