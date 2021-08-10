export interface keyable<TypeName> {
    [key: string]: TypeName
}

export interface ContainerUpdate {
    httpPorts: {
        [key: number]: string;
    },
    memLimit?: number,
    cpus?: number,
    env?: string[],
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

export interface StoredIngress {
    name: string,
    service: string,
    domain: string,
}

export interface StoredPod {
    name: string,
    parentName: string,
    containers: PodContainer[]
}

export interface PodContainer {
    name: string,
    image: string,
    services: {
        [key: number]: string;
    },
    memLimit: number,
    cpus: number,
    env: string[],
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

export type StoredPodStatus = {
    history: (StoredPodStatusElement & { ts: number })[]
}


export type StoredPodStatusElement = {
    status: "Pending",
    reason: "PullingContainers" | "StartingContainers",
    message: string
} | {
    status: "Running",
    reason: "Started",
    message: string
} | {
    status: "Failed",
    reason: "ContainerFailedPulling" | "ContainerKeepsCrashing" | "ContainerFailedStarting",
    message: string
} | {
    status: "Unknown",
    reason: "Unknown",
    message: string
} | {
    status: "Removed",
    reason: "RemovedOk",
    message: string
}

export type podStatusValue = StoredPodStatusElement['status']
