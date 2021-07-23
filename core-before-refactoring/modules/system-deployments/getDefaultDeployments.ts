import { VERSION, API_URL, REGISTRY_AUTH_DOMAIN, REGISTRY_DOMAIN, REGISTRY_STORAGE_S3_REGION, REGISTRY_STORAGE_S3_ACCESSKEY, REGISTRY_STORAGE_S3_SECRETKEY, REGISTRY_STORAGE_S3_BUCKET, REGISTRY_STORAGE_S3_REGIONENDPOINT } from "../../config";
import { DeploymentUpdate } from "../../definitions";

export default async function (): Promise<DeploymentUpdate[]> {
    return [{
        name: "registry-auth",
        scale: 1,
        project: 'system',
        containers: {
            "auth": {
                env: [
                    // "AUTH_DEBUG_LOG_ENABLED=1",
                    `AUTH_API_URL=${API_URL}`,
                ],
                httpPorts: {
                    "5001": REGISTRY_AUTH_DOMAIN,
                },
                memLimit: 1024 * 1024 * 1024 * 2,//2GB
                cpus: 1,
                image: "quay.io/containeros/auth-service:" + VERSION,
            }
        }
    }, {
        name: "registry",
        scale: 1,
        project: 'system',
        containers: {
            "reg": {
                httpPorts: {
                    "5000": REGISTRY_DOMAIN,
                },
                memLimit: 1024 * 1024 * 1024 * 2,//2GB
                cpus: 1,
                env: [
                    `REGISTRY_STORAGE_S3_ACCESSKEY=${REGISTRY_STORAGE_S3_ACCESSKEY}`,
                    `REGISTRY_STORAGE_S3_SECRETKEY=${REGISTRY_STORAGE_S3_SECRETKEY}`,
                    `REGISTRY_STORAGE_S3_BUCKET=${REGISTRY_STORAGE_S3_BUCKET}`,
                    `REGISTRY_STORAGE_S3_REGIONENDPOINT=${REGISTRY_STORAGE_S3_REGIONENDPOINT}`,
                    `REGISTRY_STORAGE_S3_REGION=${REGISTRY_STORAGE_S3_REGION}`,

                    `REGISTRY_AUTH_TOKEN_REALM=https://${REGISTRY_AUTH_DOMAIN}/auth`,
                ],
                image: "quay.io/containeros/registry:" + VERSION,
            }
        }
    }]
}