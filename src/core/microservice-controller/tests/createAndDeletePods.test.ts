import setUpNode from "../../set-up-node/setUpNode"
import database from "../../../lib/database"
import microserviceController from '../microserviceController'
import sinon from "sinon"
import { StoredPod, keyable } from "../../../types"
import { expect } from "chai"

describe('creating pods on real database', () => {
    before(async () => {
        await setUpNode()
        sinon.replace(database.nodeHealth, "getLeastBusyServerName", sinon.fake.returns('fake-server-2'))
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

    it('creates a pod', async () => {
        expect(database.microservice.getAll()).to.not.have.key('test-ms')

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

        await new Promise((resolve, reject) => {
            const podsListener = function (pods: keyable<StoredPod>) {
                const mservice = database.microservice.get('test-ms')
                let podName = mservice.currentPodNames[0]
                if (podName && pods[podName]) {
                    expect(pods[podName].parentName).to.be.equal('microservice/test-ms')
                    expect(pods[podName].containers.length).to.be.equal(1)
                    database.pod.removeListChangedCallback(podsListener)
                    resolve(undefined)
                }
            }
            database.pod.addListChangedCallback(podsListener)
        })
    })

    it('deletes unnecessary pods on downscale', async () => {
        let allPods = database.pod.getAll()
        expect(Object.keys(allPods)).to.have.length(0)

        //create 3 pods
        await database.microservice.update('test-ms', {
            currentConfig: {
                name: 'test-ms', containers: {},
                scale: 3
            },
            currentPodNames: []
        })

        //wait till they created
        await new Promise((resolve, reject) => {
            const podsListener = function (pods: keyable<StoredPod>) {
                if (Object.keys(pods).length === 3) {
                    database.pod.removeListChangedCallback(podsListener)
                    resolve(undefined)
                }
            }
            database.pod.addListChangedCallback(podsListener)
        })

        //change scale to 1
        await database.microservice.update('test-ms', {
            currentConfig: {
                name: 'test-ms', containers: {},
                scale: 1
            },
            currentPodNames: []
        })

        //wait till only 1 pod left
        await new Promise((resolve, reject) => {
            const podsListener = function (pods: keyable<StoredPod>) {
                if (Object.keys(pods).length === 1) {
                    database.pod.removeListChangedCallback(podsListener)
                    resolve(undefined)
                }
            }
            database.pod.addListChangedCallback(podsListener)
        })
    })

    it('deletes pods on deployment delete', async () => {
        let allPods = database.pod.getAll()
        expect(Object.keys(allPods)).to.have.length(0)

        //create 3 pods
        await database.microservice.update('test-ms', {
            currentConfig: {
                name: 'test-ms', containers: {},
                scale: 3
            },
            currentPodNames: []
        })

        //wait till they created
        await new Promise((resolve, reject) => {
            const podsListener = function (pods: keyable<StoredPod>) {
                if (Object.keys(pods).length === 3) {
                    database.pod.removeListChangedCallback(podsListener)
                    resolve(undefined)
                }
            }
            database.pod.addListChangedCallback(podsListener)
        })

        //change scale to 1
        await database.microservice.delete('test-ms')

        //wait till only 1 pod left
        await new Promise((resolve, reject) => {
            const podsListener = function (pods: keyable<StoredPod>) {
                if (Object.keys(pods).length === 0) {
                    database.pod.removeListChangedCallback(podsListener)
                    resolve(undefined)
                }
            }
            database.pod.addListChangedCallback(podsListener)
        })
    })
})
