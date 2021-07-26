import nodeHealth from "../nodeHealth"
import sinon from "sinon"
import config from "../../../config"
import chai from "chai"
import chaiAsPromised from "chai-as-promised"
import { NodeHealth, keyable } from "../../../types";
const { expect } = chai;
chai.use(chaiAsPromised);


describe('NodeHealth test', () => {
    let originalNodeHealth;

    afterEach(() => {
        sinon.restore();
    });
    before(() => {
        originalNodeHealth = config.get("NODE_HEALTH_INTERVAL");
        config.set('NODE_HEALTH_INTERVAL', 50)

        sinon.replace(nodeHealth, "ready", sinon.fake.returns(true))
        // clock = sinon.useFakeTimers();
    });
    after(() => {
        config.set('NODE_HEALTH_INTERVAL', originalNodeHealth)
    });

    it('shall not return dead servers', async () => {
        // clock.tick(1000 * 60 * 30);//skip 30 minutes to restore all time-bound effects

        const ts = new Date().getTime();
        const fakeData: keyable<NodeHealth> = {
            "dead_one": {
                cpuUtilization: 0,
                cpuBooking: 0,
                RamUtilization: 0,
                RamBooking: 0,
                lastUpdatedTs: ts - config.get('NODE_HEALTH_INTERVAL') * 10,
            },
            "alive_one": {
                cpuUtilization: 99,
                cpuBooking: 99,
                RamUtilization: 99,
                RamBooking: 99,
                lastUpdatedTs: ts - config.get('NODE_HEALTH_INTERVAL') / 10,
            },
        }
        const fake = sinon.replace(nodeHealth, "getAll", sinon.fake.returns(fakeData));

        const theBest = await nodeHealth.getLeastBusyServerName()
        expect(theBest).to.equal("alive_one")
    })

    it('has to fail on all servers being dead', async () => {
        // clock.tick(1000 * 60 * 30);//skip 30 minutes to restore all time-bound effects

        const ts = new Date().getTime();
        const fakeData: keyable<NodeHealth> = {
            "dead_one": {
                cpuUtilization: 0,
                cpuBooking: 0,
                RamUtilization: 0,
                RamBooking: 0,
                lastUpdatedTs: ts - config.get('NODE_HEALTH_INTERVAL') * 10,
            },
        }
        sinon.replace(nodeHealth, "getAll", sinon.fake.returns(fakeData));

        try {
            await nodeHealth.getLeastBusyServerName()
            expect(false).to.be.equal(true)
        } catch (e) {
            //all good as expected
        }
    })

    it('has to return a server with minimum load', async () => {
        // clock.tick(1000 * 60 * 30);//skip 30 minutes to restore all time-bound effects

        const ts = new Date().getTime();
        const fakeData: keyable<NodeHealth> = {
            "bad_one": {
                cpuUtilization: 96,
                cpuBooking: 0,
                RamUtilization: 0,
                RamBooking: 0,
                lastUpdatedTs: ts - config.get('NODE_HEALTH_INTERVAL') / 10,
            },
            "good_one": {
                cpuUtilization: 95,
                cpuBooking: 95,
                RamUtilization: 95,
                RamBooking: 95,
                lastUpdatedTs: ts - config.get('NODE_HEALTH_INTERVAL') / 10,
            },
        }
        sinon.replace(nodeHealth, "getAll", sinon.fake.returns(fakeData));
        sinon.replace(nodeHealth, "ready", sinon.fake.returns(true))

        const theBest = await nodeHealth.getLeastBusyServerName()
        expect(theBest).to.equal("good_one")
    })
})
