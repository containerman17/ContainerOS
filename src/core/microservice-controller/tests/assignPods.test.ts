import setUpNode from "../../set-up-node/setUpNode"
import { database } from "containeros-sdk"
import microserviceController from '../microserviceController'
import sinon from "sinon"
import { keyable, StoredMicroservice } from "containeros-sdk"
import { expect } from "chai"

describe('pod assignment on real database', () => {
    before(async () => {
        await setUpNode()
        sinon.replace(database.nodeHealth, "getLeastBusyServerName", sinon.fake.returns(Promise.resolve('fake-server')))
    })

    beforeEach(async () => {
        await database.microservice.dropAll()
        await database.pod.dropAll()
        microserviceController.stop()
        await microserviceController.start()
    })

    afterEach(async () => {
        await database.microservice.dropAll()
        await database.pod.dropAll()
        microserviceController.stop();
    })

    after(async () => {
        sinon.restore();
    })

    it('assigns 3 pods', async () => {
        expect(database.microservice.getAll()).to.not.have.key('test-ms')

        await database.microservice.update('test-ms', {
            currentConfig: {
                name: 'test-ms',
                scale: 3,
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

        await new Promise((resolve, reject) => {
            const msListener = function (mservices: keyable<StoredMicroservice>) {
                try {
                    if (mservices['test-ms'].currentPodNames.length === 3) {
                        database.microservice.removeListChangedCallback(msListener)
                        expect(mservices['test-ms'].currentPodNames[0]).to.contain('fake-server')
                        resolve(undefined)
                    }
                } catch (e) {
                    reject(e)
                }
            }
            database.microservice.addListChangedCallback(msListener)
        })
    })
})
