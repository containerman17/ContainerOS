const chai = require("chai")
const { expect } = chai
const axios = require('axios')
const execa = require('execa')
const registryHelpers = require('./lib/projectHelpers')
const TestTimer = require('./lib/Timer')
const path = require('path')
require('dotenv').config({
    path: path.join(__dirname, '..', '..', '.env')
})

chai.config.includeStack = true;

const WILDCARD_DOMAIN = process.env.SYSTEM_WILDCARD_DOMAIN

const api = axios.create({
    baseURL: `http://api.${WILDCARD_DOMAIN}:8000/`,
    timeout: 1000,
})

describe('Registry', function () {
    let registryDomain = null

    before(async function () {
        registryDomain = (await api.get(
            "/v1/config?password=dev"
        )).data.REGISTRY_DOMAIN
    });

    after(async function () {
        await api.post(
            "/v1/testHelpers/cleanProjects?password=dev",
            { "names": registryHelpers.getCreatedProjects().map(u => u.name) }
        );
    });


    it('reaches the registry by https', async function () {
        const response = await axios.get(
            `https://${registryDomain}/v2/`,
            { validateStatus: status => status < 500 }
        )
        expect(response.data.errors[0].code).to.equal('UNAUTHORIZED')
    });

    it('creates user and updates project token', async function () {
        const { name, token } = registryHelpers.getNextProject()

        await api.post(
            "/v1/updateProject?password=dev",
            { "name": name, token: token }
        );

        await api.post(
            "/v1/public/testRegistryPassword",
            { "name": name, token: token }
        )

        const newToken = "test123"

        await api.post(
            "/v1/updateProject?password=dev",
            { "name": name, token: newToken }
        );

        await api.post(
            "/v1/public/testRegistryPassword",
            { "name": name, token: newToken }
        )
    });

    it('pushes and pulls a docker container', async function () {
        this.timeout(30 * 1000);
        //create project
        const { name, token } = registryHelpers.getNextProject()
        await api.post("/v1/updateProject?password=dev", { name, token });
        const containerName = `${registryDomain}/${name}/testcontainer`
        //logout
        await execa("docker", ["logout", registryDomain])
        //login
        const response = await execa("docker", ["login", registryDomain, "-u", name, "-p", token])
        expect(response.stdout).to.equal("Login Succeeded")
        //tag and push
        await execa("docker", ["tag", "quay.io/jitesoft/alpine:3.11", containerName])
        await execa("docker", ["push", containerName])
        //logout
        await execa("docker", ["logout", registryDomain])
    });

    it.only('runs a deployment with custom-build docker container', async function () {
        this.timeout(120 * 1000);
        const timer = new TestTimer()

        //create project and login
        const { name, token } = registryHelpers.getNextProject()
        await api.post("/v1/updateProject?password=dev", { name, token });
        await execa("docker", ["login", registryDomain, "-u", name, "-p", token])
        timer.report("login complete")
        //docker build and push
        const randomTag = Math.round(Math.random() * 1000000)
        const randomDeploymentName = `test${Math.round(Math.random() * 1000000)}`
        const imageName = `${registryDomain}/${name}/${randomDeploymentName}:${randomTag}`
        const testValue = (new Date()).toISOString()//so we can test that the correct container is running
        await execa("docker", [
            "build",
            "-t", imageName,
            "--build-arg", `TEST_VALUE=${testValue}`,
            "."], {
            cwd: path.join(__dirname, 'assets', 'sampleContainer')
        })
        timer.report('build complete')
        await execa("docker", ["push", imageName])
        timer.report('push complete')

        //create app
        await api.post("/v1/updateDeployment?password=dev",
            {
                name: randomDeploymentName,
                "containers": {
                    "main": {
                        "image": imageName,
                        "httpPorts": { "80": "reg.rd.dev.containeros.org" }
                    },
                }
            });
        timer.report('updateDeployment complete')

        //TODO: expose http port and check if current app version is the valid one

        //TODO: clean up test apps
    });
});
