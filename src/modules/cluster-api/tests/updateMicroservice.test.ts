// Import the dependencies for testing
import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import api from '../api';
import config from "../../../config"
import database from "../../../lib/database"
// import { ImportMock } from 'ts-mock-imports';
import sinon from "sinon"

// Configure chai
chai.use(chaiHttp);
chai.should();

const app = api.start(true)

it('should update microserice', async () => {
    let res, err
    const updateMicroserviceFake = sinon.replace(database.microservice, "update", sinon.fake());
    try {
        res = await chai.request(app)
            .post('/v1/microservice/update?password=' + config.get('API_PASSWORD'))
            .set('X-API-Key', 'foobar')
            .send({
                "name": "test",
                "scale": 2,
                "containers": {
                    "reg": { "image": "quay.io/bitnami/nginx:latest", "httpPorts": { "5000": "reg.rd.dev.containeros.org" } },
                    "nginx": { "image": "quay.io/bitnami/nginx", "cpus": 2, "httpPorts": { "80": "nginx2.rd.dev.containeros.org" } }
                }
            })
    } catch (e) {
        err = e
    }
    expect(updateMicroserviceFake.callCount).to.be.equal(1)
    expect(res).to.have.status(200)
    expect(err).to.be.undefined
})
