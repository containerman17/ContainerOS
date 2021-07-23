import dockerode from "../../lib/docker/dockerode";
import { pullImage, getContainerByName } from "../../lib/docker/dockerodeUtils";
import config from "../../config"
import os from "os"
import path from "path"
import fs from "fs"

export default async function () {
    //create directory 
    const consulDataFolder = path.join(os.homedir(), 'consul-data')
    createConsulDir(consulDataFolder)

    //TODO search for image
    const imageName = config.get("CONSUL_IMAGE")

    if (!await pullImage(imageName)) {
        throw "Ooops! Error pulling consul image. Unable to start"
    }

    //create container if not exists
    let createdContainer = await getContainerByName("consul")
    if (!createdContainer) {
        await dockerode.createContainer({
            Image: imageName,
            Cmd: getConsulCmd(),
            name: "consul",
            HostConfig: {
                NetworkMode: "host",
                RestartPolicy: {
                    Name: 'always'
                },
                Binds: [`${consulDataFolder}:/data`]
            }
        })
        createdContainer = await getContainerByName("consul")
    }

    //start container if not started
    const containerToStart = dockerode.getContainer(createdContainer.Id);
    if (createdContainer.State !== 'running') {
        await containerToStart.start()
    }
}

const createConsulDir = consulDataFolder => {
    if (!fs.existsSync(consulDataFolder)) {
        fs.mkdirSync(consulDataFolder)
    }
    fs.chmodSync(consulDataFolder, 0o777)//TODO: set correct permissions
}

const getConsulCmd = function (): string[] {
    const EXPECTED_CONTROLLER_IPS = config.get("EXPECTED_CONTROLLER_IPS")
    const IS_DEV = config.get("IS_DEV")
    const cmd = [
        'agent',
    ]

    cmd.push('-server')

    cmd.push('-data-dir=/data')
    cmd.push('-datacenter=main')
    cmd.push(`-encrypt=${config.get("CONSUL_ENCRYPTION_KEY")}`)
    cmd.push(`--bootstrap-expect=${EXPECTED_CONTROLLER_IPS.length}`)

    for (let bootstrapIp of EXPECTED_CONTROLLER_IPS) {
        cmd.push(`-retry-join=${bootstrapIp}`)
    }

    if (IS_DEV) {
        cmd.push(`-ui`)
        cmd.push(`-client`, `0.0.0.0`)
    } else {
        cmd.push(`-client`, `127.0.0.1`)
    }

    return cmd
}