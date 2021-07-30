import setUpNode from "../../../core/set-up-node/setUpNode"
import database from "../../../lib/database"
import microserviceController from '../microserviceController'
import sinon from "sinon"
import { keyable, StoredMicroservice } from "../../../types"
import { expect } from "chai"

describe('pod assignment on real database', () => {
    before(async () => {
        await setUpNode()
        sinon.replace(database.nodeHealth, "getLeastBusyServerName", sinon.fake.returns('fake-server'))
    })

    beforeEach(async () => {
        await microserviceController.start()
        await database.microservice.dropAll()
        await database.pod.dropAll()
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
                if (mservices['test-ms'].currentPodNames.length === 3) {
                    database.microservice.removeListChangedCallback(msListener)
                    resolve(undefined)
                }
            }
            database.microservice.addListChangedCallback(msListener)
        })
    })
})
