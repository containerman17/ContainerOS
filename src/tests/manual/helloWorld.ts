import { MicroserviceUpdate } from "../../types";
import config from "../../config";
const axios = require('axios');

const body: MicroserviceUpdate = {
    "name": "test",
    "scale": 1,
    "containers": {
        "reg": {
            "image": "quay.io/bitnami/nginx:latest",
            "httpPorts": { "5000": "reg.rd.dev.containeros.org" }
        },
        "nginx": {
            "image": "quay.io/bitnami/nginx",
            "cpus": 2, "httpPorts": { "80": "nginx2.rd.dev.containeros.org" }
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