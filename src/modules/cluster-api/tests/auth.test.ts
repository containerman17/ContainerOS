// Import the dependencies for testing
import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import api from '../api';
// Configure chai
chai.use(chaiHttp);
chai.should();

const app = api.start(true)
describe('Cluster API auth', () => {
    it('should reject wrong password', async () => {
        const response = await chai.request(app).get("/v1/microservice/update")
        expect(response).to.have.status(403)
    })
})

