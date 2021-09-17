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
    deploy: {
        labels?: {
            [key: string]: string;
        },
        replicas: number,
        resources: {
            limits: {
                cpus: string,
                memory: string
            },
            reservations: {
                cpus: string,
                memory: string
            }
        }
    };
}
