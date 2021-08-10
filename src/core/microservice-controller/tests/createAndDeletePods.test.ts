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
        await database.microservice.dropAll()
        await database.pod.dropAll()
        await database.ingress.dropAll()
    })

    afterEach(async () => {
        microserviceController.stop();
    })

    after(async () => {
        await database.microservice.dropAll()
        await database.pod.dropAll()
        await database.ingress.dropAll()
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
                        httpPorts: {
                            80: 'eighty.com',
                            8080: 'eightyeighty.com',
                        },
                        memLimit: 1000000,
                        cpus: 100000,
                        env: [],
                        image: "hello-world",
                    }
                }
            },
            currentPodNames: []
        })

        await microserviceController.start()
        //TODO: pod is not always created here

        const podName = database.microservice.get('test-ms').currentPodNames[0]
        const pod: StoredPod = database.pod.getAll()[podName]

        const ingress80 = Object.values(database.ingress.getAll()).find(ingress => ingress.domain === 'eighty.com')
        const ingress8080 = Object.values(database.ingress.getAll()).find(ingress => ingress.domain === 'eightyeighty.com')

        //todo: check for ingress name
        expect(pod.parentName).to.be.equal('microservice/test-ms')
        expect(pod.containers.length).to.be.equal(1)

        expect(pod.containers[0].services).to.be.deep.equal({
            80: ingress80.service,
            8080: ingress8080.service,
        })
    })

    it('deletes unnecessary pods on downscale', async () => {
        let allPods = database.pod.getAll()
        expect(Object.keys(allPods)).to.have.length(0)

        microserviceController.start()

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

        microserviceController.start()

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
