import { AppsFunctions } from "@/types/AppsFunctions"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5070'

class AppsFunctionsApiService {
    private async fetchApi(url: string, options: RequestInit = {}) {
        const response = await fetch(`${API_BASE_URL}${url}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        })

        if (!response.ok) {
            throw new Error(`HTTP Error! status: ${response.status}`)
        }

        return response.json()
    }

    async getAppsFunctions(): Promise<AppsFunctions[]> {
        return this.fetchApi('/api/CmAppFunctions')
    }

    async createAppsFunctions(data: AppsFunctions): Promise<AppsFunctions> {
        return this.fetchApi('/api/CmAppFunctions', {
            method: 'POST',
            body: JSON.stringify(data),
        })
    }

    async updateAppsFunctions(funcCode: string, data: AppsFunctions): Promise<AppsFunctions> {
        return this.fetchApi(`/api/CmAppFunctions/${funcCode}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        })
    }

    async deleteAppsFunctions(funcCode: string): Promise<void> {
        return this.fetchApi(`/api/CmAppFunctions/${funcCode}`, {
            method: 'DELETE',
        })
    }
}

export const AppsfunctionsApi = new AppsFunctionsApiService()