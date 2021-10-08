const assert = require('assert');
const axios = require('axios')
const sdk = require('../../../sdk')


describe('Recursive', () => {
    it('should work for plain recursive requests', async function () {
        const myVal1 = 'testrec1' + String(new Date)
        const myVal2 = 'testrec2' + String(new Date)

        await sdk.set('test/rec/1', myVal1)
        await sdk.set('test/rec/2', myVal2)

        const res = await sdk.get('test/rec', { recurse: true })

        //so hard to test ts values
        delete res['test/rec/2'].ts
        delete res['test/rec/1'].ts

        assert.deepEqual(res, {
            'test/rec/1': { value: myVal1 },
            'test/rec/2': { value: myVal2 },
        })
    })
})