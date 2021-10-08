const assert = require('assert');
const axios = require('axios')
const execa = require('execa')
const delay = require('delay')

describe('Store integration', function () {
    it('should update value', async function () {
        const myVal = 'woop' + String(new Date)
        await axios.post('http://localhost:3000/kv/', {
            key: 'woohoo',
            value: myVal
        })

        const res = await axios.get('http://localhost:3000/kv/woohoo')
        assert.strictEqual(res.data.value, myVal)
    });

    it('should deliver data to store', async function () {
        const myVal = 'testdeliver' + String(new Date)
        await axios.post('http://localhost:3000/kv/', {
            key: 'test/deliver',
            value: myVal
        })

        const res = await axios.get('http://localhost:3001/sync/bulk')
        assert.strictEqual(res.data['test/deliver'].value, myVal)
    })
    it('should survive gate and store restart', async function () {
        let res
        const myVal = 'testdeliver' + String(new Date)
        await axios.post('http://localhost:3000/kv/', {
            key: 'test/deliver',
            value: myVal
        })

        for (let i = 0; i < 100; i++) {
            try {
                res = await axios.get('http://localhost:3000/kv/test/deliver');
                break;
            } catch (e) {
                await delay(100)
            }
        }
        assert.strictEqual(res.data.value, myVal)

        //restart gate

        await execa('docker', ['restart', 'nuclearstore-gate-1'])
        res = null

        for (let i = 0; i < 100; i++) {
            try {
                res = await axios.get('http://localhost:3000/kv/test/deliver');
                break;
            } catch (e) {
                await delay(100)
            }
        }
        assert.strictEqual(res.data.value, myVal)



        //restart store

        await execa('docker', ['restart', 'nuclearstore-store-1'])
        res = null

        //make sure hosts are re-checked very often after store restart
        //this is a bit hacky, but it works
        await axios.get('http://localhost:3000/test/burstHostChecks');

        for (let i = 0; i < 100; i++) {
            try {
                await axios.get('http://localhost:3001/sync/bulk') // wait for store to be ready
                res = await axios.get('http://localhost:3000/kv/test/deliver');
                break;
            } catch (e) { await delay(100) }
        }



        assert.strictEqual(res.data.value, myVal)



        //restart gate again

        await execa('docker', ['restart', 'nuclearstore-gate-1'])
        res = null

        for (let i = 0; i < 100; i++) {
            try {
                res = await axios.get('http://localhost:3000/kv/test/deliver');
                break;
            } catch (e) {
                await delay(100)
            }
        }



        assert.strictEqual(res.data.value, myVal)
    })

    it('should get newer data from store', async function () {
        const now = Number(new Date)
        const futureTs = now + 1000 * 60 * 60 * 24 * 7
        const pastTs = now - 1000 * 60 * 60 * 24 * 7

        const myVal1 = 'testnewer1' + String(new Date)
        const myVal2 = 'testnewer2' + String(new Date)


        //set to database


        await axios.post('http://localhost:3000/kv/', {
            key: 'test/val1',
            value: myVal1
        })
        await axios.post('http://localhost:3000/kv/', {
            key: 'test/val2',
            value: myVal2
        })



        //check it went through
        res = await axios.get('http://localhost:3000/kv/test/val1');
        assert.strictEqual(res.data.value, myVal1)
        res = await axios.get('http://localhost:3000/kv/test/val2');
        assert.strictEqual(res.data.value, myVal2)



        //force push to store
        const newVal2 = 'newval2' + String(new Date)
        await axios.post('http://localhost:3001/sync/bulk', {
            "test/val1": {
                value: 'never should be here',
                ts: pastTs
            },
            "test/val2": {
                value: newVal2,
                ts: futureTs
            }
        })



        //force resync
        await axios.get('http://localhost:3000/test/forceResync');



        //check only val2 updated
        res = await axios.get('http://localhost:3000/kv/test/val1');
        assert.strictEqual(res.data.value, myVal1)
        res = await axios.get('http://localhost:3000/kv/test/val2');
        assert.strictEqual(res.data.value, newVal2)
    })
})