import dockerode from "../../lib/docker/dockerode";
import Dockerode from "dockerode"
import { isImagePulledSuccessfully, getContainerByName } from "../../lib/docker/dockerodeUtils";
import config from "../../config"
import http from "http"
import delay from "delay"
import logger from "../../lib/logger"

export default async function () {
    //TODO search for image
    const imageName = config.get("ROUTER_IMAGE")

    if (!await isImagePulledSuccessfully(imageName)) {
        throw Error(`Ooops! Error pulling router image ${imageName}. Unable to start`)
    }

    //create container if not exists
    let createdContainer = await getContainerByName("cos-router")
    if (!createdContainer) {
        const conf: Dockerode.ContainerCreateOptions = {
            Image: imageName,
            name: "cos-router",
            Hostname: config.get("NODE_NAME"),
            HostConfig: {
                NetworkMode: "host",
                RestartPolicy: {
                    Name: 'always'
                },
                Binds: [],
            },
        }

        await dockerode.createContainer(conf)
        createdContainer = await getContainerByName("cos-router")
    }


    //start container if not started
    const containerToStart = dockerode.getContainer(createdContainer.Id);
    logger.debug('createdContainer.State', createdContainer.State)
    if (createdContainer.State !== 'running') {
        await containerToStart.start()
    }


    for (let i = 0; i < 30; i++) {

        const isStarted = await isRouterStarted()
        if (isStarted) {
            logger.info('Router started')
            return
        } else {
            logger.debug('Waiting for router to start')
            await delay(i * 100)
        }
    }
    throw "COULD NOT START ROUTER"
}


async function isRouterStarted() {
    return new Promise((resolve, reject) => {
        const options = {
            host: '127.0.0.1',
            path: '/'
        };

        http.request(options, function (response) {
            if (response.statusCode == 308) {
                resolve(true)
            } else {
                resolve(false)
            }
        }).on('error', function (err) {
            resolve(false)
        }).end();

    })
}
