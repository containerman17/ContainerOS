import os from "os"
import md5 from "md5"
import dotenv from "dotenv"
import fs from "fs"
import path from "path"

dotenv.config({
    path: path.join(__dirname, '..', '.env')
})
dotenv.config({
    path: path.join(__dirname, '..', '..', '.env')
})

export const NODE_NAME = os.hostname()

export const IS_DEV = true
export const API_PASSWORD = process.env.API_PASSWORD

export const CLUSTER_API_PORT = 8000;
export const NODE_API_PORT = 3070;

export const DEPLOYMENT_MAX_SCALING = 5;
export const NODE_HEALTH_INTERVAL = 5000;

export const RAM_OVERBOOKING_RATE = 3;
export const CPU_OVERBOOKING_RATE = 3;

export const EXPECTED_CONTROLLER_IPS = process.env.EXPECTED_CONTROLLER_IPS.split(',')

export const CONSUL_ENCRYPTION_KEY = Buffer.from(md5(md5(API_PASSWORD) + API_PASSWORD)).toString('base64')

export const IS_CONTROLLER = true
export const IS_WORKER = true
export const DEV_MODE = true
export const SYSTEM_WILDCARD_DOMAIN = process.env.SYSTEM_WILDCARD_DOMAIN
export const REGISTRY_DOMAIN = `reg.${SYSTEM_WILDCARD_DOMAIN}`
export const REGISTRY_AUTH_DOMAIN = `reg-auth.${SYSTEM_WILDCARD_DOMAIN}`
export const API_URL = `http://api.${SYSTEM_WILDCARD_DOMAIN}:8000`

export const REGISTRY_STORAGE_S3_ACCESSKEY = process.env.REGISTRY_STORAGE_S3_ACCESSKEY
export const REGISTRY_STORAGE_S3_SECRETKEY = process.env.REGISTRY_STORAGE_S3_SECRETKEY
export const REGISTRY_STORAGE_S3_BUCKET = process.env.REGISTRY_STORAGE_S3_BUCKET
export const REGISTRY_STORAGE_S3_REGIONENDPOINT = process.env.REGISTRY_STORAGE_S3_REGIONENDPOINT
export const REGISTRY_STORAGE_S3_REGION = process.env.REGISTRY_STORAGE_S3_REGION
export const VERSION = fs.readFileSync(__dirname + "/../../version.txt")