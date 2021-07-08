const chai = require("chai")
const { expect } = chai
const axios = require('axios')
const execa = require('execa')

chai.config.includeStack = true;

const api = axios.create({
    baseURL: "http://127.0.0.1:8000/",
    timeout: 1000,
})

describe('Registry', function () {
    let registryDomain = null

    const PROJECTS = [
        { name: 'testuser1', token: 'testtoken1' },
        { name: 'testuser2', token: 'testtoken2' },
    ]

    before(async function () {
        await api.post(
            "/v1/testHelpers/cleanProjects?password=dev",
            { "names": PROJECTS.map(u => u.name) }
        );
        registryDomain = (await api.get(
            "/v1/config?password=dev"
        )).data.REGISTRY_DOMAIN
    });

    after(async function () {
        await api.post(
            "/v1/testHelpers/cleanProjects?password=dev",
            { "names": PROJECTS.map(u => u.name) }
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
        await api.post(
            "/v1/updateProject?password=dev",
            { "name": PROJECTS[0].name, token: PROJECTS[0].token }
        );

        await api.post(
            "/v1/public/testRegistryPassword",
            { "name": PROJECTS[0].name, token: PROJECTS[0].token }
        )

        const newToken = "test123"

        await api.post(
            "/v1/updateProject?password=dev",
            { "name": PROJECTS[0].name, token: newToken }
        );

        await api.post(
            "/v1/public/testRegistryPassword",
            { "name": PROJECTS[0].name, token: newToken }
        )
    });

    it('pushes and pulls a docker container', async function () {
        this.timeout(10000);
        let response
        //create project
        const { name, token } = PROJECTS[1]
        const containerName = `${registryDomain}/${name}/testcontainer`

        await api.post("/v1/updateProject?password=dev", { name, token });
        //logout
        await execa("docker", ["logout", registryDomain])
        //login
        response = await execa("docker", ["login", registryDomain, "-u", name, "-p", token])
        expect(response.stdout).to.equal("Login Succeeded")
        //tag and push
        await execa("docker", ["tag", "quay.io/jitesoft/alpine:3.11", containerName])
        await execa("docker", ["push", containerName])
        //logout
        await execa("docker", ["logout", registryDomain])
    });

    it.skip('runs a deployment with custom-build docker container', async function () {

    });

    it.skip('rejects pushes and pulls from unauthorised user', async function () { });
});
