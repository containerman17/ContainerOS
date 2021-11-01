const assert = require('assert');
const { Database, BackupNode } = require('../');


describe.only('Recursive', function () {
    let db = null
    let backupNodes = []
    this.beforeAll(async () => {
        //create a database and 3 backup nodes
        db = new Database({ port: 9999 })
        backupNodes.push(new BackupNode({ dbHost: 'localhost', dbPort: 9999, logFunction: null }))
    })
    this.afterAll(async () => {
        await db.kill()
        backupNodes
            .map(node => node.kill())
    })

    it('should work for plain recursive requests', async function () {
        const myVal1 = 'testrec1' + String(new Date)
        const myVal2 = 'testrec2' + String(new Date)

        await db.set('test/rec/1', myVal1)
        await db.set('test/rec/2', myVal2)

        const res = await db.getRecurse('test/rec')

        //so hard to test ts values
        delete res['test/rec/2'].ts
        delete res['test/rec/1'].ts

        assert.deepEqual(res, {
            'test/rec/1': { value: myVal1 },
            'test/rec/2': { value: myVal2 },
        })
    })
})