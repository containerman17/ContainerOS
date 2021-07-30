import startConsul from "../startConsul"
import sinon from "sinon"
import axios from "axios"
import { expect } from "chai"
import config from "../../../config"


describe("Set up node", () => {

    it("should start consul", async () => {
        await startConsul()
        const { status } = await axios.get('http://127.0.0.1:8500/v1/catalog/nodes')
        expect(status).to.be.equal(200)
    })

    it('guarantees that test is test', () => {
        expect(config.get('IS_TEST')).to.be.equal(true)
    })
})