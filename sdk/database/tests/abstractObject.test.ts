import { expect } from "chai"
import { StoredMicroservice } from "../../types"
import database from "../index"

describe('AbstractObject', () => {
    beforeEach(async () => {
        await database.microservice.dropAll()
    })
    after(async () => {
        await database.microservice.dropAll()
    })

    it('have to delete all the objects with dropAll method', async () => {
        await database.microservice.update('test-ms', {
            currentConfig: {
                name: 'test-ms',
                scale: 1,
                containers: {
                    'test-cont': {
                        httpPorts: {},
                        memLimit: 1000000,
                        cpus: 100000,
                        env: [],
                        image: "hello-world",
                    }
                }
            },
            currentPodNames: []
        })
        let allItems
        allItems = database.microservice.getAll()
        expect(Object.keys(database.microservice.getAll())).to.have.length(1)


        await database.microservice.dropAll()
        allItems = database.microservice.getAll()
        expect(Object.keys(database.microservice.getAll())).to.have.length(0)
    })


    it('can call dropAll on empty collection', async () => {
        for (let i = 0; i < 3; i++) {
            await database.microservice.dropAll()
        }
    })

    it('can call update a few times in a row without data changes', async () => {
        for (let i = 0; i < 3; i++) {
            await database.microservice.update('test-ms', {
                currentConfig: {
                    name: 'test-ms',
                    scale: 1,
                    containers: {}
                },
                currentPodNames: []
            })
        }
    })

    it('can call safeUpdate a few times in a row without data changes', async () => {
        await database.microservice.update('test-ms', {
            currentConfig: {
                name: 'test-ms',
                scale: 1,
                containers: {}
            },
            currentPodNames: []
        })
        for (let i = 0; i < 3; i++) {
            await database.microservice.safePatch('test-ms', function (oldValue: StoredMicroservice): StoredMicroservice {
                return oldValue
            })
        }
    })

    it('should await till safePatch completed', async () => {
        await database.microservice.update('test-ms', {
            currentConfig: {
                name: 'test-ms',
                scale: 0,
                containers: {}
            },
            currentPodNames: []
        })

        for (let i = 0; i < 4; i++) {
            await database.microservice.safePatch('test-ms', function (oldValue: StoredMicroservice): StoredMicroservice {
                oldValue.currentConfig.scale = i
                return oldValue
            })
            const updated = database.microservice.get('test-ms')
            expect(updated.currentConfig.scale).to.equal(i)
        }
    })

    it('have to run safePatch in parallel', async () => {
        await database.microservice.update('safe-patch-concurrent', {
            currentConfig: {
                name: '',
                scale: 0,
                containers: {}
            },
            currentPodNames: []
        })

        await Promise.all(
            Array.from(Array(4)).map(() => database.microservice.safePatch('safe-patch-concurrent', function (oldValue: StoredMicroservice): StoredMicroservice {
                oldValue.currentConfig.scale++
                return oldValue
            }))
        )
        const updated = database.microservice.get('safe-patch-concurrent')
        expect(updated.currentConfig.scale).to.equal(4)
    })
})
