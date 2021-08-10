import shortHash from "short-hash"

export default function (microserviceName: string, containerName: string, port: number): string {
    const hash = shortHash(`${microserviceName}//${containerName}//${port}`)
    return `${microserviceName}-${containerName}-${port}-${hash}`
}