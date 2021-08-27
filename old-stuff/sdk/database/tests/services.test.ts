import services from "../services"
import sinon from "sinon"
import config from "../../config"
import chai from "chai"
import { NodeHealth, keyable } from "../../types";
const { expect } = chai;


describe('Services', () => {

    afterEach(() => {

    });
    before(() => {

    });
    after(() => {
    });

    it('shall not return dead servers', async () => {
        const adresses = await services.getServiceEndpoints('consul')
        expect(adresses).to.have.length(1)
        expect(adresses[0]).to.include(':')
    })

})
