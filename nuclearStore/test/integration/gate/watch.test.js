const assert = require('assert');
const axios = require('axios');
const sdk = require('../../../sdk/sdk');
const delay = require('delay');

describe('Watch chnages', () => {
    beforeEach(async () => {
        await sdk.set('test/watch/1', null);
        await sdk.set('test/watch/2', null);
    })

    it('should report writes', async function () {
        const watch = await sdk.watch('test/watch',);
        let dataCopy = undefined
        let gotUpdate = false

        watch.on('data', data => {
            dataCopy = data;
            gotUpdate = true;
        })

        watch.on('error', e => {
            console.error(e)
            process.exit(1);
        })

        //wait for watch to be ready
        while (!gotUpdate) {
            await delay(20);
        }
        gotUpdate = false;
        assert.deepEqual(dataCopy, {})

        //set first key
        await sdk.set('test/watch/1', 'one');
        while (!gotUpdate) {
            await delay(20);
        }
        gotUpdate = false

        assert.equal(dataCopy['test/watch/1'].value, 'one')
        assert.equal(Object.keys(dataCopy).length, 1)

        //set second key

        await sdk.set('test/watch/2', 'two');
        while (!gotUpdate) {
            await delay(20);
        }
        gotUpdate = false

        assert.equal(dataCopy['test/watch/1'].value, 'one')
        assert.equal(dataCopy['test/watch/2'].value, 'two')
        assert.equal(Object.keys(dataCopy).length, 2)

        //update first key
        await sdk.set('test/watch/1', 'uno');
        while (!gotUpdate) {
            await delay(20);
        }
        gotUpdate = false

        assert.equal(dataCopy['test/watch/1'].value, 'uno')
        assert.equal(dataCopy['test/watch/2'].value, 'two')
        assert.equal(Object.keys(dataCopy).length, 2)


        //delete first key

        await sdk.set('test/watch/1', null);
        while (!gotUpdate) {
            await delay(20);
        }
        gotUpdate = false

        assert.equal(dataCopy['test/watch/2'].value, 'two')
        assert.equal(Object.keys(dataCopy).length, 1)

        //finalize
        await watch.stop();
    })
})