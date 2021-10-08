const assert = require('assert');
const sdk = require('../../../sdk')


describe.only('Concurrent writes', () => {
    it('should allow only one concurent write with the same ts', async function () {
        let successes = 0;
        let failures = 0;
        let expectedVal

        await sdk.set('test/concurrent', 'some value')
        const { ts: checkTs } = await sdk.get('test/concurrent', { ts: true })

        const promises = [];
        for (let i = 0; i < 10; i++) {
            promises.push(async function () {
                try {
                    await sdk.set('test/concurrent', 'concurrent' + i, checkTs)
                    expectedVal = 'concurrent' + i
                    successes++;
                } catch (e) {
                    failures++;
                    if (failures === 10) {
                        console.error(e)
                    }
                }
            }());
        }

        await Promise.all(promises);

        assert.equal(failures, 9, 'failures');
        assert.equal(successes, 1);

        assert.strictEqual(await sdk.get('test/concurrent'), expectedVal)
    })
})