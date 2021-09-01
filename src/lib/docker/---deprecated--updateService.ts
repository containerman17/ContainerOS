import { AppUpdate } from "../../types"
import getConfigByName from "./getConfigByName"
import Dockerode from "dockerode";
const docker = new Dockerode();

export default async function updateService(data: AppUpdate) {
    //TODO: get config
    const config = await getConfigByName(data.namespace)
    console.log('config', config)
    //TODO: update config

    //generate empty config
    let configData = {
        version: "3.9",
        services: {},
        networks: {
            [data.namespace]: {}
        },
    }

    if (config === null) {
        //get other services from config
    }

    configData[data.name] = {
        image: data.image,
    }

    //TODO: deploy config
}