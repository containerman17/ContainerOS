import { REGISTRY_DOMAIN, REGISTRY_STORAGE_S3_REGION, REGISTRY_STORAGE_S3_ACCESSKEY, REGISTRY_STORAGE_S3_SECRETKEY, REGISTRY_STORAGE_S3_BUCKET, REGISTRY_STORAGE_S3_REGIONENDPOINT } from "../../config";
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
                env: [
                    `REGISTRY_STORAGE=s3`,
                    `REGISTRY_STORAGE_S3_ACCESSKEY=${REGISTRY_STORAGE_S3_ACCESSKEY}`,
                    `REGISTRY_STORAGE_S3_SECRETKEY=${REGISTRY_STORAGE_S3_SECRETKEY}`,
                    `REGISTRY_STORAGE_S3_BUCKET=${REGISTRY_STORAGE_S3_BUCKET}`,
                    `REGISTRY_STORAGE_S3_REGIONENDPOINT=${REGISTRY_STORAGE_S3_REGIONENDPOINT}`,
                    `REGISTRY_STORAGE_S3_REGION=${REGISTRY_STORAGE_S3_REGION}`,
                ],
                image: "quay.io/containeros/registry:2",
            }
        }
    }]
}