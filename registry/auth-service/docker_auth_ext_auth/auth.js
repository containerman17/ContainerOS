#!/usr/bin/env node

const http = require("http")

const [login, token] = process.argv.slice(2);


async function run() {
    try {
        await httpRequest({
            host: '127.0.0.1',
            port: 8000,
            method: 'GET',
            path: `/v1/public/testRegistryPassword?name=${login}&token=${token}`
        })
        process.exit(0)
    } catch (e) {
        console.error(String(e).slice(0, 20))
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