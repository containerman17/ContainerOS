const getSSHClient = require('./getSSHClient')
const fs = require('fs')
const tmp = require('tmp');

module.exports = async function (server, remotePath, content) {
    const tmpobj = tmp.fileSync()
    const localPath = tmpobj.name

    try {
        fs.writeFileSync(localPath, content)

        const ssh = await getSSHClient(server)
        await ssh.putFile(localPath, remotePath)
    } finally {
        tmpobj.removeCallback();
    }
}

