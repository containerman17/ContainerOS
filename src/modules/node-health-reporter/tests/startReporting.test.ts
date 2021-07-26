// Import the dependencies for testing
import chai, { expect } from 'chai';
// import chaiHttp from 'chai-http';
// import api from '../api';
import config from "../../../config"
// import database from "../../../lib/database"
// // import { ImportMock } from 'ts-mock-imports';
import sinon from "sinon"
import startReporing from "../startReporting"
import database from "../../../lib/database"
import delay from "delay"
import { nextTick } from 'process';
// // Configure chai
// chai.use(chaiHttp);
// chai.should();

// const app = api.start(true)



it('should report something', async () => {
    const clock = sinon.useFakeTimers();
    const updateNodeHealthFake = sinon.replace(database.nodeHealth, "update", sinon.fake());

    startReporing()

    expect(updateNodeHealthFake.callCount).to.be.equal(1)

    await new Promise((resolve) => {
        nextTick(resolve)
    })

    clock.tick(config.get('NODE_HEALTH_INTERVAL') + 1);

    expect(updateNodeHealthFake.lastCall.args[1].cpuUtilization).to.be.greaterThan(0)
    expect(updateNodeHealthFake.callCount).to.be.equal(2)

    clock.restore();
})
