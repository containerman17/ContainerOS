import Dockerode from "dockerode";
import { keyable, ServicePayload } from "./types";

export function parseLables(
    labels: keyable<string>,
    defaultName: string,
    publicPortsMapping: { [key: string]: string },
    networkMode): ServicePayload[] {

    interface tempServiceVar {
        name?: string,
        tags?: string[],
    }
    const services: keyable<tempServiceVar> = {}

    for (const [key, value] of Object.entries(labels)) {
        //search for tags
        const tagsParseResult = [...key.matchAll(/^service-(\d+)-tags$/g)][0]
        if (tagsParseResult?.length > 0) {
            const port = tagsParseResult[1]
            services[port] = services[port] || {}
            services[port].tags = value.split(',')
            services[port].name = services[port].name || defaultName
        }
        //search for service name
        const nameParseResult = [...key.matchAll(/^service-(\d+)-name$/g)][0]
        if (nameParseResult?.length > 0) {
            const port = nameParseResult[1]
            services[port] = services[port] || {}
            services[port].name = value
        }
    }

    const result: ServicePayload[] = []
    for (const [port, { tags, name }] of Object.entries(services)) {
        const publishedPort = networkMode === 'host'
            ? port
            : publicPortsMapping[port]

        if (!publishedPort) continue
        result.push({ port: Number(publishedPort), tags, name })
    }

    return result
}

export function mapContainerPortsToNodePorts(ports: Dockerode.Port[]): { [key: string]: string } {
    const mapping: { [key: string]: string } = {}
    for (let port of ports) {
        mapping[String(port.PrivatePort)] = String(port.PublicPort)
    }
    return mapping
}
