const assert = require('assert');
const { Database, BackupNode } = require('../');


describe.only('Concurrent writes', function () {
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

    it('should allow only one concurent write with the same ts', async function () {
        let successes = 0;
        let failures = 0;
        let expectedVal

        await db.set('test/concurrent', 'some value')
        const { ts: checkTs } = await db.get('test/concurrent', { ts: true })

        const promises = [];
        for (let i = 0; i < 10; i++) {
            promises.push(async function () {
                try {
                    await db.set('test/concurrent', 'concurrent' + i, checkTs)
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

        assert.strictEqual(await db.getValue('test/concurrent'), expectedVal)

        assert.equal(successes, 1, 'Only 1 success');
        assert.equal(failures, 9, 'Other 9 are failures');
    })

    it('should safely patch', async function () {
        await db.set('test/safepatch', 0)

        let promises = []
        for (let i = 0; i < 30; i++) {
            promises.push(async function () {
                await db.safeUpdate('test/safepatch', function (val) {
                    return val + 1
                })
            }());
        }

        await Promise.all(promises);

        assert.strictEqual(await db.getValue('test/safepatch'), 30)
    })

    it('should survive restart after safepatch', async function () {
        await db.set('test/safepatchrestart', 0)

        let promises = []
        for (let i = 0; i < 30; i++) {
            promises.push(async function () {
                await db.safeUpdate('test/safepatchrestart', function (val) {
                    return val + 1
                })
            }());
        }

        await Promise.all(promises);

        assert.strictEqual(await db.getValue('test/safepatchrestart'), 30)

        await db.kill()
        db = new Database({ port: 9999 })

        assert.strictEqual(await db.getValue('test/safepatchrestart'), 30)
    })
})