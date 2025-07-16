"use client"

import { AppsRolesApi } from "@/services/AppsRolesApi"
import { AppsRoles } from "@/types/AppsRoles"
import { Application } from "@/types/Application"
import { rbacApi } from "@/services/RbacApi"
import { Rbac } from "@/types/Rbac"
import { applicationApi } from "@/services/ApplicationApi"
import getValue from "@/Utils/getValue"
import { useEffect, useState } from "react"
import { Calculator, ChevronDown, Download, Plus, Search } from "lucide-react"
import RbacTable from "@/Components/RBAC/RbacTable"
import RbacCreateModal from "@/Components/RBAC/RbacCreateModal"
import AppTitleSelect from "@/Components/UI/Select/AppTitleSelect"
import { motion } from "framer-motion" // Import motion from framer-motion
import StatsCard from "@/Components/UI/StatsCard"
import RoleTitleSelect from "@/Components/UI/Select/RoleTitleSelect"
import 'react-loading-skeleton/dist/skeleton.css'
import Skeleton from 'react-loading-skeleton'

export default function RBAC() {
    const [refresh, setRefresh] = useState(0)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editRbac, setEditRbac] = useState<Rbac | null>(null)
    const [rbac, setRbac] = useState<Rbac[]>([])
    const [loading, setLoading] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedTitle, setSelectedTitle] = useState("all")
    const [applicationTitle, setApplicationTitle] = useState<Record<string, string>>({})
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [editData, setEditData] = useState<Rbac | null>(null)
    const [applications, setApplications] = useState<Application[]>([])
    const [roles, setRoles] = useState<AppsRoles[]>([])
    const [selectedRole, setSelectedRole] = useState("all")

    const handleExport = () => {
        try {
            const exportData = rbac.map(rbac => ({
                'RBAC Code': getValue(rbac, ['rbaC_CODE']) || '',
                'APP Code': getValue(rbac, ['apP_CODE']) || '',
                'Application Name': getAppName(rbac) || '',
                'ROLE Code': getValue(rbac, ['rolE_CODE']) || '',
                'Role Name': getRoleName(rbac) || '',
                'FUNC Code': getValue(rbac, ['funC_CODE']) || '',
                'Created By': getValue(rbac, ['createD_BY']) || '',
                'Created Date': getValue(rbac, ['createD_DATETIME']) || '',
                'Updated By': getValue(rbac, ['updateD_BY']) || '',
                'Updated Date': getValue(rbac, ['updateD_DATETIME']) || ''
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
            link.setAttribute('download', `Application_RBAC_${new Date().toISOString().split('T')[0]}.csv`)
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(url)
        } catch (error) {
            console.error("Error exporting data:", error)
            alert("Failed to export data. Please try again.")
        }
    }

    const getAppName = (rbac: any) => {
        if (rbac.cM_APPLICATIONS && rbac.cM_APPLICATIONS.name) return rbac.cM_APPLICATIONS.name
        if (rbac.cM_APPS_ROLES && rbac.cM_APPS_ROLES.cM_APPLICATIONS && rbac.cM_APPS_ROLES.cM_APPLICATIONS.name) {
            return rbac.cM_APPS_ROLES.cM_APPLICATIONS.name
        }
        if (applications && rbac.apP_CODE) {
            const app = applications.find(app => app.apP_CODE === rbac.apP_CODE)
            if (app) return app.name
        }
        return ""
    }

    const getRoleName = (rbac: any) => {
        if (rbac.cM_APPS_ROLES && rbac.cM_APPS_ROLES.name) return rbac.cM_APPS_ROLES.name;
        // @ts-ignore
        if (roles && rbac.rolE_CODE && rbac.apP_CODE) {
            const role = roles.find(role => role.rolE_CODE === rbac.rolE_CODE && role.apP_CODE === rbac.apP_CODE);
            if (role) return role.name;
        }
        return "";
    };

    const handleOpenCreateModal = () => {
        setEditRbac(null)
        setIsModalOpen(true)
    }

    const handleEditRole = (role: Rbac) => {
        setEditRbac(role)
        setIsModalOpen(true)
    }

    const handleModalClose = () => {
        setIsModalOpen(false)
        setEditRbac(null)
    }

    const handleSuccess = () => {
        setIsModalOpen(false)
        setEditRbac(null)
        handleRefresh()
    }

    const handleRefresh = () => {
        setRefresh(prev => prev + 1)
    }

    useEffect(() => {
        const fetchAppsAndRoles = async () => {
            setLoading(true)
            try {
                const [roleResponse, appResponse, appsRolesResponse] = await Promise.all([
                    rbacApi.getRbac(),
                    applicationApi.getApplications(),
                    AppsRolesApi.getAppsRoles()
                ])
                setApplications(appResponse)
                setRbac(roleResponse)

                const TitlesMap: Record<string, string> = {}
                appResponse.forEach((app: Application) => {
                    const appCode = getValue(app, ['apP_CODE', 'appCode', 'app_code', 'AppCode', 'APP_CODE']) || ''
                    const appTitle = getValue(app, ['titLE', 'title']) || ''
                    if (appCode && appTitle) {
                        TitlesMap[appCode] = appTitle
                    }
                })
                setApplicationTitle(TitlesMap)
                setRoles(appsRolesResponse)

            } catch (error) {
                console.error("Error fetching Apps and Roles:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchAppsAndRoles()
    }, [refresh])

    const totalRbac = rbac.length
    const activeRbac = rbac.filter(rbac => {
        const active = getValue(rbac, ['active', 'Active', 'is_active', 'isActive', 'status'])
        return active === true
    }).length
    const inactiveRbac = totalRbac - activeRbac

    const getLastUpdated = () => {
        if (rbac.length === 0) return "No data available"

        const latestUpdate = rbac.reduce((latest, rbac) => {
            const updatedDate = getValue(rbac, ['updateD_DATETIME', 'updatedDatetime', 'updated_datetime', 'updatedDate', 'updated_date'])
            const createdDate = getValue(rbac, ['createD_DATETIME', 'createdDatetime', 'created_datetime', 'createdDate', 'created_date'])

            const rbacDate = updatedDate || createdDate
            if (!rbacDate) return latest

            const rbacDateTime = new Date(rbacDate).getTime()
            const latestDateTime = latest ? new Date(latest).getTime() : 0

            return rbacDateTime > latestDateTime ? rbacDate : latest
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
        <main className="min-h-screen">
            <div className="p-8">
                {/* Header */}
                <div className="mb-8">
                    {loading ? (
                        <div className="flex justify-between items-center">
                            {/* Skeleton ฝั่งซ้าย */}
                            <div className="flex space-x-3">
                            <Skeleton height={40} width={180} borderRadius={8} />
                            <Skeleton height={40} width={240} borderRadius={8} />
                            <Skeleton height={40} width={220} borderRadius={8} />
                            </div>
            
                            {/* Skeleton Search */}
                            <div className="flex items-center space-x-3">
                                <Skeleton height={40} width={180} borderRadius={8} />
                                <Skeleton height={40} width={240} borderRadius={8} />
                            </div>
                        </div>
                    ) : (
                        <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                            <div className="flex space-x-3">

                                <div className="bg-[#005496] rounded-lg shadow-lg p-[3px]">
                                    <div className="bg-[#FBFCFD] rounded-lg p-[3px]">
                                        <div className="bg-[#009EE3] text-white px-4 py-2 rounded-lg flex items-center justify-center">
                                            <span>RBAC: Role Base Access Control</span>
                                        </div>
                                    </div>
                                </div>

                                <motion.button
                                    onClick={() => setIsCreateModalOpen(true)}
                                    className="flex items-center space-x-2 bg-[#005496] text-white px-6 py-2 rounded-lg
                                            shadow-lg cursor-pointer"
                                    whileHover={{ scale: 1.05, backgroundColor: "#004080", boxShadow: "0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)" }}
                                    whileTap={{ scale: 0.98 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                >
                                    <Plus size={20} />
                                    <span>Create New Application's RBAC</span>
                                </motion.button>

                                <motion.button
                                    onClick={handleExport}
                                    className="flex items-center space-x-2 bg-gray-400 text-white px-6 py-2 rounded-lg
                                            shadow-lg cursor-pointer"
                                    whileHover={{ scale: 1.05, backgroundColor: "#6B7280", boxShadow: "0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)" }}
                                    whileTap={{ scale: 0.98 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                >
                                    <Download size={20} />
                                    <span>Export Application's RBAC</span>
                                </motion.button>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search RBAC..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005496] focus:border-[#005496] outline-none w-64"
                                />
                            </div>
                            
                            <div className="flex flex-col space-y-4 ml-4">
                                <AppTitleSelect
                                    selectedTitle={selectedTitle}
                                    setSelectedTitle={setSelectedTitle}
                                    applications={applications}
                                />

                                <RoleTitleSelect
                                    selectedRole={selectedRole}
                                    setSelectedRole={setSelectedRole}
                                    roles={roles}
                                    selectedAppCode={selectedTitle}
                                />
                            </div>
                        </div>
                    </div>
                    )}
                </div>

                {/* Stats Cards */}
                {/* Modified grid for responsiveness: grid-cols-1 on small, md:grid-cols-2 on medium, lg:grid-cols-4 on large */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {loading ? (
                        <>
                            <Skeleton height={100} borderRadius={12} />
                            <Skeleton height={100} borderRadius={12} />
                            <Skeleton height={100} borderRadius={12} />
                            <Skeleton height={100} borderRadius={12} />
                        </>
                    ) : (
                        <>
                            <StatsCard 
                                title="Total RBAC"
                                value={loading ? '...' : totalRbac}
                                icon={<Calculator className="text-white" size={20} />}
                                bgColor="bg-[#005496] bg-opacity-10"
                                delay={0}
                            />

                            <StatsCard 
                                title="Active RBAC"
                                value={loading ? '...' : activeRbac}
                                bgColor="bg-green-100"
                                pulseColor="bg-green-500"
                                valueColor="text-green-600"
                                delay={0.1}
                            />

                            <StatsCard
                                title="Inactive RBAC"
                                value={loading ? '...' : inactiveRbac}
                                bgColor="bg-red-100"
                                pulseColor="bg-red-500"
                                valueColor="text-red-600"
                                delay={0.2}
                            />

                            <StatsCard
                                title="Last Updated"
                                value={loading ? '...' : getLastUpdated()}
                                bgColor="bg-blue-100"
                                pulseColor="bg-blue-500"
                                valueColor="text-gray-900"
                                delay={0.3}
                            />
                        </>
                    )}
                    
                </div>

                <RbacTable
                    refreshSignal={refresh}
                    onRefresh={handleRefresh}
                    searchTerm={searchTerm}
                    selectedTitle={selectedTitle}
                    selectedRole={selectedRole}
                />

                <RbacCreateModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    onSuccess={handleRefresh}
                />

                {/* <AppsRolesEditModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    onSuccess={handleRefresh}
                    editData={editData!}
                /> */}
            </div>
        </main>
    )
}