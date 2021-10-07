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

        console.log(`store after restart 1`, (await axios.get('http://localhost:3001/sync/bulk')).data)

        //restart store

        await execa('docker', ['restart', 'nuclearstore-store-1'])
        res = null

        //make sure hosts are re-checked very often after store restart
        //this is a bit hacky, but it works
        for (let i = 0; i < 100; i++) {
            try {
                await axios.get('http://localhost:3000/test/burstHostChecks');
                break;
            } catch (e) { await delay(100) }
        }

        for (let i = 0; i < 100; i++) {
            try {
                await axios.get('http://localhost:3001/sync/bulk') // wait for store to be ready
                res = await axios.get('http://localhost:3000/kv/test/deliver');
                break;
            } catch (e) { await delay(100) }
        }

        console.log(`store after restart 2`, (await axios.get('http://localhost:3001/sync/bulk')).data)

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

        console.log(`store after restart 3`, (await axios.get('http://localhost:3001/sync/bulk')).data)

        assert.strictEqual(res.data.value, myVal)



    })

    it('should get newer data from store')
})