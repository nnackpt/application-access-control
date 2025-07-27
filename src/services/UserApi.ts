import { FacilitySelectionDto, User, UsersAuthorizeCreateRequestDto, UsersAuthorizeUpdateRequestDto } from "@/types/User";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL_HTTPS || process.env.NEXT_PUBLIC_API_URL_HTTPS_LOCAL

export class UserAuthorizeApi {
    private async fetchUserApi(url: string, options: RequestInit = {}) {
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

        if (response.status === 204) return null
        const text = await response.text()
        if (!text) return null
        return JSON.parse(text)
    }

    async getUser(): Promise<User[]> {
        return this.fetchUserApi('/api/CmUserAuthorize')
    }

    async getUserByCode(autH_CODE: string): Promise<User> {
        return this.fetchUserApi(`/api/CmUserAuthorize/${autH_CODE}`)
    }

    async getUserByUserId(userId: string): Promise<User[]> {
        return this.fetchUserApi(`/api/CmUserAuthorize/user/${userId}`)
    }

    async getUserFacilitiesByAuthCode(authCode: string): Promise<User[]> {
        return this.fetchUserApi(`/api/CmUserAuthorize/${authCode}/facilities`)
    }

    async getUserFacilitiesByUserId(userId: string): Promise<FacilitySelectionDto[]> {
        return this.fetchUserApi(`/api/CmUserAuthorize/user/${userId}/facilities`)
    }

    async getAllAvailableFacilities(): Promise<FacilitySelectionDto[]> {
        return this.fetchUserApi(`/api/CmUserAuthorize/facilities/all`)
    }

    async getUserFacilitiesByUserIdAppCodeRoleCode(userId: string, appCode: string, roleCode: string): Promise<FacilitySelectionDto[]> {
        return this.fetchUserApi(`/api/CmUserAuthorize/user/${userId}/facilities/${appCode}/${roleCode}`)
    }

    async createUser(request: UsersAuthorizeCreateRequestDto): Promise<UsersAuthorizeCreateRequestDto[]> {
        return this.fetchUserApi('/api/CmUserAuthorize', {
            method: "POST",
            body: JSON.stringify(request)
        })
    }

    async updateUser(autH_CODE: string, request: UsersAuthorizeUpdateRequestDto): Promise<void> {
        return this.fetchUserApi(`/api/CmUserAuthorize/${autH_CODE}`, {
            method: "PUT",
            body: JSON.stringify(request)
        })
    }

    async deleteUser(autH_CODE: string): Promise<void> {
        return this.fetchUserApi(`/api/CmUserAuthorize/${autH_CODE}`, {
            method: "DELETE"
        })
    }

    async deleteUserByUserIdAppCodeRoleCode(userId: string, appCode: string, roleCode: string) {
        return this.fetchUserApi(`/api/CmUserAuthorize/DeleteByUserIdAppCodeRoleCode/${userId}/${appCode}/${roleCode}`, {
            method: "DELETE"
        })
    }
}

export const UserApi = new UserAuthorizeApi()