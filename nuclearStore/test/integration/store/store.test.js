const assert = require('assert');
const axios = require('axios')

describe('Store integration', function () {
    beforeEach(async () => {
        await axios.get('http://localhost:3001/test/reset')
    });

    it('should return empty object if no data is present', async function () {
        const { data } = await axios.get('http://localhost:3001/sync/bulk')
        assert.deepEqual(data, {})
    });

    it('should update data', async function () {
        let response

        console.log(axios.post)

        await axios.post('http://localhost:3001/sync/bulk', {
            "test123": {
                value: '123',
                ts: 321
            }
        })

        response = await axios.get('http://localhost:3001/sync/bulk')

        assert.deepEqual(response.data, {
            "test123": {
                value: '123',
                ts: 321
            }
        })

        await axios.post('http://localhost:3001/sync/bulk', {
            "test456": {
                value: '456',
                ts: 654
            }
        })

        response = await axios.get('http://localhost:3001/sync/bulk')

        assert.deepEqual(response.data, {
            "test123": {
                value: '123',
                ts: 321
            },
            "test456": {
                value: '456',
                ts: 654
            }
        })

    })

})