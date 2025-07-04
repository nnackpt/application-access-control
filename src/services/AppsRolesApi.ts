import { AppsRoles } from "@/types/AppsRoles"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5070'

class AppsRolesApiService {
    private async fetchApi(url: string, options: RequestInit = {}) {
        const response = await fetch(`${API_BASE_URL}${url}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            credentials: "include",
            ...options,
        })

        if (!response.ok) {
            throw new Error(`HTTP Error! status: ${response.status}`)
        }

        if (response.status === 204) return null
        const text = await response.text()
        if (!text) return null
        return JSON.parse(text)
    }

    async getAppsRoles(): Promise<AppsRoles[]> {
        return this.fetchApi('/api/CmAppRoles')
    }

    async createAppsRoles(data: AppsRoles): Promise<AppsRoles> {
        return this.fetchApi('/api/CmAppRoles', {
            method: 'POST',
            body: JSON.stringify(data),
        })
    }

    async updateAppsRoles(rolE_CODE: string, data: AppsRoles): Promise<AppsRoles> {
        return this.fetchApi(`/api/CmAppRoles/${rolE_CODE}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        })
    }

    async deleteAppsRoles(rolE_CODE: string): Promise<void> {
        return this.fetchApi(`/api/CmAppRoles/${rolE_CODE}`, {
            method: 'DELETE',
        })
    }
}

export const AppsRolesApi = new AppsRolesApiService()