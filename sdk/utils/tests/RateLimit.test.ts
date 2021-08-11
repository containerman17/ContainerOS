import RateLimit from "../RateLimit";
import delay from "delay"
import { expect } from "chai"
import sinon from "sinon"

const aFewTicks = async function (ticks = 100) {
    for (let i = 0; i < ticks; i++) {
        await Promise.resolve()
    }
}


describe('Rate limit', () => {
    let clock
    beforeEach(() => {
        clock = sinon.useFakeTimers();
    })
    afterEach(() => {
        clock.restore();
    })

    it('should execute all the functions', async () => {
        const CONCURRENCY = 5
        const WINDOW = 100

        const rateLimit = new RateLimit(5, 100);
        let counter = 0

        for (let i = 0; i < CONCURRENCY * 4; i++) {
            rateLimit.waitForMyTurn().then(() => {
                counter++
            })
        }
        await aFewTicks()
        for (let i = 0; i < 10; i++) {
            await aFewTicks()
            clock.tick(WINDOW)
        }

        //check that all of them executed in the end

        await aFewTicks()
        expect(counter).to.equal(CONCURRENCY * 4)
    })

    it('lets stuff happen gradually', async () => {
        const CONCURRENCY = 5
        const WINDOW = 100

        const rateLimit = new RateLimit(5, 100);
        let counter = 0

        for (let i = 0; i < CONCURRENCY * 4; i++) {
            rateLimit.waitForMyTurn().then(() => {
                counter++
            })
        }
        await aFewTicks()

        //first batch instantly
        expect(counter).to.equal(CONCURRENCY)

        //second batch after window
        clock.tick(WINDOW + 1)
        await aFewTicks()
        expect(counter).to.equal(CONCURRENCY * 2)

        //third batch
        clock.tick(WINDOW + 50)
        await aFewTicks()
        expect(counter).to.equal(CONCURRENCY * 3)

        //the last one
        clock.tick(WINDOW + 1)
        await aFewTicks()
        expect(counter).to.equal(CONCURRENCY * 4)
    })
})