import config from "../../../config"
import os from "os"
import chai, { expect } from 'chai';

it('should return a node name', () => {
    expect(config.get("NODE_NAME")).to.equal(os.hostname())
})