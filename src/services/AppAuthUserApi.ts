import { User } from "@/types/User"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL_HTTPS || process.env.NEXT_PUBLIC_API_URL_HTTPS_LOCAL

export class AppAuthUsersApi {
    private async fetchAuthorizeUserApi(url: string, options: RequestInit = {}) {
        const response = await fetch(`${API_BASE_URL}${url}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            credentials: "include",
            ...options,
        })

        if (!response.ok) {
            let errorDetails = `HTTPS Error! Status: ${response.status}`
            const errorBodyText = await response.text()

            try {
                const errorJson = JSON.parse(errorBodyText)
                errorDetails += `, Details: ${JSON.stringify(errorJson, null, 2)}`
            } catch {
                errorDetails += `, Raw Text: ${errorBodyText}`
            }
            console.error(errorDetails)
            throw new Error(`HTTPS Error! Status: ${response.status}`)
        }

        if (response.status === 204) return null
        const text = await response.text()
        if (!text) return null
        return JSON.parse(text)
    }

    async getAuthUser(): Promise<User[]> {
        return this.fetchAuthorizeUserApi('/api/AuthUsers')
    }
}

export const AppAuthApi = new AppAuthUsersApi()