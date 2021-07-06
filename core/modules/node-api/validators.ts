import { assert, object, size, map, number, record, string, array, boolean, optional, defaulted, refine, create, pattern } from 'superstruct'

export const validName = pattern(string(), /^[a-z]{1}[a-z0-9-]{2,}$/)

export const getContainerLogsValidator = object({
    name: validName,
})

export const getPodLogsValidator = getContainerLogsValidator