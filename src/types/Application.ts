export interface Application {
    // APP_Code: string
    apP_CODE: string
    apP_NAME?: string
    name: string
    title: string
    desc?: string
    basE_URL?: string
    logiN_URL?: string
    active: boolean
    createD_BY?: string
    createD_DATETIME?: string
    updateD_BY?: string
    updateD_DATETIME?: string
    [key: string]: string | number | boolean | undefined
}