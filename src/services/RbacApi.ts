import { Rbac } from "@/types/Rbac";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL_HTTPS || process.env.NEXT_PUBLIC_API_URL_HTTPS_LOCAL

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

    async createRbac(data: Rbac): Promise<Rbac> {
        return this.fetchRbacApi('/api/Rbac', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateRbac(rbaC_CODE: string, data: Rbac): Promise<Rbac> {
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