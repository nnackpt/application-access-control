export interface Rbac {
    cM_APPLICATIONS: any;
    cM_APPS_ROLES: any;
    cM_APPS_FUNCTIONS: any;
    rbaC_CODE: string;
    apP_CODE: string;
    rolE_CODE: string;
    funC_CODE: string;
    createD_BY?: string;
    createD_DATETIME?: string;
    updateD_BY?: string;
    updateD_DATETIME?: string;
}

export interface createRbac {
    APP_CODE: string;
    ROLE_CODE: string;
    FUNC_CODES: string[];
    CREATED_BY?: string;
}

export interface CreateRbacRequest {
    APP_CODE: string;
    ROLE_CODE: string;
    FUNC_CODES: string[];
    createD_BY?: string;
}