//example https://github.com/LINBIT/linstor-docker-volume-go
// service docker restart ;  docker volume create test --driver=cossds

const fs = require('fs');

const handlers = {}
handlers['/Plugin.Activate'] = function (body) {
    return {
        code: 200,
        body: {
            Implements: [
                'VolumeDriver'
            ],
        }
    }
}

const UNIX_SOCKET_ADDR = '/run/docker/plugins/cossds.sock'
if (fs.existsSync(UNIX_SOCKET_ADDR)) {
    fs.unlinkSync(UNIX_SOCKET_ADDR)
}

require('http').createServer(async function (req, res) {
    console.log('url', req.url)
    console.log('method', req.method)

    let responseBody = {}
    let responseCode = 200

    try {
        let body = ""

        await new Promise((resolve, reject) => {
            req.on('data', (data) => body += data)
            req.on('end', () => resolve())
            req.on('error', err => reject(err))
        })

        const result = await handlers[req.url](JSON.parse(body || '{}'))
        responseBody = result.body
        responseCode = result.code
    } catch (e) {
        console.error(e)
        responseBody = { "err": e.message }
        responseCode = 500
    } finally {
        res.writeHead(responseCode, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify(responseBody))
    }
}).listen(UNIX_SOCKET_ADDR);

