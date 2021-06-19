export interface StoredDeployment {
    currentConfig: DeploymentUpdate,
    currentPodNames: String[]
}

export interface ContainerUpdate {
    httpPorts: {
        [key: number]: string;
    },
    memLimit: number,
    cpus: number,
    env: string[],
    image: string,
}

export interface DeploymentUpdate {
    name: string,
    scale: number
    containers: keyable<ContainerUpdate>
}
export interface keyable<TypeName> {
    [key: string]: TypeName
}

export interface NodeHealth {
    cpuUtilization: number,
    cpuBooking: number,
    RamUtilization: number,
    RamBooking: number,
    lastUpdatedUTC: string,
    lastUpdatedTs: number,
    ip: string,
}

export interface StoredPod {
    name: string,
    containers: Container[]
}

export interface Container {
    name: string,
    image: string,
    httpPorts: {
        [key: number]: string;
    },
    memLimit: number,
    cpus: number,
    env: string[],
}

export interface StoredContainerStatus {
    status: containerStatusValues,
    time: Number,
    containerName: string,
    podName: string,
    nodeName: string
}


export type containerStatusValues = "error_pulling" | "started" | "starting" | "dead"
