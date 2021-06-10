import { CONSUL_ENCRYPTION_KEY, OS_TYPE, POSSIBLE_OS_TYPES } from "../../config";
import Dockerode from "dockerode"
import getDefaultNetworkInterface from '../../lib/system/getDefaultNetworkInterface'
import os from "os"
import path from "path"

export default async function (): Promise<Dockerode.ContainerCreateOptions[]> {
    const defaultNetworkInterface = await getDefaultNetworkInterface();

    let consulDataFolder = '/var/consul'
    if (OS_TYPE === POSSIBLE_OS_TYPES.Darwin) {
        consulDataFolder = path.join(os.homedir(), 'consul-data')
    }

    //TODO mkdir /var/consul; chmod 777 /var/consul or something like that

    return [
        {
            Image: 'consul:1.9.1',
            // Cmd: `agent -server -data-dir=/data -datacenter=main -encrypt=${CONSUL_ENCRYPTION_KEY} --bootstrap -ui -client 0.0.0.0 --bind ${defaultNetworkInterface.ip_address}`.split(' '),
            Cmd: `agent -dev`.split(' '),
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