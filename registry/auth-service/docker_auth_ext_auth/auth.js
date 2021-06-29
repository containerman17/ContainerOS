#!/usr/bin/env node
const fs = require('fs')

const stdinBuffer = fs.readFileSync(0); // STDIN_FILENO = 0
const [login, token] = stdinBuffer.toString().split(' ')

const { URL } = require('url')
const AUTH_API_URL = process.env.AUTH_API_URL || "http://127.0.0.1:8000"
const { protocol, hostname, port } = new URL(AUTH_API_URL);

const http = require(protocol.slice(0, -1))
const DEBUG_ENABLED = process.env.AUTH_DEBUG_LOG_ENABLED || false


async function run() {
    if (DEBUG_ENABLED) fs.appendFileSync('/debug.txt', `${login}: Auth started. token ${token}\n`)
    try {
        await httpRequest({
            host: hostname,
            port: port,
            method: 'GET',
            path: `/v1/public/testRegistryPassword?name=${login}&token=${token}`
        })
        if (DEBUG_ENABLED) fs.appendFileSync('/debug.txt', `${login}: Auth succeed\n`)
        process.exit(0)
    } catch (e) {
        if (DEBUG_ENABLED) fs.appendFileSync('/debug.txt', `${login}: Auth failed. Err: ${String(e).slice(0, 200)}\n`)
        process.exit(1)
    }
}
run()

function httpRequest(params, postData) {
    return new Promise(function (resolve, reject) {
        var req = http.request(params, function (res) {
            // cumulate data
            let body = [];
            res.on('data', function (chunk) {
                body.push(chunk);
            });
            // resolve on end
            res.on('end', function () {
                // reject on bad status
                if (res.statusCode < 200 || res.statusCode >= 300) {
                    return reject(new Error('statusCode=' + res.statusCode + " " + body));
                }

                try {
                    body = JSON.parse(Buffer.concat(body).toString());
                } catch (e) {
                    reject(e);
                }
                resolve(body);
            });
        });
        // reject on request error
        req.on('error', function (err) {
            // This is not a "Second reject", just a different sort of failure
            reject(err);
        });
        if (postData) {
            req.write(postData);
        }
        // IMPORTANT
        req.end();
    });
}