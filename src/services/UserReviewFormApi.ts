const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL_HTTPS || process.env.NEXT_PUBLIC_API_URL_HTTPS_LOCAL

export class UserReviewFormApi {
    private async fetchApi(url: string, options: RequestInit = {}) {
        const response = await fetch(`${API_BASE_URL}${url}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            credentials: "include",
            ...options
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
            throw new Error(`HTTPS Error! status: ${response.status}`)
        }

        return response
    }

    async downloadUserReviewForm(applicationName?: string, roleName?: string): Promise<Blob> {
        const params = new URLSearchParams()

        if (applicationName && applicationName !== "all") {
            params.set('applicationName', applicationName)
        }
        if (roleName && roleName !== "all") {
            params.set('roleName', roleName)
        }

        const url = `/api/UserReviewForm/download${params.toString() ? `?${params.toString()}` : ''}`

        const response = await this.fetchApi(url, {
            headers: {
                'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            }
        })

        return await response.blob()
    }

    async getFormOptions(): Promise<{ applications: string[], roles: string[] }> {
        const response = await this.fetchApi('/api/UserReviewForm/options')

        if (response.status === 204) return { applications: [], roles: [] }
        const text = await response.text()
        if (!text) return { applications: [], roles: [] }
        return JSON.parse(text)
    }
}

export const UserReviewFormService = new UserReviewFormApi()