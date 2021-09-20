import { assert, object, size, map, number, record, string, array, boolean, optional, defaulted, refine, create, pattern } from 'superstruct'
import config from "../config"

export const validDNSName = pattern(string(), /^[a-z]{1}[a-z0-9-]{2,}$/)

export const AppWithTeam = object({
    name: validDNSName,
    team: validDNSName,
})

export const AppUpdate = object({
    image: size(string(), 3, 99),
    env: defaulted(array(string()), []),
    internetPort: optional(number()),
    internetDomain: optional(string()),
    scale: defaulted(number(), () => 1),
    hardCpuLimit: defaulted(number(), () => 1),
    hardMemoryLimit: defaulted(number(), () => 2000),
    name: validDNSName,
    team: validDNSName,
})

export const UserTokenUpdate = object({
    name: size(string(), 3, 99),
    tokenHash: size(string(), 64, 66),
})

export const UserTeamUpdate = object({
    team: validDNSName,
    name: size(string(), 3, 99),
})

export const ScaleCheck = refine(
    number(),
    'min 1, max ' + config.MAX_APP_SCALING,
    v => v >= 0 && v <= config.MAX_APP_SCALING
)
// export const namesArray = object({
//     names: array(validDNSName)
// })

// export const ContainerUpdate = object({
//     image: string(),
//     memLimit: defaulted(number(), 1000 * 1000 * 1000), //1GB
//     cpus: defaulted(number(), 1),
//     env: defaulted(array(string()), []),
//     httpPorts: defaulted(record(string(), string()), {}),
// })

// export const updateProject = object({
//     name: validDNSName,
//     token: size(string(), 5, 34)
// })

// export const MicroserviceUpdate = object({
//     name: validDNSName,
//     scale: defaulted(number(), () => 1),
//     containers: record(validDNSName, ContainerUpdate)
// })

// export const OnlyNameValidator = object({
//     name: validDNSName,
// })
