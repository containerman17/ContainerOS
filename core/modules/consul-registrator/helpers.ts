import Dockerode from "dockerode";
import { keyable, ServicePayload } from "./types";

export function parseLables(
    labels: keyable<string>,
    defaultName: string,
    publicPortsMapping: { [key: string]: string }): ServicePayload[] {

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
        const publishedPort = publicPortsMapping[port]
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

if (require.main === module) {
    const result = parseLabels({
        'com.docker.compose.config-hash': 'eb0a95d84700eeec3486d35ff8a882ce7f2044998088f22299fc5f953cc28904',
        'com.docker.compose.container-number': '1',
        'com.docker.compose.oneoff': 'False',
        'com.docker.compose.project': 'tmp',
        'com.docker.compose.project.config_files': 'docker-compose.yaml',
        'com.docker.compose.project.working_dir': '/tmp',
        'com.docker.compose.service': 'registry-5hh7q-nginx',
        'com.docker.compose.version': '1.25.0',
        'dockerized-pod': 'registry-5hh7q',
        maintainer: 'Bitnami <containers@bitnami.com>',
        'service-80-name': 'registry-nginx',
        'service-80-tags': 'routerDomain-nginx.rd.dev.containeros.org,hello-world'
    }, 'registry-5hh7q-nginx')
    console.log()
}