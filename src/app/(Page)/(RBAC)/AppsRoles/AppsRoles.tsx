"use client"

import AppsRolesCreateModal from "@/Components/AppRoles/AppsRolesCreateModal"
import AppsRolesEditModal from "@/Components/AppRoles/AppsRolesEditModal"
import AppsRolesTable from "@/Components/AppRoles/AppsRolesTable"
import { applicationApi } from "@/services/ApplicationApi"
import { AppsRolesApi } from "@/services/AppsRolesApi"
import { Application } from "@/types/Application"
import type { AppsRoles } from "@/types/AppsRoles"
import getValue from "@/Utils/getValue"
import { Calculator, ChevronDown, Download, Plus, Search } from "lucide-react"
import { useEffect, useState } from "react"

export default function AppsRoles() {
    const [refresh, setRefresh] = useState(0)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editRoles, setEditRoles] = useState<AppsRoles | null>(null)
    const [appsRoles, setAppsRoles] = useState<AppsRoles[]>([])
    const [loading, setLoading] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedTitle, setSelectedTitle] = useState("all")
    const [applicationTitle, setApplicationTitle] = useState<Record<string, string>>({})
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [editData, setEditData] = useState<AppsRoles | null>(null)

    // Function to handle search term change
    const handleExport = () => {
        try {
            const exportData = appsRoles.map(role => ({
                'APP Code': getValue(role, ['apP_CODE', 'appCode', 'app_code', 'AppCode', 'APP_CODE']) || '',
                'ROLE Code': getValue(role, ['rolE_CODE', 'roleCode', 'role_code', 'RoleCode', 'ROLE_CODE']) || '',
                'Name': getValue(role, ['name', 'Name', 'role_name', 'roleName']) || '',
                'Description': getValue(role, ['desc', 'description', 'Description']) || '',
                'Active': getValue(role, ['active', 'Active', 'is_active', 'isActive', 'status']) ? 'Yes' : 'No',
                'Home URL': getValue(role, ['homE_URL' ,'homeUrl', 'home_url', 'HomeUrl', 'HOME_URL']) || '',
                'Created By': getValue(role, ['createD_BY', 'createdBy', 'created_by', 'CreatedBy', 'CREATED_BY', 'creator']) || '',
                'Updated By': getValue(role, ['updateD_BY', 'updatedBy', 'updated_by', 'UpdatedBy', 'UPDATED_BY', 'modifier']) || '',
                'Updated Date': getValue(role, ['updateD_DATETIME', 'updatedDatetime', 'updated_datetime', 'updatedDate', 'updated_date']) || ''
            }))

            const headers = Object.keys(exportData[0] || {})
            const csvContent = [
                headers.join(','),
                ...exportData.map(row => headers.map(header => `"${(row as Record<string, any>)[header]}"`).join(','))
            ].join('\n')

            const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
            const link = document.createElement('a')
            const url = URL.createObjectURL(blob)
            link.setAttribute('href', url)
            link.setAttribute('download', `Application_Functions_${new Date().toISOString().split('T')[0]}.csv`)
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(url)
        } catch (error) {
            console.error("Error exporting data:", error)
            alert("Failed to export data. Please try again.")
        }
    }

    const handleOpenCreateModal = () => {
        setEditRoles(null)
        setIsModalOpen(true)
    }

    const handleEditRole = (role: AppsRoles) => {
        setEditRoles(role)
        setIsModalOpen(true)
    }

    const handleModalClose = () => {
        setIsModalOpen(false)
        setEditRoles(null)
    }

    const handleSuccess = () => {
        setIsModalOpen(false)
        setEditRoles(null)
        handleRefresh()
    }

    const handleRefresh = () => {
        setRefresh(prev => prev + 1)
    }

    // Fetch Apps and Roles data
    useEffect(() => {
        const fetchAppsAndRoles = async () => {
            setLoading(true)
            try {
                const [roleResponse, appResponse] = await Promise.all([
                    AppsRolesApi.getAppsRoles(),
                    applicationApi.getApplications()
                ])
                setAppsRoles(roleResponse)

                const TitlesMap: Record<string, string> = {}
                appResponse.forEach((app: Application) => {
                    const appCode = getValue(app, ['apP_CODE', 'appCode', 'app_code', 'AppCode', 'APP_CODE']) || ''
                    const appTitle = getValue(app, ['titLE', 'title']) || ''
                    if (appCode && appTitle) {
                        TitlesMap[appCode] = appTitle
                    }
                })
                setApplicationTitle(TitlesMap)

            } catch (error) {
                console.error("Error fetching Apps and Roles:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchAppsAndRoles()
    }, [refresh])

    // Calculate total, active, and inactive roles
    const totalRoles = appsRoles.length
    const activeRoles = appsRoles.filter(role => {
        const active = getValue(role, ['active', 'Active', 'is_active', 'isActive', 'status'])
        return active === true
    }).length
    const inactiveRoles = totalRoles - activeRoles

    // Get unique app titles and sort them
    const uniqueAppTitles = Array.from(new Set(appsRoles.map(role => {
        return getValue(role, ['apP_CODE', 'appCode', 'app_code', 'AppCode', 'APP_CODE'])
    }).filter(Boolean))) as (string | number)[]
    
    const sortedAppTitles = uniqueAppTitles.sort((a, b) => {
        const numA = parseFloat(String(a))
        const numB = parseFloat(String(b))

        if (!isNaN(numA) && !isNaN(numB)) {
            return numA - numB
        } else {
            return String(a).localeCompare(String(b))
        }
    })

    const getLastUpdated = () => {
        if (appsRoles.length === 0) return "No data available"

        const latestUpdate = appsRoles.reduce((latest, role) => {
          const updatedDate = getValue(role, ['updateD_DATETIME', 'updatedDatetime', 'updated_datetime', 'updatedDate', 'updated_date'])
          const createdDate = getValue(role, ['createD_DATETIME', 'createdDatetime', 'created_datetime', 'createdDate', 'created_date'])
          
          const roleDate = updatedDate || createdDate
          if (!roleDate) return latest

          const roleDateTime = new Date(roleDate).getTime()
          const latestDateTime = latest ? new Date(latest).getTime() : 0

          return roleDateTime > latestDateTime ? roleDate : latest
        }, null)

        if (!latestUpdate) return "No updates available"

        const today = new Date()
        const updateDate = new Date(latestUpdate)
        const diffTime = today.getTime() - updateDate.getTime()
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

        if (diffDays === 0) return 'Today'
        if (diffDays === 1) return 'Yesterday'
        if (diffDays < 7) return `${diffDays} days ago`

        return updateDate.toLocaleDateString('th-TH')
    }

    return (
        <main className="min-h-screen bg-gray-50">
            <div className="p-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                            <div className="flex space-x-3">

                                <div className="bg-[#005496] rounded-lg shadow-lg p-[3px]">
                                    <div className="bg-[#FBFCFD] rounded-lg p-[3px]">
                                        <div className="bg-[#009EE3] text-white px-4 py-2 rounded-lg flex items-center justify-center">
                                            <span>Application's Roles</span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setIsCreateModalOpen(true)}
                                    className="flex items-center space-x-2 bg-[#005496] text-white px-6 py-2 rounded-lg hover:bg-[#004080] transition-colors shadow-lg cursor-pointer"
                                >
                                    <Plus size={20} />
                                    <span>Create New Application's Role</span>
                                </button>

                                <button
                                    onClick={handleExport}
                                    className="flex items-center space-x-2 bg-gray-400 hover:bg-gray-500 text-white px-6 py-3 rounded-lg transition-colors shadow-lg cursor-pointer"
                                >
                                    <Download size={20} />
                                    <span>Export Application's Role</span>
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            <div className="relative">
                                <select 
                                    value={selectedTitle}
                                    onChange={(e) => setSelectedTitle(e.target.value)}
                                    className="cursor-pointer border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-[#005496] focus:border-[#005496] appearance-none outline-none"
                                >
                                    <option value="all">All Applications</option>
                                    {sortedAppTitles.map(appCode => (
                                        <option key={appCode} value={appCode.toString()}>
                                            {applicationTitle[appCode.toString()] || `Unknown App (${appCode})`}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                            </div>

                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                                <input 
                                    type="text" 
                                    placeholder="Search Roles..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005496] focus:border-[#005496] outline-none w-64"     
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* {Stats Cards} */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Roles</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {loading ? '...' : totalRoles}
                                </p>
                            </div>
                            <div className="p-3 bg-[#005496] bg-opacity-10 rounded-lg">
                                <Calculator className="text-[#005496]" size={20} />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Active Roles</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {loading ? '...' : activeRoles}
                                </p>
                            </div>
                            <div className="p-3 bg-green-100 rounded-lg">
                                <div className="w-5 h-5 bg-green-500 rounded-full animate-pulse"></div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Inactive Roles</p>
                                <p className="text-2xl font-bold text-red-600">
                                    {loading ? '...' : inactiveRoles}
                                </p>
                            </div>
                            <div className="p-3 bg-red-100 rounded-lg">
                                <div className="w-5 h-5 bg-red-500 rounded-full animate-pulse"></div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Last Updated</p>
                                <p className="text-lg font-semibold text-gray-900">
                                    {loading ? '...' : getLastUpdated()}
                                </p>
                            </div>
                            <div className="p-4 bg-blue-100 rounded-lg">
                                <div className="w-5 h-5 bg-blue-500 rounded-full animate-pulse"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <AppsRolesTable
                    refreshSignal={refresh}
                    onRefresh={handleRefresh}
                    searchTerm={searchTerm}
                    selectedTitle={selectedTitle}
                />

                <AppsRolesCreateModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    onSuccess={handleRefresh}
                />

                <AppsRolesEditModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    onSuccess={handleRefresh}
                    editData={editData!}
                />
            </div>
        </main>
    )
}