const assert = require('assert');
const { Database, BackupNode } = require('../');
const delay = require('waitms')

describe('Watch changes', function () {
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

    this.beforeEach(async () => {
        await db.set('test/watch/1', null);
        await db.set('test/watch/2', null);
    })

    it('should report writes', async function () {
        const watch = db.watch('test/watch');
        let dataCopy = undefined
        let gotUpdate = false

        watch.on('data', data => {
            dataCopy = data;
            gotUpdate = true;
        })

        watch.on('error', e => {
            console.error(e)
            process.exit(1);
        })

        //wait for watch to be ready
        while (!gotUpdate) {
            await delay(20);
        }
        gotUpdate = false;
        assert.equal(dataCopy['test/watch/1'].value, null)
        assert.equal(dataCopy['test/watch/2'].value, null)

        //set first key
        await db.set('test/watch/1', 'one');
        while (!gotUpdate) {
            await delay(20);
        }
        gotUpdate = false

        assert.equal(dataCopy['test/watch/1'].value, 'one')
        assert.equal(dataCopy['test/watch/2'].value, null)
        //set second key

        await db.set('test/watch/2', 'two');
        while (!gotUpdate) {
            await delay(20);
        }
        gotUpdate = false

        assert.equal(dataCopy['test/watch/1'].value, 'one')
        assert.equal(dataCopy['test/watch/2'].value, 'two')
        assert.equal(Object.keys(dataCopy).length, 2)

        //update first key
        await db.set('test/watch/1', 'uno');
        while (!gotUpdate) {
            await delay(20);
        }
        gotUpdate = false

        assert.equal(dataCopy['test/watch/1'].value, 'uno')
        assert.equal(dataCopy['test/watch/2'].value, 'two')
        assert.equal(Object.keys(dataCopy).length, 2)

        //check not listening other values
        await db.set('test/DONOTLISTEN/1', 'odin');
        await delay(200)
        assert.strictEqual(gotUpdate, false)

        await db.set('test/watch/1', 'odin');
        await delay(200)
        assert.strictEqual(gotUpdate, true)
        gotUpdate = false

        //finalize
        await watch.stop();

        //check not listening after stop
        await db.set('test/watch/1', 'woopwoop');
        await delay(200)
        assert.strictEqual(gotUpdate, false)
    })
})