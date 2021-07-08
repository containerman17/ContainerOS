import { assert, object, size, map, number, record, string, array, boolean, optional, defaulted, refine, create, pattern } from 'superstruct'
import { DEPLOYMENT_MAX_SCALING } from "../../config"

export const validName = pattern(string(), /^[a-z]{1}[a-z0-9-]{2,}$/)

export const namesArray = object({
    names: array(validName)
})

export const ContainerUpdate = object({
    image: string(),
    memLimit: defaulted(number(), 1000 * 1000 * 1000), //1GB
    cpus: defaulted(number(), 1),
    env: defaulted(array(string()), []),
    httpPorts: defaulted(record(string(), string()), {}),
})

export const updateProject = object({
    name: validName,
    token: size(string(), 5, 34)
})

export const DeploymentUpdate = object({
    name: validName,
    scale: defaulted(number(), () => 1),
    containers: record(validName, ContainerUpdate)
})

export const GetDeploymentLogsValidator = object({
    name: validName,
})

export const ScaleCheck = refine(
    number(),
    'min 1, max ' + DEPLOYMENT_MAX_SCALING,
    v => v >= 0 && v <= DEPLOYMENT_MAX_SCALING
)