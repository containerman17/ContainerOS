import { DockerStack, StoredUser } from "../../types";
import consulInstance from "./consul/consulInstance";
import safePatch from "./consul/safepatch";
import { uuid } from 'uuidv4';
import { sha256 } from "../utils";

export async function getStack(stackName: string): Promise<DockerStack> {
    const result = await consulInstance.kv.get(`stacks/${stackName}`)
    console.log('getStack result', result)
    return JSON.parse(result?.Value || JSON.stringify(getEmptyStack(stackName)))
}

function getEmptyStack(stackName: string): DockerStack {
    return {
        version: "3.9",
        services: {},
        networks: {
            [stackName]: null,
            caddy: { external: true }
        },
    }
}

export function updateStack(stackName: string, patch: (oldValue: DockerStack) => DockerStack): Promise<void> {
    const defaultString = JSON.stringify(getEmptyStack(stackName))
    return safePatch(`stacks/${stackName}`, patch, defaultString)
}

function getEmptyUser(name: string): StoredUser {
    return {
        tokenHash: sha256(uuid()),
        name,
        teams: [],
    }
}
export function updateUser(name: string, patch: (oldValue: StoredUser) => StoredUser): Promise<void> {
    const defaultString = JSON.stringify(getEmptyUser(name))
    return safePatch(`users/${name}`, patch, defaultString)
}

export async function getUser(name: string): Promise<DockerStack> {
    const result = await consulInstance.kv.get(`users/${name}`)
    console.log('getUser result', result)
    return JSON.parse(result?.Value || JSON.stringify(getEmptyUser(name)))
}