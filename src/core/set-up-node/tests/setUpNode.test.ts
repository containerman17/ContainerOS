import setUpNode from "../setUpNode"

import sinon from "sinon"
import axios from "axios"
import { expect } from "chai"
import config from "../../../config"
import http from "http"

describe("Set up node", function () {
    this.timeout(30000)

    before(async () => {
        await setUpNode()
    })

    it("should start consul", async () => {
        const { status } = await axios.get('http://127.0.0.1:8500/v1/catalog/nodes')
        expect(status).to.be.equal(200)
    })

    it("should start router", (done) => {
        http.request({
            host: '127.0.0.1',
            path: '/'
        }, function (response) {
            if (response.statusCode == 308) {
                done()
            } else {
                done(new Error(`response code is ${response.statusCode}`))
            }
        }).end();
    })

    it('guarantees that test is test', () => {
        expect(config.get('IS_TEST')).to.be.equal(true)
    })
})