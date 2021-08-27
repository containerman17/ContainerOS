import { MicroserviceUpdate } from "containeros-sdk";
import config from "../../config";
const axios = require('axios');

async function run() {

    const myIp = (
        await axios.get('http://ifconfig.co', {
            headers: {
                'accept': 'application/json'
            }
        })
    ).data.ip

    const body: MicroserviceUpdate = {
        "name": "test",
        "scale": 1,
        "containers": {
            "test1": {
                "image": "tutum/hello-world",
                "httpPorts": { "80": `test1.${myIp}.nip.io` }
            },
            "test2": {
                "image": "tutum/hello-world",
                "httpPorts": { "80": `test2.${myIp}.nip.io` }
            }
        }
    }

    const PORT = config.get("CLUSTER_API_PORT");
    const PASS = config.get("API_PASSWORD");

    axios.post(`http://127.0.0.1:${PORT}/v1/microservice?password=${PASS}`, body).
        then(response => console.log('success', response.body)).
        catch(e => {
            if (e?.code === 'ECONNREFUSED') {
                console.log('Error: connection refused on port ' + PORT + '. Is server running?');
            } else if (e?.response?.data) {
                console.log('Error:', e?.response?.data)
            } else {
                console.log('error', e);
            }
        });
}


run()