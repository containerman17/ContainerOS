import Pod from "../Pod"
import setUpNode from "../../set-up-node/setUpNode"
import database from "../../../lib/database"
import sinon from "sinon"
import * as dockerUtils from "../../../lib/docker/dockerodeUtils"
import dockerode from "../../../lib/docker/dockerode"
import { StoredPodStatus, keyable } from "../../../types"
import { expect } from "chai"
import { after } from "mocha"

const randomNumber = 12347//Math.floor(Math.random() * 100000)
const POD_NAME = `pod-${randomNumber}`

describe.only('Pod runner integration test', function () {
    this.timeout(30000)
    before(async () => {
        sinon.restore()
        await setUpNode()
    })

    beforeEach(async () => {
        await dockerUtils.removeContainerHelper(POD_NAME + '-other-container', 0)
        await dockerUtils.removeContainerHelper(POD_NAME + '-some-container', 0)
        await database.podStatus.dropAll()
    })
    afterEach(async () => {
        // await dockerUtils.removeContainerHelper(POD_NAME + '-other-container', 0)
        // await dockerUtils.removeContainerHelper(POD_NAME + '-some-container', 0)
        // sinon.restore()
        await database.podStatus.dropAll()
    })

    it('registers consul service', async () => {
        //TODO: mock pull function
        const pod = new Pod({
            name: "fake-server/" + POD_NAME,
            parentName: 'fake-deployment-123',
            containers: [
                // {
                //     name: "some-container",
                //     image: "quay.io/bitnami/nginx:latest",
                //     httpPorts: { 80: 'test1.localhost' },
                //     memLimit: 100000000,
                //     cpus: 150000,
                //     env: []
                // },
                {
                    name: "other-container",
                    image: "tutum/hello-world",
                    httpPorts: { 80: 'test2.localhost' },
                    memLimit: 100000000,
                    cpus: 150000,
                    env: []
                }],
        })

        await pod.waitForStart()

    })
})