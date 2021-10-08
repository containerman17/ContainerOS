import { DockerStack, StoredUser } from "../../types";
import krakenKV from "./kraken/krakenKV";
import safePatch from "./kraken/safepatch";
import { uuid } from 'uuidv4';
import { sha256 } from "../utils";
import listenForUpdates from "./kraken/listenForUpdates";

export async function getStack(stackName: string): Promise<DockerStack> {
    const result = await krakenKV.get(`stacks/${stackName}`)
    console.log('getStack result', result)
    return JSON.parse(result || JSON.stringify(getEmptyStack(stackName)))
}

function getEmptyStack(stackName: string): DockerStack {
    return {
        version: "3.7",
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

export async function getUser(name: string, returnEmptyByDefault = true): Promise<StoredUser> {
    const result = await krakenKV.get(`users/${name}`)
    if (!result && !returnEmptyByDefault) {
        return null
    }
    return JSON.parse(result || JSON.stringify(getEmptyUser(name)))
}

let usersCache: { [key: string]: StoredUser } = null
listenForUpdates('users/', function (newUsers: { [key: string]: StoredUser }) {
    usersCache = newUsers
})

export async function getUserCached(name: string): Promise<StoredUser> {
    if (usersCache === null) {
        return getUser(name, false)
    }
    return usersCache['users/' + name] || null
}
