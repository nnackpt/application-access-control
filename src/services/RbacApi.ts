import { CreateRbacRequest, Rbac } from "@/types/Rbac";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL_HTTPS || process.env.NEXT_PUBLIC_API_URL_HTTPS_LOCAL

export interface RbacUpdateData {
    APP_CODE: string
    ROLE_CODE: string
    FUNC_CODES: string[];
    UPDATED_BY: string | null;
}

export class RbacApiService {
    private async fetchRbacApi(url: string, options: RequestInit = {}) {
        const response = await fetch(`${API_BASE_URL}${url}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            credentials: "include",
            ...options,
        });

        if (!response.ok) {
            let errorDetails = `HTTP Error! Status: ${response.status}`
            const errorBodyText = await response.text()
            try {
                const errorJson = JSON.parse(errorBodyText)
                errorDetails += `, Details: ${JSON.stringify(errorJson, null, 2)}`
            } catch (e) {
                // const errorText = await response.text()
                errorDetails += `, Raw Text: ${errorBodyText}`
            }
            console.error(errorDetails)
            throw new Error(`HTTP Error! status: ${response.status}`);
        }

        if (response.status === 204) return null;
        const text = await response.text();
        if (!text) return null;
        return JSON.parse(text);
    }

    async getRbac(): Promise<Rbac[]> {
        return this.fetchRbacApi('/api/Rbac')
    }

    async getRbacByCode(rbacCode: string): Promise<Rbac> {
        return this.fetchRbacApi(`/api/Rbac/${rbacCode}`)
    }

    async createRbac(data: CreateRbacRequest): Promise<Rbac> {
        return this.fetchRbacApi('/api/Rbac', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateRbac(rbaC_CODE: string, data: RbacUpdateData): Promise<Rbac> {
        return this.fetchRbacApi(`/api/Rbac/${rbaC_CODE}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        })
    }

    async deleteRbac(rbaC_CODE: string): Promise<void> {
        return this.fetchRbacApi(`/api/Rbac/${rbaC_CODE}`, {
            method: 'DELETE'
        })
    }

    async getAssignedFuncCodes(appCode: string, roleCode: string): Promise<string[]> {
        return this.fetchRbacApi(`/api/Rbac/assigned-functions/${appCode}/${roleCode}`);
    }
}

export const rbacApi = new RbacApiService();