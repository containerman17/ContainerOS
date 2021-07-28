import { expect } from "chai"
import config from "../../../config"

it('test is test', () => {
    expect(config.get('IS_TEST')).to.be.equal(true)
})