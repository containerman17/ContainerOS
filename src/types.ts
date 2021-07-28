export interface keyable<TypeName> {
    [key: string]: TypeName
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

export interface NodeHealth {
    cpuUtilization: number,
    cpuBooking: number,
    RamUtilization: number,
    RamBooking: number,
    lastUpdatedUTC?: string,
    lastUpdatedTs: number,
}

export interface MicroserviceUpdate {
    name: string,
    scale: number,
    // project?: string,
    containers: keyable<ContainerUpdate>
}

export interface ConsulItemResponse {
    Value: string,
    ModifyIndex: string,
}

export interface StoredMicroservice {
    currentConfig: MicroserviceUpdate,
    currentPodNames: string[]
}

export interface StoredPod {
    name: string,
    nodeName: string,
    parentName: string,
    containers: StoredContainer[]
}

export interface StoredContainer {
    name: string,
    image: string,
    httpPorts: {
        [key: number]: string;
    },
    memLimit: number,
    cpus: number,
    env: string[],
}