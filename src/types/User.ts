import { Application } from "./Application"
import { AppsRoles } from "./AppsRoles"

export interface User {
    autH_CODE: string
    rolE_CODE: string
    apP_CODE: string
    sitE_CODE: string
    domaiN_CODE: string
    facT_CODE: string
    userid: string
    fname: string
    lname: string
    org: string
    active: boolean
    createD_BY?: string
    createD_DATETIME?: string
    updateD_BY?: string
    updateD_DATETIME?: string

    cM_APPLICATIONS?: Application
    cM_APPS_ROLES?: AppsRoles
    [key: string]: string | number | boolean | object | undefined
}

export interface UsersAuthorizeCreateRequestDto {
    apP_CODE: string
    rolE_CODE: string
    userid: string
    facilities: {
        sitE_CODE: string
        domaiN_CODE: string
        facT_CODE: string
    }[]
    fname?: string
    lname?: string
    org?: string
    active?: boolean
}

export interface UsersAuthorizeCreateResponseDto {
    autH_CODE: string
    apP_CODE: string
    rolE_CODE: string
    userid: string
    sitE_CODE: string
    domaiN_CODE: string
    facT_CODE: string
    active: boolean
}

export interface UsersAuthorizeUpdateRequestDto {
    rolE_CODE?: string
    fname?: string
    lname?: string
    org?: string
    active?: boolean
}