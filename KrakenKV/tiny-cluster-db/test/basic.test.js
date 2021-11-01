const assert = require('assert');
// const axios = require('axios')
// const execa = require('execa')
const delay = require('../delay')
const { Database, BackupNode } = require('../');

describe.only('Database basic functions', function () {
    let db = null
    let backupNodes = []
    this.beforeAll(async () => {
        //create a database and 3 backup nodes
        db = new Database({ port: 9999 })
        backupNodes.push(new BackupNode({ dbHost: 'localhost', dbPort: 9999, logFunction: null }))
    })

    it.only('should update value', async function () {
        const myVal = 'woop' + String(new Date)
        await db.set('myKey', myVal)

        const { ts, value } = await db.get('myKey')
        assert.strictEqual(value, myVal)
    });

    it.only('should deliver data to store', async function () {
        const myVal = 'testdeliver' + String(new Date)
        await db.set('test/deliver', myVal)
        await delay(200)

        const backupStoreState = backupNodes[0].getStoreSnapshot()
        assert.strictEqual(backupStoreState['test/deliver'].value, myVal)
    })
    it.only('should survive gate and store restart', async function () {
        const oldServerId = db.getServerId()
        const myVal = 'testsurvive' + String(new Date)
        await db.set('test/survive', 'oldval')
        await db.set('test/survive', myVal)

        //restart gate
        await db.kill()//TODO: do a kill logic
        db = new Database({ port: 9999 })
        const newServerId = db.getServerId()
        assert.notStrictEqual(oldServerId, newServerId)
        let { value } = await db.get('test/survive')
        assert.strictEqual(value, myVal)

        //restart store
        backupNodes
            .map(node => node.kill())

        backupNodes = []
        backupNodes.push(new BackupNode({ dbHost: 'localhost', dbPort: 9999, logFunction: null }))
        await backupNodes[0].waitForStart()

        //restart gate
        await db.kill()//TODO: do a kill logic
        db = new Database({ port: 9999 })
        assert.notStrictEqual(oldServerId, db.getServerId())
        assert.notStrictEqual(newServerId, db.getServerId())
        let { value: val2 } = await db.get('test/survive')
        assert.strictEqual(val2, myVal)
    })
})