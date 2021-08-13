import { reStartContainerOS, stopContainerOS, stopConsul, getRunningContainers, getContainerOsLogs } from "../tools/containerTools.js"
import { expect } from "chai"
import delay from "delay"
import axios from "axios"

describe('Microservice logic', function () {
    let myIp
    before(async () => {
        await stopConsul()
        await reStartContainerOS()

        myIp = (
            await axios.get('http://ifconfig.co', {
                headers: {
                    'accept': 'application/json'
                }
            })
        ).data.ip

        //make sure containers from a failed run cleaned up
        for (let i = 0; i < 50; i++) {
            const containers = await getRunningContainers()
            const cleanUpComplete = containers.filter(name => name.startsWith('nginx-test')).length === 0
            if (cleanUpComplete) break
            await delay(100)
        }
        let containers = await getRunningContainers()
        expect(containers.filter(name => name.startsWith('nginx-test'))).to.have.length(0)
    })
    after(async () => {
        console.log('Logs: ', await getContainerOsLogs())

        await stopConsul()
        await stopContainerOS()
    })

    it('should expose an http server', async () => {
        for (let i = 0; i < 20; i++) {
            try {
                let response = await axios.get('http://localhost:8000/')
                if (response.status === 200) {
                    return
                }
            } catch (e) {
            }
            await delay(1000)
        }
        expect(false).to.be.true
    })

    it('should start, stop and scale microservice', async function () {

        //create microservice
        let body = {
            "name": "nginx-test",
            "scale": 1,
            "containers": {
                "reg": {
                    "image": "tutum/hello-world",
                    "httpPorts": { "80": `ms-e2e.${myIp}.nip.io` }
                },
            }
        }
        await axios.post(`http://127.0.0.1:8000/v1/microservice?password=dev`, body)

        for (let i = 0; i < 20; i++) {
            const containers = await getRunningContainers()
            const nginxFound = containers.filter(name => name.startsWith('nginx-test')).length === 1
            if (nginxFound) break
            await delay(1000)
        }

        let containers = await getRunningContainers()
        expect(containers.filter(name => name.startsWith('nginx-test'))).to.have.length(1)

        //scale up microservice
        body = {
            "name": "nginx-test",
            "scale": 2,
            "containers": {
                "reg": {
                    "image": "tutum/hello-world",
                    "httpPorts": { "80": `ms-e2e.${myIp}.nip.io` }
                },
            }
        }
        await axios.post(`http://127.0.0.1:8000/v1/microservice?password=dev`, body)

        for (let i = 0; i < 10; i++) {
            const containers = await getRunningContainers()
            const secondNginxFound = containers.filter(name => name.startsWith('nginx-test')).length === 2
            if (secondNginxFound) break
            await delay(1000)
        }

        containers = await getRunningContainers()
        expect(containers.filter(name => name.startsWith('nginx-test'))).to.have.length(2)

        //scale down microservice
        body = {
            "name": "nginx-test",
            "scale": 0,
            "containers": {
                "reg": {
                    "image": "tutum/hello-world",
                    "httpPorts": { "80": `ms-e2e.${myIp}.nip.io` }
                },
            }
        }
        axios.post(`http://127.0.0.1:8000/v1/microservice?password=dev`, body)

        for (let i = 0; i < 60; i++) {
            const containers = await getRunningContainers()
            const containersDeleted = containers.filter(name => name.startsWith('nginx-test')).length === 0

            if (containersDeleted) break
            await delay(100)
        }

        containers = await getRunningContainers()
        expect(containers.filter(name => name.startsWith('nginx-test'))).to.have.length(0)
    })

    it('should handle rapid changes', async function () {
        //create microservice
        let body = {
            "name": "nginx-test",
            "scale": 0,
            "containers": {
                "reg": {
                    "image": "tutum/hello-world",
                    "httpPorts": { "80": `ms-e2e.${myIp}.nip.io` }
                },
            }
        }
        await axios.post(`http://127.0.0.1:8000/v1/microservice?password=dev`, body)

        for (let i = 0; i < 20; i++) {
            const containers = await getRunningContainers()
            const scaleComplete = containers.filter(name => name.startsWith('nginx-test')).length === 0
            if (scaleComplete) break
            await delay(1000)
        }

        let containers = await getRunningContainers()
        expect(containers.filter(name => name.startsWith('nginx-test'))).to.have.length(0)

        //scale up microservice
        body = { ...body, scale: 5 }
        await axios.post(`http://127.0.0.1:8000/v1/microservice?password=dev`, body)

        for (let i = 0; i < 20; i++) {
            const containers = await getRunningContainers()
            const scaleComplete = containers.filter(name => name.startsWith('nginx-test')).length === 5
            if (scaleComplete) break
            await delay(1000)
        }

        containers = await getRunningContainers()
        expect(containers.filter(name => name.startsWith('nginx-test'))).to.have.length(5)

        //scale down microservice
        body = { ...body, scale: 3 }
        await axios.post(`http://127.0.0.1:8000/v1/microservice?password=dev`, body)

        for (let i = 0; i < 20; i++) {
            const containers = await getRunningContainers()
            const secondNginxFound = containers.filter(name => name.startsWith('nginx-test')).length === 3
            if (secondNginxFound) break
            await delay(1000)
        }

        containers = await getRunningContainers()
        expect(containers.filter(name => name.startsWith('nginx-test'))).to.have.length(3)

        //up and down again
        body = { ...body, scale: 5 }
        await axios.post(`http://127.0.0.1:8000/v1/microservice?password=dev`, body)
        body = { ...body, scale: 2 }
        await axios.post(`http://127.0.0.1:8000/v1/microservice?password=dev`, body)

        // for (let i = 0; i < 3; i++) {
        //     await delay(1000)
        for (let i = 0; i < 10; i++) {
            const containers = await getRunningContainers()
            const secondNginxFound = containers.filter(name => name.startsWith('nginx-test')).length === 2
            if (secondNginxFound) break
            await delay(1000)
        }
        // }

        containers = await getRunningContainers()
        expect(containers.filter(name => name.startsWith('nginx-test'))).to.have.length(2)
    })

    it('should respond on https requests', async function () {
        let body = {
            "name": "nginx-test",
            "scale": 1,
            "containers": {
                "reg": {
                    "image": "tutum/hello-world",
                    "httpPorts": { "80": `ms-e2e.${myIp}.nip.io` }
                },
            }
        }
        await axios.post(`http://127.0.0.1:8000/v1/microservice?password=dev`, body)

        let response
        for (let i = 0; i < 240; i++) {
            try {
                response = await axios.get(`https://ms-e2e.${myIp}.nip.io`)
                break
            } catch (e) {
            }
            await delay(1000)
        }
        expect(response.status).to.equal(200)
        expect(response.data).to.contain('nginx-test')
    })
})