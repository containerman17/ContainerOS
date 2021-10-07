const assert = require('assert');
const axios = require('axios')


describe.only('Recursive', () => {
    it('should work for plain recursive requests', async function () {
        const myVal1 = 'testrec1' + String(new Date)
        const myVal2 = 'testrec2' + String(new Date)

        await axios.post('http://localhost:3000/kv/', {
            key: 'test/rec/1',
            value: myVal1,
        })
        await axios.post('http://localhost:3000/kv/', {
            key: 'test/rec/2',
            value: myVal2,
        })

        const res = await axios.get('http://localhost:3000/kv/test/rec?recurse=true')

        //so hard to test ts values
        delete res.data['test/rec/2'].ts
        delete res.data['test/rec/1'].ts

        assert.deepEqual(res.data, {
            'test/rec/1': { value: myVal1 },
            'test/rec/2': { value: myVal2 },
        })
    })
})