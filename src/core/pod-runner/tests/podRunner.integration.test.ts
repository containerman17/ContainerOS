import database from "../../../lib/database"
import { StoredPod } from "../../../types";
import podRunner from "../podRunner"

describe('Pod runner integration', () => {
    before(async () => {
        await database.podStatus.dropAll()
        await database.pod.dropAll()
    });

    after(async () => {
        await database.podStatus.dropAll()
        await database.pod.dropAll()
    });

    it('deletes containers of stopped pods', async () => {
        const pod: StoredPod = {
            name: "fake-server/pod-123",
            parentName: 'fake-deployment-123',
            containers: [{
                name: "some-container",
                image: "should:fail",
                httpPorts: {},
                memLimit: 10000,
                cpus: 10000,
                env: []
            }],
        }
        //TODO: expect no "some-container" to be started
        await database.pod.update(pod.name, pod)
        await podRunner.start()
        await podRunner.awaitForPodStart('fake-server/pod-123')

        //TODO: expect one "some-container" to be started

        await database.pod.delete(pod.name)
        //TODO: expect no "some-container" to be started
    })
})