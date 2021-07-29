import Pod from "../Pod"
import setUpNode from "../../set-up-node/setUpNode"
import database from "../../../lib/database"
import sinon from "sinon"
import * as dockerUtils from "../../../lib/docker/dockerodeUtils"
import { StoredPodStatus, keyable } from "../../../types"
import { expect } from "chai"

describe.only('Pod runner', () => {
    before(async () => {
        await setUpNode()
    })

    beforeEach(async () => {
        await database.pod.dropAll()
    })

    it('reports failed pulls', async () => {
        sinon.replace(dockerUtils, "isImagePulledSuccessfully", sinon.fake.returns(false));

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
                image: "should:succeed",
                httpPorts: {},
                memLimit: 10000,
                cpus: 10000,
                env: []
            }],
        })

        //check health has pending and failed states

        await new Promise((resolve, reject) => {
            const podStatusListener = function (statuses: keyable<StoredPodStatus>) {
                if (statuses["fake-server/pod-123"] && statuses["fake-server/pod-123"].history.length === 2) {
                    expect(statuses["fake-server/pod-123"].history[0].status).to.equal('Failed')
                    expect(statuses["fake-server/pod-123"].history[0].reason).to.equal("ContainerFailedPulling")

                    expect(statuses["fake-server/pod-123"].history[1].status).to.equal('Pending')
                    expect(statuses["fake-server/pod-123"].history[1].reason).to.equal('Starting')


                    //TODO: check error message contains correct container name
                    database.podStatus.removeListChangedCallback(podStatusListener)
                    resolve(undefined)
                }
            }
            database.podStatus.addListChangedCallback(podStatusListener)
        })
    })
})