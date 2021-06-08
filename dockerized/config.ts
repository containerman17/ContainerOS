const os = require('os');

export const OS_TYPE = os.type()

export const UNTOUCHABLE_CONTAINERS = ['/resilio']

export const POSSIBLE_OS_TYPES = {
    Linux: 'Linux',
    Darwin: 'Darwin',
    Windows_NT: 'Windows_NT'
}

export const IS_DEV = true
export const CONSUL_ENCRYPTION_KEY = "vBgJsqVuwFbAeYjgptEOf2kVIEmfuSLhslGj3Lqm03I=" //TODO just a placeholder
