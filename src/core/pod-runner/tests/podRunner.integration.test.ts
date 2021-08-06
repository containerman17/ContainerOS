import database from "../../../lib/database"
import { StoredPod } from "../../../types";
import podRunner from "../podRunner"
import { getRunningContainersNames, removeContainerHelper } from "../../../lib/docker/dockerodeUtils"
import { expect } from "chai"
import delay from "delay";

async function cleanUp() {
    await database.podStatus.dropAll()
    await database.pod.dropAll()
    await removeContainerHelper("pod-123-some-container", 0)
}

describe('Pod runner integration', function () {
    this.timeout(30000);
    before(async () => {
        await cleanUp()
    });

    after(async () => {
        await cleanUp()
    });

    it('deletes containers of stopped pods', async () => {
        //expect no "some-container" to be started
        expect(await getRunningContainersNames()).to.not.include("pod-123-some-container")

        const pod: StoredPod = {
            name: "fake-server/pod-123",
            parentName: 'fake-deployment-123',
            containers: [{
                name: "some-container",
                image: "tutum/hello-world",
                httpPorts: { 80: 'test2.localhost' },
                memLimit: 100000000,
                cpus: 150000,
                env: []
            }],
        }

        await database.pod.update(pod.name, pod)

        await podRunner.start()

        await podRunner.awaitForPodStart('fake-server/pod-123')


        //expect one "some-container" to be started
        expect(await getRunningContainersNames()).to.include("pod-123-some-container")

        await delay(5000)
        //todo: optimize

        await database.pod.delete(pod.name)

        for (let i = 0; i < 10 * 10; i++) {
            if (podRunner.getPodNames().length === 0) {
                break
            }
            await delay(100)
        }

        expect(await getRunningContainersNames()).to.not.include("pod-123-some-container")
    })
})