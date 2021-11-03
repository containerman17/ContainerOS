//example https://github.com/LINBIT/linstor-docker-volume-go
// service docker restart &&  docker volume create test --driver=cossds &&  docker container run -it --volume test:/data busybox sh


const fs = require('fs');

//fakedb starts
const FAKE_DB_PATH = __dirname + '/data.json'
if (!fs.existsSync(FAKE_DB_PATH)) {
    fs.writeFileSync(FAKE_DB_PATH, '{}')
}
const fakeDb = {
    getAll: function () {
        return JSON.parse(fs.readFileSync(FAKE_DB_PATH))
    },
    get: key => {
        return JSON.parse(fs.readFileSync(FAKE_DB_PATH))[key]
    },
    set: (key, value) => {
        let db = JSON.parse(fs.readFileSync(FAKE_DB_PATH))
        db[key] = value
        fs.writeFileSync(FAKE_DB_PATH, JSON.stringify(db))
    }
}
//fakedb ends

const handlers = {}
handlers['/Plugin.Activate'] = function (body) {
    return {
        Implements: [
            'VolumeDriver'
        ],
    }
}

handlers['/VolumeDriver.Capabilities'] = function (body) {
    return {
        Capabilities: {
            Scope: 'global'
        }
    }
}

handlers['/VolumeDriver.Get'] = function ({ Name }) {
    const vol = fakeDb.get(Name)
    if (vol) {
        return {
            Volume: vol
        }
    } else {
        return {
            Err: 'no such volume'
        }
    }
}

handlers['/VolumeDriver.Create'] = function ({ Name, Opts }) {
    const vol = fakeDb.get(Name)
    if (vol) {
        return {
            Err: 'volume already exists'
        }
    } else {
        fakeDb.set(Name, {
            Name,
            Mountpoint: '/tmp/' + Name,
            Status: {},
        })
        return fakeDb.get(Name)
    }
}

handlers['/VolumeDriver.Remove'] = function ({ Name, Opts }) {
    const vol = fakeDb.get(Name)
    if (!vol) {
        return {
            Err: 'volume does not exists'
        }
    } else {
        fakeDb.set(Name, undefined)
        return {}
    }
}

handlers['/VolumeDriver.List'] = function (body) {
    return {
        Volumes: Object.values(fakeDb.getAll())
    }
}

handlers['/VolumeDriver.Mount'] = function ({ Name, ID }) {
    const vol = fakeDb.get(Name)
    if (!fs.existsSync(vol.Mountpoint)) {
        fs.mkdirSync(vol.Mountpoint)
    }
    if (vol) {
        return {
            Mountpoint: vol.Mountpoint
        }
    } else {
        return {
            Err: 'no such volume'
        }
    }
}

handlers['/VolumeDriver.Path'] = handlers['/VolumeDriver.Mount']

handlers['/VolumeDriver.Unmount'] = function ({ Name }) {
    const vol = fakeDb.get(Name)
    if (!vol) {
        return {
            Err: 'volume does not exists'
        }
    }
    return {}
}


const UNIX_SOCKET_ADDR = '/run/docker/plugins/cossds.sock'
if (fs.existsSync(UNIX_SOCKET_ADDR)) {
    fs.unlinkSync(UNIX_SOCKET_ADDR)
}

require('http').createServer(async function (req, res) {
    console.log('url', req.url)
    console.log('method', req.method)

    let responseBody = {}

    try {
        let body = ""

        await new Promise((resolve, reject) => {
            req.on('data', (data) => body += data)
            req.on('end', () => resolve())
            req.on('error', err => reject(err))
        })

        console.log('Request:', {
            url: req.url,
            method: req.method,
            body
        })

        responseBody = await handlers[req.url](JSON.parse(body || '{}'))
    } catch (e) {
        responseBody = { "err": e.message }
    } finally {
        console.log('Response:', responseBody)
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify(responseBody))
    }
}).listen(UNIX_SOCKET_ADDR);
