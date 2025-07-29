import { applicationApi } from "@/services/ApplicationApi"
import { AppsRolesApi } from "@/services/AppsRolesApi"
import { UserApi } from "@/services/UserApi"
import { Application } from "@/types/Application"
import { AppsRoles } from "@/types/AppsRoles"
import { User } from "@/types/User"

import getValue from "@/Utils/getValue"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import toast, { Toaster } from "react-hot-toast"
import Skeleton from "react-loading-skeleton"
import RowsPerPageSelect from "../UI/Select/RowsPerPageSelect"
import Pagination from "../UI/Pagination"
import formatDateTime from "@/Utils/formatDateTime"
import { Edit, Eye, Trash2 } from "lucide-react"
import DeleteConfirmModal from "../UI/DeleteConfirmModal"

interface UserTableProps {
    refreshSignal: number
    onRefresh: () => void
    searchTerm: string
    selectedTitle: string
    selectedRole: string
}

export default function UsersTable({ refreshSignal, onRefresh, searchTerm, selectedTitle, selectedRole }: UserTableProps) {
    const [data, setData] = useState<User[]>([])
    const [loading, setLoading] = useState(false)
    const [applications, setApplications] = useState<Application[]>([])
    const [roles, setRoles] = useState<AppsRoles[]>([])
    const [deleteLoading, setDeleteLoading] = useState<string | null>(null)
    const [deleteModal, setDeleteModal] = useState<{ user: User | null, open: boolean}>({ user: null, open: false })
    const [deleteSuccess, setDeleteSuccess] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(10)
    const router = useRouter()
    
    const getPaginatedData = () => {
        const startIndex = (currentPage - 1) * rowsPerPage
        const endIndex = startIndex + rowsPerPage
        return rowsPerPage === 0 ? filteredData : filteredData.slice(startIndex, endIndex)
    }

    const getTotalPages = () => {
        return rowsPerPage === 0 ? 1 : Math.ceil(filteredData.length / rowsPerPage)
    }

    const getDisplayInfo = () => {
        if (filteredData.length === 0) return "Showing 0 of 0 Records"

        if (rowsPerPage === 0) {
            return `Showing 1 to ${filteredData.length} of ${filteredData.length} Records`
        }

        const startIndex = (currentPage - 1) * rowsPerPage + 1
        const endIndex = Math.min(currentPage * rowsPerPage, filteredData.length)
        return `Showing ${startIndex} to ${endIndex} of ${filteredData.length} Records`
    }

    const handleRowsPerPageChange = (value: number) => {
        setRowsPerPage(value)
        setCurrentPage(1)
    }

    useEffect(() => {
        setCurrentPage(1)
    }, [searchTerm, selectedTitle, selectedRole])

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            try {
                const response = await UserApi.getUser()
                const apps = await applicationApi.getApplications()
                const roles = await AppsRolesApi.getAppsRoles()
                setApplications(apps)
                setRoles(roles)

                const uniqueUsersMap = new Map<string, User>()
                response.forEach(user => {
                    const userId = user.userid || ''
                    const appCode = user.apP_CODE || ''
                    const roleCode = user.rolE_CODE || ''
                    const uniqueKey = `${userId}-${appCode}-${roleCode}`
                    
                    if (!uniqueUsersMap.has(uniqueKey)) {
                        uniqueUsersMap.set(uniqueKey, user)
                    }
                })

                setData(Array.from(uniqueUsersMap.values()))
                
                console.log("API Response:", response)
                console.log("First item:", response[0])
            } catch (err) {
                console.error("Error fetching User Data:", err)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [refreshSignal])

    const getAppName = (userItem: User) => {
        const appCode = userItem.apP_CODE || ''
        let appName = ''

        if (userItem.cM_APPLICATIONS && userItem.cM_APPLICATIONS.apP_NAME) {
            appName = userItem.cM_APPLICATIONS.apP_NAME
        } else if (userItem.cM_APPS_ROLES?.cM_APPLICATIONS?.apP_NAME) {
            appName = userItem.cM_APPS_ROLES.cM_APPLICATIONS.apP_NAME
        } else if (applications && userItem.apP_CODE) {
            const app = applications.find(app => app.apP_CODE === userItem.apP_CODE)
            if (app) appName = app.name
        }

        return appName ? `${appCode} - ${appName}` : appCode || '-'
    }

    const getRoleName = (user: User) => {
        if (user.cM_APPS_ROLES && user.cM_APPS_ROLES.name) return user.cM_APPS_ROLES.name
        if (roles && user.rolE_CODE && user.apP_CODE) {
            const role = roles.find(role => role.rolE_CODE === user.rolE_CODE && role.apP_CODE === user.apP_CODE)
            if (role) return role.name
        }
    }

    const getFullName = (fname: string | undefined, lname: string | undefined): string => {
        const firstName = fname ? fname.charAt(0).toUpperCase() + fname.slice(1).toLowerCase() : ''
        const lastName = lname ? lname.charAt(0).toUpperCase() + lname.slice(1).toLowerCase() : ''
        return `${firstName} ${lastName}`.trim()
    }

    useEffect(() => {
        const fetchMeta = async () => {
            setApplications(await applicationApi.getApplications() || [])
            setRoles(await AppsRolesApi.getAppsRoles() || [])
        }
        fetchMeta()
    }, [])

    const filteredData = data.filter(user => {
        const appCode = getValue(user, ['apP_CODE']) || ''
        const appName = getAppName(user) || ''
        const roleCode = getValue(user, ['rolE_CODE']) || ''
        const roleName = getRoleName(user) || ''
        const userId = getValue(user, ['userid']) || ''
        const fname = getValue(user, ['fname']) || ''
        const lname = getValue(user, ['lname']) || ''
        const org = getValue(user, ['org']) || ''
        const createdBy = getValue(user, ['createD_BY']) || ''
        const updatedBy = getValue(user, ['updateD_BY']) || ''

        const matchesSearchTerm = searchTerm.toLowerCase()
        const appCodeMatches = selectedTitle === "all" || appCode.toLowerCase() === selectedTitle.toLowerCase()
        const roleCodeMatches = selectedRole === "all" || roleCode.toLowerCase() === selectedRole.toLowerCase()

        const textMatches = (
            appCode.toLowerCase().includes(matchesSearchTerm) ||
            appName.toLowerCase().includes(matchesSearchTerm) ||
            roleCode.toLowerCase().includes(matchesSearchTerm) ||
            roleName.toLowerCase().includes(matchesSearchTerm) ||
            userId.toLowerCase().includes(matchesSearchTerm) ||
            fname.toLowerCase().includes(matchesSearchTerm) ||
            lname.toLowerCase().includes(matchesSearchTerm) ||
            org.toLowerCase().includes(matchesSearchTerm) ||
            createdBy.toLowerCase().includes(matchesSearchTerm) ||
            updatedBy.toLowerCase().includes(matchesSearchTerm)
        )

        return appCodeMatches && roleCodeMatches && textMatches
    })

    const handleView = (user: User) => {
        const userId = getValue(user, ['userid'])
        console.log("userId from user in UsersTable:", userId)

        if (userId) {
            const params = new URLSearchParams()
            if (selectedTitle !== "all") params.set('app', selectedTitle)
            if (selectedRole !== "all") params.set('role', selectedRole)
            if (searchTerm.trim()) params.set('search', searchTerm)

            const queryString = params.toString()
            const url = queryString ? `/Users/View/${userId}?${queryString}` : `/Users/View/${userId}`
            console.log("Navigating to URL:", url)

            router.push(url)
        } else {
            console.warn("userId is missing for user:", user)
        }
    }

    const handleEdit = (user: User) => {
        const authCode = getValue(user, ['autH_CODE'])
        const userId = getValue(user, ['userid'])
        const appCode = getValue(user, ['apP_CODE'])
        const roleCode = getValue(user, ['rolE_CODE'])

        if (authCode && userId && appCode && roleCode) {
            const params = new URLSearchParams()
            params.set('userid', userId)
            params.set('appCode', appCode)
            params.set('roleCode', roleCode)
            params.set('authCode', authCode)

            params.set('fname', getValue(user, ['fname']) || '')
            params.set('lname', getValue(user, ['lname']) || '')
            params.set('org', getValue(user, ['org']) || '')
            params.set('active', (getValue(user, ['org']) || false).toString())

            if (Array.isArray(user.facilities) && user.facilities.length > 0) {
                params.set('facilities', JSON.stringify(user.facilities))
            }

            const queryString = params.toString()
            const url = `/Users/Create?${queryString}`;
            
            console.log("Navigating to Edit URL:", url);
            router.push(url);
        } else {
            toast.error("Missing authorization code for user.");
            console.warn("Missing details for users", user)
        }
    }

    const handleDelete = (user: User) => {
        setDeleteModal({ user: user, open: true })
    }

    const confirmDelete = async () => {
        if (!deleteModal.user) return
        const user = deleteModal.user
        const userId = getValue(user, ['userid'])
        const appCode = getValue(user, ['apP_CODE'])
        const roleCode = getValue(user, ['rolE_CODE'])

        if (!userId || !appCode || !roleCode) {
            toast.error("Missing required user information")
            return
        }

        setDeleteLoading(`${userId}-${appCode}-${roleCode}`)
        try {
            console.log("Deleting user with userId, appCode, roleCode:", userId, appCode, roleCode)
            await UserApi.deleteUserByUserIdAppCodeRoleCode(userId, appCode, roleCode)
            setDeleteModal({ user: null, open: false })
            toast.success("User deleted successfully")
            setDeleteSuccess(true)
            onRefresh()
        } catch (err) {
            toast.error("Error deleting User")
            console.error("Error deleting user:", err)
        } finally {
            setDeleteLoading(null)
        }
    }

    if (loading) {
        return (
            <div className="space-y-3">
                {[...Array(10)].map((_, i) => (
                    <Skeleton key={i} height={40} borderRadius={8} />
                ))}
            </div>
        )
    }

    return (
        <>
            <Toaster 
                position="bottom-center"
                reverseOrder={false}
            />
            <div className="bg-white rounded-lg p-4 mb-4 shadow-sm border border-gray-200">
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">Display</span>
                            <RowsPerPageSelect 
                                rowsPerPage={rowsPerPage}
                                setRowsPerPage={handleRowsPerPageChange}
                                isLoading={loading}
                            />
                            <span className="text-sm text-gray-600">Records</span>
                        </div>
                        <div className="text-sm text-gray-600">
                            {getDisplayInfo()}
                        </div>
                    </div>

                    {/* Pagination BTN */}
                    {rowsPerPage > 0 && getTotalPages() > 1 && (
                        <Pagination 
                            currentPage={currentPage}
                            totalPages={getTotalPages()}
                            onPageChange={setCurrentPage}
                        />
                    )}
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                {/* Desktop View */}
                <div className="hidden xl:block">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-[var(--primary-color)] text-white">
                                <tr>
                                    {['Application', 'Role', 'User ID', 'Name', 'Organization',
                                        'Created By', 'Create Date', 'Updated By', 'Updated Date', 'Actions'
                                    ].map(header => (
                                        <th key={header} className="px-3 py-3 text-left text-sm font-semibold whitespace-nowrap">
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {/* Table Rows */}
                                {getPaginatedData().map((user, index) => {
                                    const appCode = getValue(user, ['apP_CODE']) || ''
                                    const roleCode = getValue(user, ['rolE_CODE']) || ''
                                    const userId = getValue(user, ['userid']) || ''
                                    // const authCode = getValue(user, ['autH_CODE']) || ''
                                    
                                    const uniqueKey = `${userId}-${appCode}-${roleCode}-${index}`

                                    const appName = getAppName(user) || ''
                                    const roleName = getRoleName(user) || ''
                                    const fname = getValue(user, ['fname']) || ''
                                    const lname = getValue(user, ['lname']) || ''
                                    const fullName = getFullName(fname, lname)
                                    const org = getValue(user, ['org']) || ''
                                    const createdBy = getValue(user, ['createD_BY']) || ''
                                    const createdDate = getValue(user, ['createD_DATETIME']) || ''
                                    const updatedBy = getValue(user, ['updateD_BY']) || ''
                                    const updatedDate = getValue(user, ['updateD_DATETIME']) || ''
                                    // const authCode = getValue(user, ['autH_CODE'])

                                    return (
                                        <tr key={uniqueKey} className="border-b border-gray-200 hover:bg-blue-50 transition-colors">
                                            <td className="px-3 py-3 font-medium text-[var(--primary-color)] text-sm">{appName || '-'}</td>
                                            <td className="px-3 py-3 text-sm">{roleName || '-'}</td>
                                            <td className="px-3 py-3 text-sm">{userId || '-'}</td>
                                            {/* <td className="px-3 py-3 text-sm">{fname || '-'}</td>
                                            <td className="px-3 py-3 text-sm">{lname || '-'}</td> */}
                                            <td className="px-3 py-3 text-sm">{fullName || '-'}</td>
                                            <td className="px-3 py-3 text-sm">{org || '-'}</td>
                                            <td className="px-3 py-3 text-sm">{createdBy || '-'}</td>
                                            <td className="px-3 py-3 whitespace-nowrap text-sm">
                                                {formatDateTime(createdDate)}
                                            </td>
                                            <td className="px-3 py-3 text-sm">{updatedBy || '-'}</td>
                                            <td className="px-3 py-3 whitespace-nowrap text-sm">
                                                {formatDateTime(updatedDate)}
                                            </td>
                                            <td className="px-3 py-3">
                                                <div className="flex space-x-1">
                                                    <button
                                                        onClick={() => handleView(user)}
                                                        className="cursor-pointer flex items-center justify-center w-8 h-8 rounded-full border-3 border-gray-300 bg-transparent 
                                                                text-[var(--primary-color)] hover:border-[var(--primary-color)] hover:bg-blue-50 hover:text-[var(--primary-color-dark)] transform hover:scale-110 
                                                                transition-all duration-200"
                                                        title="View Details"
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEdit(user)}
                                                        className="cursor-pointer flex items-center justify-center w-8 h-8 rounded-full border-3 border-gray-300 bg-transparent
                                                                    text-green-600 hover:border-green-800 hover:bg-glue-50 hover:text-green-800 transform hover:scale-110
                                                                    transition-all duration-200"
                                                        title="Edit"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(user)}
                                                        className="cursor-pointer flex items-center justify-center w-8 h-8 rounded-full border-3 border-gray-300 bg-transparent
                                                                    text-red-600 hover:border-red-800 hover:bg-blue-50 hover:text-red-800 disabled:opacity-50 transform
                                                                    hover:scale-110 transition-all duration-200"
                                                        title="Delete"
                                                        disabled={deleteLoading === `${userId}-${getValue(user, ['apP_CODE'])}-${getValue(user, ['rolE_CODE'])}`}
                                                    >
                                                        {deleteLoading === `${userId}-${getValue(user, ['apP_CODE'])}-${getValue(user, ['rolE_CODE'])}` ? (
                                                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600"></div>
                                                        ) : (
                                                            <Trash2 size={16} />
                                                        )}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {filteredData.length === 0 && !loading && (
                    <div className="text-center py-12 text-gray-500">
                        <div className="text-gray-400 mb-2">
                            <Eye size={48} className="mx-auto" />
                        </div>
                        <p>{searchTerm || selectedTitle !== "all" ? `No users found matching your criteria` : 'No users found'}</p>
                    </div>
                )}
            </div>

            <DeleteConfirmModal 
                isOpen={deleteModal.open}
                onClose={() => setDeleteModal({ user: null, open: false })}
                onConfirm={confirmDelete}
                appName={deleteModal.user ? getValue(deleteModal.user, ['userid']) || '' : ''}
                loading={!!deleteLoading}
            />

            {deleteSuccess && (
                <Toaster
                    position="bottom-center"
                    reverseOrder={false}
                />
            )}
        </>
    )

}