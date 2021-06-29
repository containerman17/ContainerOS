import os from "os"
import md5 from "md5"
import dotenv from "dotenv"
import fs from "fs"
dotenv.config()

export const OS_TYPE = os.type()

export const UNTOUCHABLE_CONTAINERS = ['/resilio', '/containeros']

export const POSSIBLE_OS_TYPES = {
    Linux: 'Linux',
    Darwin: 'Darwin',
    Windows_NT: 'Windows_NT'
}

export const NODE_NAME = os.hostname()

export const IS_DEV = true
export const API_PASSWORD = 'dev'

export const API_PORT = 8000;

export const DEPLOYMENT_MAX_SCALING = 5;
export const NODE_HEALTH_INTERVAL = 5000;

export const RAM_OVERBOOKING_RATE = 3;
export const CPU_OVERBOOKING_RATE = 3;

export const BOOTSTRAP_IPS = ["168.119.182.4"];

export const CONSUL_ENCRYPTION_KEY = Buffer.from(md5(md5(API_PASSWORD) + API_PASSWORD)).toString('base64')

export const IS_CONTROLLER = true
export const IS_WORKER = true
export const DEV_MODE = true
export const REGISTRY_DOMAIN = "reg.rd.dev.containeros.org"
export const REGISTRY_AUTH_DOMAIN = "reg-auth.rd.dev.containeros.org"
export const API_URL = "http://168.119.182.4:8000"

export const REGISTRY_STORAGE_S3_ACCESSKEY = process.env.REGISTRY_STORAGE_S3_ACCESSKEY
export const REGISTRY_STORAGE_S3_SECRETKEY = process.env.REGISTRY_STORAGE_S3_SECRETKEY
export const REGISTRY_STORAGE_S3_BUCKET = process.env.REGISTRY_STORAGE_S3_BUCKET
export const REGISTRY_STORAGE_S3_REGIONENDPOINT = process.env.REGISTRY_STORAGE_S3_REGIONENDPOINT
export const REGISTRY_STORAGE_S3_REGION = process.env.REGISTRY_STORAGE_S3_REGION
export const VERSION = fs.readFileSync(__dirname + "/../version.txt")