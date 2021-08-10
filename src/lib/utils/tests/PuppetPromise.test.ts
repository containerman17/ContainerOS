import PuppetPromise from "../createPuppetPromise";
import { expect } from "chai"

describe('Puppet promise', () => {
    it('have to be manually resolved', async () => {
        const p = new PuppetPromise<string>();

        let testValue = 'not resolved'

        p.promise.then(value => testValue = value)
            .catch(e => testValue = 'OOOPS promise got rejected instead')

        expect(testValue).to.be.equal('not resolved');
        await Promise.resolve()//process.nextTick in await style
        expect(testValue).to.be.equal('not resolved');


        p.resolve('resolved!');
        for (let i = 0; i < 10; i++) {
            await Promise.resolve()//process.nextTick in await style
        }
        expect(testValue).to.be.equal('resolved!')
    })

    it('have to be manually rejected', async () => {
        const p = new PuppetPromise<string>();

        let testValue = 'not rejected'

        p.promise
            .then(() => testValue = 'oops! got resolved instead')
            .catch(e => testValue = e)

        expect(testValue).to.be.equal('not rejected');
        await Promise.resolve()//process.nextTick in await style
        expect(testValue).to.be.equal('not rejected');


        p.reject('rejected!');
        for (let i = 0; i < 10; i++) {
            await Promise.resolve()//process.nextTick in await style
        }
        expect(testValue).to.be.equal('rejected!')
    })

    it('works returns correct isFulfilled value', async () => {
        const p1 = new PuppetPromise<string>();
        const p2 = new PuppetPromise<string>();


        expect(p1.isFulfilled()).to.be.equal(false);
        expect(p2.isFulfilled()).to.be.equal(false);

        for (let i = 0; i < 10; i++) {
            await Promise.resolve()//process.nextTick in await style
        }

        expect(p1.isFulfilled()).to.be.equal(false);
        expect(p2.isFulfilled()).to.be.equal(false);

        p1.resolve('resolved!');
        p2.reject('rejected!');

        for (let i = 0; i < 10; i++) {
            await Promise.resolve()//process.nextTick in await style
        }

        expect(p1.isFulfilled()).to.be.equal(true);
        expect(p2.isFulfilled()).to.be.equal(true);
    })
})