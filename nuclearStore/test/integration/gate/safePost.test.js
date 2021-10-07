const assert = require('assert');
const axios = require('axios')


describe('Concurrent writes', () => {
    it('should allow only one concurent write with the same ts', async function () {
        let successes = 0;
        let failures = 0;
        let expectedVal

        await axios.post('http://localhost:3000/kv/', {
            key: 'test/concurrent',
            value: 'some value',
        })
        res = await axios.get('http://localhost:3000/kv/test/concurrent');
        const checkTs = res.data.ts;


        const promises = [];
        for (let i = 0; i < 10; i++) {
            promises.push(async function () {
                try {
                    await axios.post('http://localhost:3000/kv/', {
                        key: 'test/concurrent',
                        value: 'concurrent' + i,
                        checkTs: checkTs,
                    })
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

        res = await axios.get('http://localhost:3000/kv/test/concurrent');
        assert.strictEqual(res.data.value, expectedVal)
    })
})