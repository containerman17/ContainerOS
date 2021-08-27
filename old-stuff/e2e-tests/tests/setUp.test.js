import { reStartContainerOS, stopContainerOS, stopConsul, getRunningContainers, getContainerOsLogs } from "../tools/containerTools.js"
import { expect } from "chai"
import delay from "delay"

describe('Node set up', () => {
    before(async () => {
        await stopConsul()
    })

    after(async function () {
        await stopContainerOS()
        await stopConsul()
    });

    it('should start consul', async () => {
        expect(await getRunningContainers()).to.not.include('consul')
        await reStartContainerOS()
        for (let i = 0; i < 30; i++) {
            const containers = await getRunningContainers()

            if (containers.includes('consul')) {
                return
            } else {
                await delay(100)
            }
        }
    })
})