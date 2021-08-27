import dockerode from "../../lib/docker/dockerode";
import Dockerode from "dockerode"
import { isImagePulledSuccessfully, getContainerByName } from "../../lib/docker/dockerodeUtils";
import config from "../../config"
import os from "os"
import path from "path"
import fs from "fs"
import axios from "axios"
import delay from "delay"
import logger from "../../lib/logger"

const IS_PROD = config.get("IS_PROD")

export default async function () {
    //create directory 
    const consulDataFolder = path.join(os.homedir(), 'consul-data')
    if (IS_PROD) {
        createConsulDir(consulDataFolder)
    }

    //TODO search for image
    const imageName = config.get("CONSUL_IMAGE")

    if (!await isImagePulledSuccessfully(imageName)) {
        throw Error(`Ooops! Error pulling consul image ${imageName}. Unable to start`)
    }

    //create container if not exists
    let createdContainer = await getContainerByName("consul")
    if (!createdContainer) {
        const conf: Dockerode.ContainerCreateOptions = {
            Image: imageName,
            Cmd: getConsulCmd(),
            name: "consul",
            Hostname: config.get("NODE_NAME"),
            HostConfig: {
                RestartPolicy: {
                    Name: 'always'
                },
                Binds: [],

            },
            Env: ["CONSUL_BIND_INTERFACE=eth0"]
        }

        conf.HostConfig.NetworkMode = "host"
        if (IS_PROD) {
            conf.HostConfig.Binds.push(`${consulDataFolder}:/data`)
        } else {
            // conf.HostConfig.PortBindings = {
            //     "8500/tcp": [
            //         {
            //             "HostPort": "8500"
            //         }
            //     ]
            // }
        }

        await dockerode.createContainer(conf)
        createdContainer = await getContainerByName("consul")
    }

    //start container if not started
    const containerToStart = dockerode.getContainer(createdContainer.Id);
    logger.debug('createdContainer.State', createdContainer.State)
    if (createdContainer.State !== 'running') {
        await containerToStart.start()
    }

    for (let i = 0; i < 30; i++) {

        const isStarted = await isConsulStarted()
        if (isStarted) {
            logger.info('Consul started')
            return
        } else {
            logger.debug('Waiting for consul to start')
            await delay(i * 100)
        }
    }
    throw "COULD NOT START CONSUL"
}


async function isConsulStarted() {
    try {
        const response = await axios.get(`http://127.0.0.1:8500/v1/catalog/nodes`)
        if (response.data[0].ID) {
            return true
        } else {
            return false
        }
    } catch (e) {
        return false
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
    const cmd = [
        'agent',
    ]

    cmd.push('-server')

    cmd.push('-datacenter=main')

    if (IS_PROD) {
        cmd.push('-data-dir=/data')
        cmd.push(`--bootstrap-expect=${EXPECTED_CONTROLLER_IPS.length}`)
        cmd.push(`-client`, `127.0.0.1`)
        cmd.push(`-encrypt=${config.get("CONSUL_ENCRYPTION_KEY")}`)
        for (let bootstrapIp of EXPECTED_CONTROLLER_IPS) {
            cmd.push(`-retry-join=${bootstrapIp}`)
        }
    } else {
        cmd.push(`-dev`)
        cmd.push(`-ui`)
        cmd.push(`-client`, `0.0.0.0`)
        cmd.push('-data-dir=/tmp')
    }

    return cmd
}