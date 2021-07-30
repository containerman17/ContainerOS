import Pod from "../Pod"
import setUpNode from "../../set-up-node/setUpNode"
import database from "../../../lib/database"
import sinon from "sinon"
import * as dockerUtils from "../../../lib/docker/dockerodeUtils"
import dockerode from "../../../lib/docker/dockerode"
import { StoredPodStatus, keyable } from "../../../types"
import { expect } from "chai"
import { after } from "mocha"

describe('Pod runner failures', () => {
    before(async () => {
        await setUpNode()

    })

    let isImagePulledSuccessfullyStub: sinon.SinonStub

    beforeEach(async () => {
        await database.podStatus.dropAll()

        sinon.restore()

        let createdContainers = new Set()

        isImagePulledSuccessfullyStub = sinon.stub(dockerUtils, "isImagePulledSuccessfully").callsFake(function fakeFn(image) {
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
        const pod = new Pod({
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

        await pod.waitForStart()
        const podStatus = database.podStatus.get("fake-server/pod-123")

        //check health has pending and failed states

        expect(podStatus.history[0].status).to.equal('Failed')
        expect(podStatus.history[0].reason).to.equal("ContainerFailedPulling")
        expect(podStatus.history[0].message).to.contain("should:fail")

        expect(podStatus.history[1].status).to.equal('Pending')
        expect(podStatus.history[1].reason).to.equal('PullingContainers')

    })

    it('reports ContainerFailedStarting', async () => {
        //TODO: mock pull function
        const pod = new Pod({
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
        await pod.waitForStart()
        const podStatus = database.podStatus.get("fake-server/pod-123")

        expect(podStatus.history[0].status).to.equal('Failed')
        expect(podStatus.history[0].reason).to.equal("ContainerFailedStarting")

        expect(podStatus.history[1].status).to.equal('Pending')
        expect(podStatus.history[1].reason).to.equal('StartingContainers')


    })

    it('reports pod Running', async () => {
        const pod = new Pod({
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
        await pod.waitForStart()

        const podStatus = database.podStatus.get("fake-server/pod-123")

        expect(podStatus.history[0].status).to.equal('Running')
        expect(podStatus.history[0].reason).to.equal("Started")

        expect(podStatus.history[1].status).to.equal('Pending')
        expect(podStatus.history[1].reason).to.equal('StartingContainers')

        expect(podStatus.history[2].status).to.equal('Pending')
        expect(podStatus.history[2].reason).to.equal('PullingContainers')
    })

    it('does not try to re-start failed pods', async () => {
        expect(isImagePulledSuccessfullyStub.called).to.be.false
        //TODO: mock pull function
        const pod1 = new Pod({
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

        await pod1.waitForStart()
        expect(isImagePulledSuccessfullyStub.called).to.be.true

        isImagePulledSuccessfullyStub.resetHistory()

        //re-run the same pod
        const pod2 = new Pod({
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
        await pod2.waitForStart()

        expect(isImagePulledSuccessfullyStub.called).to.be.false
    })
})