import { MicroserviceUpdate } from "containeros-sdk";
import config from "../../config";
import delay from "delay"
const axios = require('axios');

const run = async function () {

    const body: MicroserviceUpdate = {
        "name": "scaling-test",
        "scale": 1,
        "containers": {
            "main": {
                "image": "quay.io/bitnami/nginx:latest",
                "httpPorts": { "5000": "reg.rd.dev.containeros.org" }
            },
        }
    }

    const PORT = config.get("CLUSTER_API_PORT");
    const PASS = config.get("API_PASSWORD");

    try {
        await axios.post(`http://127.0.0.1:${PORT}/v1/microservice?password=${PASS}`, body)
        console.log('created')
    } catch (e) {
        if (e?.code === 'ECONNREFUSED') {
            console.log('Error: connection refused on port ' + PORT + '. Is server running?');
        } else if (e?.response?.data) {
            console.log('Error:', e?.response?.data)
        } else {
            console.log('error', e);
        }
        return
    }

    await delay(5000)

    for (let i = 2; i <= 5; i++) {
        body.scale = i
        await axios.post(`http://127.0.0.1:${PORT}/v1/microservice?password=${PASS}`, body)
        console.log('scaled to ' + i)
        await delay(100)
    }

    await delay(5000)

    for (let i = 5; i >= 0; i--) {
        body.scale = i
        await axios.post(`http://127.0.0.1:${PORT}/v1/microservice?password=${PASS}`, body)
        console.log('scaled to ' + i)
    }

    await delay(1000)
    body.scale = 0
    await axios.post(`http://127.0.0.1:${PORT}/v1/microservice?password=${PASS}`, body)
}
run().catch(e => console.error(e))