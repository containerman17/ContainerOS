const fs = require('fs')
const testValue = fs.readFileSync('/testValue.txt').toString()
const requestListener = function (req, res) {
    res.writeHead(200);
    res.end(JSON.stringify({ success: 'ok', testValue }));
}

const server = require('http').createServer(requestListener);
server.listen(80);