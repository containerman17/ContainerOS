export type AppUpdate = {
    image: string,
    internetPort: number,
    scale: number,
    hardCpuLimit: number,
    hardMemoryLimit: number,
    internetDomain: string,
    team: string,
    name: string
}

export type StoredUser = {
    name: string,
    tokenHash: string,
    teams: string[],
}


export interface DockerStack {
    version: "3.7";
    services: {
        [key: string]: DockerStackService;
    };
    networks: {
        [key: string]: null | { external: boolean };
    };
}

export interface DockerStackService {
    environment?: {
        [key: string]: string;
    };
    image: string;
    networks: {
        [key: string]: {
            aliases: string[];
        }
    };
    command?: string;
    ports?: string[];
    labels?: {
        [key: string]: string;
    }
    deploy: { replicas: number };
}
