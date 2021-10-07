const assert = require('assert');
const axios = require('axios')

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
    it('should survive gate and store restart')
    it('should get newer data from store')
})