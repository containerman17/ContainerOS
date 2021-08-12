import { MicroserviceUpdate } from "containeros-sdk";
import config from "../../config";
import delay from "delay"
const axios = require('axios');

const run = async function () {

    const myIp = (
        await axios.get('http://ifconfig.co', {
            headers: {
                'accept': 'application/json'
            }
        })
    ).data.ip

    const body: MicroserviceUpdate = {
        "name": "scaling-test",
        "scale": 1,
        "containers": {
            "main": {
                "image": "tutum/hello-world",
                "httpPorts": { "80": `scaling.${myIp}.nip.io` }
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
    }

    await delay(5000)

    body.scale = 2
    await axios.post(`http://127.0.0.1:${PORT}/v1/microservice?password=${PASS}`, body)
    console.log('scaled to 2')

    await delay(5000)

    body.scale = 0
    await axios.post(`http://127.0.0.1:${PORT}/v1/microservice?password=${PASS}`, body)
    console.log('scaled to 0')
}
run().catch(e => console.error(e))