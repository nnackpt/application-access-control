import { Application } from "./Application";
import { AppsFunctions } from "./AppsFunctions";
import { AppsRoles } from "./AppsRoles";

export interface Rbac {
    cM_APPLICATIONS: Application;
    cM_APPS_ROLES: AppsRoles;
    cM_APPS_FUNCTIONS: AppsFunctions;
    rbaC_CODE: string;
    apP_CODE: string;
    rolE_CODE: string;
    funC_CODE: string;
    createD_BY?: string;
    createD_DATETIME?: string;
    updateD_BY?: string;
    updateD_DATETIME?: string;
    [key: string]: string | number | boolean | object | undefined
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