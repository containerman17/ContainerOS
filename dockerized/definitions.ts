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
    memLimit: string,
    cpus: number,
    env: string[],
    scale: number
}
export interface keyable<TypeName> {
    [key: string]: TypeName
}