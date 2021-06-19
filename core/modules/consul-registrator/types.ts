export interface keyable<TypeName> {
    [key: string]: TypeName
}

export interface ServicePayload {
    name: string,
    tags: string[],
    port: number
}
