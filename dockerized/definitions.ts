export interface StoredDeployment {
    currentConfig: DeploymentUpdate,
    currentPodNames: String[]
}

export interface DeploymentUpdate {
    name: string,
    image: string,
    httpPorts: {
        [key: number]: string;
    },
    memLimit: number,
    cpus: number,
    env: string[],
    scale: number
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

export interface StoredPodStatus {
    status: containerStatusValues,
    time: Number
}


export type containerStatusValues = "error_pulling" | "started" | "starting"
