import { Application } from "@/types/Application"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL_HTTPS || process.env.NEXT_PUBLIC_API_URL_HTTPS_LOCAL

class ApplicationApiService {
    private async fetchWithAuth(url: string, options: RequestInit = {}) {
        const response = await fetch(`${API_BASE_URL}${url}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            credentials: "include",
            ...options,
        })

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        if (response.status === 204) return null
        const text = await response.text()
        if (!text) return null
        return JSON.parse(text)
    }

    async getApplications(): Promise<Application[]> {
        return this.fetchWithAuth('/api/CmApplications')
    }

    async createApplication(data: Application): Promise<Application> {
        return this.fetchWithAuth('/api/CmApplications', {
            method: 'POST',
            body: JSON.stringify(data),
        })
    }

    async updateApplication(appCode: string, data: Application): Promise<Application> {
        return this.fetchWithAuth(`/api/CmApplications/${appCode}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        })
    }

    async deleteApplication(appCode: string): Promise<void> {
        return this.fetchWithAuth(`/api/CmApplications/${appCode}`, {
            method: 'DELETE',
        })
    }
}

export const applicationApi = new ApplicationApiService()