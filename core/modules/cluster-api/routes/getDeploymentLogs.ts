import express from "express";
import database from "../../../lib/database"
import { HttpCodes, HttpError } from "../../../lib/http/Error";
import { OnlyNameValidator } from "../validators";
import { create } from 'superstruct'
import { NodeHealth, StoredDeployment, StoredPod } from "../../../definitions";
import getStoreCopy from "../../../lib/database/getStoreCopy"
import axios from "axios"
import { API_PASSWORD, NODE_API_PORT } from "../../../config";


const podStore = getStoreCopy<StoredPod>("pods")
const nodeHealthStore = getStoreCopy<NodeHealth>("nodeHealth")
const deploymentStore = getStoreCopy<StoredDeployment>("deployments")

export default async function (req: express.Request, res: express.Response) {
    const { name } = create(req.body, OnlyNameValidator)

    const deployment: StoredDeployment = await deploymentStore.getKey(`deployments/${name}`)

    if (deployment === null) {
        throw new HttpError(`Deployment ${name} is not found in this ContainerOS cluster`, HttpCodes.NotFound)
    }

    //find node ips for every pod
    const podToNodeIpMapping = {}
    const findPodsPromises = deployment.currentPodNames
        .map(
            podName => podStore.getByEnding(podName)
                .then((pod: StoredPod) => nodeHealthStore.getByEnding(pod.nodeName))
                .then((node: NodeHealth) => podToNodeIpMapping[podName] = node.ip)
        )
    await Promise.all(findPodsPromises)

    //get logs for every pod
    const logs = {}
    const getLogPromises = deployment.currentPodNames.map(
        podName => axios.get(`http://${podToNodeIpMapping[podName]}:${NODE_API_PORT}/v1/podLogs?password=${API_PASSWORD}&name=${podName}`)
            .then(response => logs[podName] = response.data)
    )
    await Promise.all(getLogPromises)

    return res.send(logs)
}