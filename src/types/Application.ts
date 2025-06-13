export interface Application {
    appCode: string
    name: string
    title: string
    desc?: string
    baseUrl?: string
    loginUrl?: string
    active: boolean
    createdBy?: string
    createdDatetime?: string
    updatedBy?: string
    updatedDatetime?: string
}