import Pod from "../Pod"
import setUpNode from "../../set-up-node/setUpNode"
import database from "../../../lib/database"
import sinon from "sinon"
import * as dockerUtils from "../../../lib/docker/dockerodeUtils"
import dockerode from "../../../lib/docker/dockerode"
import { StoredPodStatus, keyable } from "../../../types"
import { expect } from "chai"
import { after } from "mocha"

describe.only('Pod runner failures', () => {
    before(async () => {
        await setUpNode()

    })

    beforeEach(async () => {
        await database.podStatus.dropAll()

        sinon.restore()

        let createdContainers = new Set()

        sinon.stub(dockerUtils, "isImagePulledSuccessfully").callsFake(function fakeFn(image) {
            if (image === "should:fail") {
                return false
            } else if (image === "should:pass") {
                return true
            } else {
                console.error("Unknown image")
                throw Error("Unknown image")
            }
        })

        sinon.stub(dockerUtils, "getContainerByName").callsFake(name => createdContainers.has(name))

        sinon.stub(dockerode, "createContainer").callsFake(function fakeFn(config) {
            if (config.name === "pod-123-failed-creating") {
                return Promise.reject(new Error("Fake error"))
            } else {
                createdContainers.add(config.name)
                return
            }
        })
        sinon.stub(dockerode, "getContainer").callsFake(function fakeFn(id) {
            return {
                start() { }
            }
        })
    })
    after(async () => {
        sinon.restore()
        await database.podStatus.dropAll()
    })

    it('reports failed pulls', async () => {

        //TODO: mock pull function
        new Pod({
            name: "fake-server/pod-123",
            parentName: 'fake-deployment-123',
            containers: [{
                name: "some-container",
                image: "should:fail",
                httpPorts: {},
                memLimit: 10000,
                cpus: 10000,
                env: []
            }, {
                name: "other-container",
                image: "should:pass",
                httpPorts: {},
                memLimit: 10000,
                cpus: 10000,
                env: []
            }],
        })

        //check health has pending and failed states

        await new Promise((resolve, reject) => {
            const podStatusListener = function (statuses: keyable<StoredPodStatus>) {
                try {
                    if (statuses["fake-server/pod-123"] && statuses["fake-server/pod-123"].history.length === 2) {
                        expect(statuses["fake-server/pod-123"].history[0].status).to.equal('Failed')
                        expect(statuses["fake-server/pod-123"].history[0].reason).to.equal("ContainerFailedPulling")
                        expect(statuses["fake-server/pod-123"].history[0].message).to.contain("should:fail")

                        expect(statuses["fake-server/pod-123"].history[1].status).to.equal('Pending')
                        expect(statuses["fake-server/pod-123"].history[1].reason).to.equal('PullingContainers')


                        //TODO: check error message contains correct container name
                        database.podStatus.removeListChangedCallback(podStatusListener)
                        resolve(undefined)
                    }
                } catch (e) {
                    reject(e)
                }
            }
            database.podStatus.addListChangedCallback(podStatusListener)
        })
    })

    it('reports ContainerFailedStarting', async () => {
        //TODO: mock pull function
        new Pod({
            name: "fake-server/pod-123",
            parentName: 'fake-deployment-123',
            containers: [{
                name: "failed-creating",
                image: "should:pass",
                httpPorts: {},
                memLimit: 10000,
                cpus: 10000,
                env: []
            }, {
                name: "fail-starting",
                image: "should:pass",
                httpPorts: {},
                memLimit: 10000,
                cpus: 10000,
                env: []
            }],
        })

        //check health has pending and failed states

        await new Promise((resolve, reject) => {
            const podStatusListener = function (statuses: keyable<StoredPodStatus>) {
                if (statuses["fake-server/pod-123"] && statuses["fake-server/pod-123"].history.length === 3) {

                    expect(statuses["fake-server/pod-123"].history[0].status).to.equal('Failed')
                    expect(statuses["fake-server/pod-123"].history[0].reason).to.equal("ContainerFailedStarting")

                    expect(statuses["fake-server/pod-123"].history[1].status).to.equal('Pending')
                    expect(statuses["fake-server/pod-123"].history[1].reason).to.equal('StartingContainers')


                    //TODO: check error message contains correct container name
                    database.podStatus.removeListChangedCallback(podStatusListener)
                    resolve(undefined)
                }
            }
            database.podStatus.addListChangedCallback(podStatusListener)
        })
    })

    it('reports pod Running', async () => {
        new Pod({
            name: "fake-server/pod-123",
            parentName: 'fake-deployment-123',
            containers: [{
                name: "good-one",
                image: "should:pass",
                httpPorts: {},
                memLimit: 10000,
                cpus: 10000,
                env: []
            }, {
                name: "another-good-one",
                image: "should:pass",
                httpPorts: {},
                memLimit: 10000,
                cpus: 10000,
                env: []
            }],
        })

        await new Promise((resolve, reject) => {
            const podStatusListener = function (statuses: keyable<StoredPodStatus>) {
                if (statuses["fake-server/pod-123"] && statuses["fake-server/pod-123"].history.length === 3) {

                    expect(statuses["fake-server/pod-123"].history[0].status).to.equal('Running')
                    expect(statuses["fake-server/pod-123"].history[0].reason).to.equal("Started")

                    expect(statuses["fake-server/pod-123"].history[1].status).to.equal('Pending')
                    expect(statuses["fake-server/pod-123"].history[1].reason).to.equal('StartingContainers')

                    expect(statuses["fake-server/pod-123"].history[2].status).to.equal('Pending')
                    expect(statuses["fake-server/pod-123"].history[2].reason).to.equal('PullingContainers')


                    //TODO: check error message contains correct container name
                    database.podStatus.removeListChangedCallback(podStatusListener)
                    resolve(undefined)
                }
            }
            database.podStatus.addListChangedCallback(podStatusListener)
        })
    })
})