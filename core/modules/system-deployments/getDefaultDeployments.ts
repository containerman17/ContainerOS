import { REGISTRY_DOMAIN } from "../../config";
import { DeploymentUpdate } from "../../definitions";

export default async function (): Promise<DeploymentUpdate[]> {
    return [{
        name: "registry",
        scale: 1,
        namespace: 'system',
        containers: {
            "reg": {
                httpPorts: {
                    "5000": REGISTRY_DOMAIN,
                },
                memLimit: 1024 * 1024 * 1024 * 2,//2GB
                cpus: 1,
                env: [],
                image: "quay.io/containeros/registry:2",
            }
        }
    }]
}