import { CONSUL_ENCRYPTION_KEY, OS_TYPE, POSSIBLE_OS_TYPES, BOOTSTRAP_IPS, IS_CONTROLLER, DEV_MODE, IS_DEV } from "../../config";
import { ContainerCreateOptions } from "dockerode"
import getDefaultNetworkInterface from '../../lib/system/getDefaultNetworkInterface'
import os from "os"
import path from "path"
import fs from "fs"
import axios from "axios"

const getConsulCmd = function (myIp: string): string[] {
    const cmd = [
        'agent',
    ]

    if (IS_CONTROLLER) {
        cmd.push('-server')
    }

    cmd.push('-data-dir=/data')
    cmd.push('-datacenter=main')
    cmd.push(`-encrypt=${CONSUL_ENCRYPTION_KEY}`)
    cmd.push(`--bootstrap`)

    for (let bootstrapIp of BOOTSTRAP_IPS) {
        cmd.push(`-retry-join=${bootstrapIp}`)
    }

    if (IS_DEV) {
        cmd.push(`-ui`)
        cmd.push(`-client`, `0.0.0.0`)
        cmd.push()
    } else {
        cmd.push(`-client`, `127.0.0.1`)
    }
    cmd.push(`--bind`, `${myIp}`)

    return cmd
}

export default async function (): Promise<ContainerCreateOptions[]> {
    const defaultNetworkInterface = await getDefaultNetworkInterface();

    let consulDataFolder = '/var/consul'
    if (OS_TYPE === POSSIBLE_OS_TYPES.Darwin) {
        consulDataFolder = path.join(os.homedir(), 'consul-data')
    }

    if (!fs.existsSync(consulDataFolder)) {
        fs.mkdirSync(consulDataFolder)
        fs.chmodSync(consulDataFolder, 0o777)
    }

    return [
        {
            Image: 'consul:1.9.1',
            Cmd: getConsulCmd(defaultNetworkInterface.ip_address),
            name: `consul`,
            HostConfig: {
                NetworkMode: "host",
                RestartPolicy: {
                    Name: 'always'
                },
                Binds: [`/var/consul:/data`]
            },
        }
    ]
}