import { Application } from "@/types/Application"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5070'

class ApplicationApiService {
    private async fetchWithAuth(url: string, options: RequestInit = {}) {
        const response = await fetch(`${API_BASE_URL}${url}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        })

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        return response.json()
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