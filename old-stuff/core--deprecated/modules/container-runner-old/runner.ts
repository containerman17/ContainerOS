import syncContainersList from "./syncContainersList"
import getDefaultContainers from './getDefaultContainers'
import database from "../../lib/database"
import { NODE_NAME } from "../../config"
import { keyable, StoredPod, StoredContainerStatus, StoredContainer } from "../../definitions"
import Dockerode, { ContainerCreateOptions } from "dockerode"
import axios from "axios"
import delay from "delay"
import podListToContainerList from "./podListToContainerList"
import { pullMultipleImages } from "./pullImages"
import { setDesiredContainersList, setRemoveOrphans } from "./composeDriver"//should be easy to replace with another driver
import { object } from "superstruct"

async function init() {
    const defaultContainers = await getDefaultContainers();

    //pull images
    const pullImageResults: keyable<boolean> = await pullMultipleImages(
        defaultContainers.map(cont => cont.Image)
    )
    for (let [image, result] of Object.entries(pullImageResults)) {
        if (result === false) {
            throw `Failed to start - system image "${image}" can not be pulled`
        }
    }

    setRemoveOrphans(false)//so it would not delete already started containers
    await setDesiredContainersList(defaultContainers)

    for (let i = 0; i < 30; i++) {
        await delay(i * 100)
        const isStarted = await isConsulStarted()
        if (isStarted) {
            console.log('Consul started')
            return
        }
    }
    throw "COULD NOT START CONSUL"
}

async function isConsulStarted() {
    try {
        const response = await axios.get(`http://localhost:8500/v1/catalog/nodes`)
        if (response.data[0].ID) {
            return true
        } else {
            return false
        }
    } catch (e) {
        return false
    }
}

async function start() {
    await init();
    console.log('Runner is running')
    const defaultContainers = await getDefaultContainers();

    //TODO: this can be faster if we start pods and not wait for all pods to be pulled
    database.listenForUpdates(`pods/${NODE_NAME}`, async function (podList: keyable<StoredPod>) {
        //TODO: for each pod pre-pull images and report fail
        const podsToStart = []
        const pullFailedPods = []

        await Promise.all(
            Object.entries(podList).map(async entry => {
                const [podName, podConf] = entry;
                const pullImageResults: keyable<boolean> = await pullMultipleImages(
                    podConf.containers.map((cont: StoredContainer) => cont.image)
                )
                const allContainerPulled = Object.values(pullImageResults)
                    .reduce((acc, val) => acc && val, true)

                if (allContainerPulled) {
                    podsToStart.push(podName)
                } else {
                    pullFailedPods.push(podName)
                }
            })
        )

        //convert pod list to container list
        const containerList: Dockerode.ContainerCreateOptions[] = [...podListToContainerList(podList), ...defaultContainers]

        //pre-pull images to know which one will be failed to pull
        const pullImageResults: keyable<boolean> = await pullMultipleImages(
            defaultContainers.map(cont => cont.Image)
        )
        //TODO: exclude pull errors from list of containers to start
        //TODO: report container statuses for pull errors

        //set desired containers list
        setRemoveOrphans(true)
        await setDesiredContainersList(containerList)
    })
}
export default { start, init }

if (require.main === module) {
    start();
}
