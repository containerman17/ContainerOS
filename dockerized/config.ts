import os from "os"

export const OS_TYPE = os.type()

export const UNTOUCHABLE_CONTAINERS = ['/resilio', '/dockerized']

export const POSSIBLE_OS_TYPES = {
    Linux: 'Linux',
    Darwin: 'Darwin',
    Windows_NT: 'Windows_NT'
}

export const NODE_NAME = os.hostname()

export const IS_DEV = true
export const API_PASSWORD = 'dev'

export const CONSUL_ENCRYPTION_KEY = "vBgJsqVuwFbAeYjgptEOf2kVIEmfuSLhslGj3Lqm03I=" //TODO: just a placeholder
export const API_PORT = 8000;

export const DEPLOYMENT_MAX_SCALING = 5;
export const NODE_HEALTH_INTERVAL = 5000;