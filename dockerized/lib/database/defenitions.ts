export interface DeploymentUpdate {
    name: string,
    image: string,
    httpPorts: {
        [key: number]: string;
    },
    memLimit: string,
    cpus: number,
    env: string[],
    scale: number,
    dirty?: boolean
}
export interface keyable {
    [key: string]: any
}