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

export interface MicroserviceUpdate {
    name: string,
    scale: number,
    project?: string,
    containers: keyable<ContainerUpdate>
}

export interface ConsulItemResponse {
    Value: string,
    ModifyIndex: string,
}