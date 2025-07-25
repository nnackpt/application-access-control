export interface AppsRoles {
    rolE_CODE?: string
    apP_CODE: string
    name: string
    desc?: string
    homE_URL?: string
    active?: boolean
    createD_BY?: string
    createD_DATETIME?: string
    updateD_BY?: string
    updateD_DATETIME?: string
    cM_APPLICATIONS?: {
        name: { apP_CODE: string; apP_NAME: string } | undefined
        apP_CODE: string
        apP_NAME: string
    } | undefined
    [key: string]: string | number | boolean | object | undefined
}