"use client"

import { AppsRolesApi } from "@/services/AppsRolesApi"
import { rbacApi } from "@/services/RbacApi"
import { applicationApi } from "@/services/ApplicationApi"
import { AppsRoles } from "@/types/AppsRoles"
import { Application } from "@/types/Application"
import { Rbac } from "@/types/Rbac"

import { useEffect, useState, Suspense } from "react"
import { Calculator, Plus, Search } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

import RbacTable from "@/Components/RBAC/RbacTable"
import RbacCreateModal from "@/Components/RBAC/RbacCreateModal"
import AppTitleSelect from "@/Components/UI/Select/AppTitleSelect"
import StatsCard from "@/Components/UI/StatsCard"
import RoleTitleSelect from "@/Components/UI/Select/RoleTitleSelect"

import { useExportData } from "@/hooks/useExportData"

import { motion } from "framer-motion"
import 'react-loading-skeleton/dist/skeleton.css'
import Skeleton from 'react-loading-skeleton'
import { getStats } from "@/Utils/getStats"
import { AiFillFileExcel } from "react-icons/ai"

function RBACContent() {
    const [refresh, setRefresh] = useState(0)
    const [rbac, setRbac] = useState<Rbac[]>([])
    const [loading, setLoading] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedTitle, setSelectedTitle] = useState("all")
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [applications, setApplications] = useState<Application[]>([])
    const [roles, setRoles] = useState<AppsRoles[]>([])
    const [selectedRole, setSelectedRole] = useState("all")
    const router = useRouter()
    const searchParams = useSearchParams()
    const { exportToExcel } = useExportData<Rbac>()

    // Effect to pull values from URL parameters on component mount
    useEffect(() => {
        const appParam = searchParams.get('app')
        const roleParam = searchParams.get('role')
        const searchParam = searchParams.get('search')

        if (appParam) setSelectedTitle(appParam)
        if (roleParam) setSelectedRole(roleParam)
        if (searchParam) setSearchTerm(searchParam)
    }, [searchParams])

    const updateURLParams = (app?: string, role?: string, search?: string) => {
        const params = new URLSearchParams()
        
        if (app && app !== "all") params.set('app', app)
        if (role && role !== "all") params.set('role', role)
        if (search && search.trim()) params.set('search', search)
        
        const queryString = params.toString()
        const newUrl = queryString ? `/RBAC?${queryString}` : '/RBAC'
        
        router.replace(newUrl)
    }

    // Handlers for filter and search changes
    const handleSelectedTitleChange = (title: string) => {
        setSelectedTitle(title)
        setSelectedRole("all")
        updateURLParams(title, "all", searchTerm)
    }

    const handleSelectedRoleChange = (role: string) => {
        setSelectedRole(role)
        updateURLParams(selectedTitle, role, searchTerm)
    }

    const handleSearchTermChange = (search: string) => {
        setSearchTerm(search)
        updateURLParams(selectedTitle, selectedRole, search)
    }

    // Helper function to get application name from RBAC item
    const getAppName = (rbacItem: Rbac) => {
        if (rbacItem.cM_APPLICATIONS && rbacItem.cM_APPLICATIONS.name) return rbacItem.cM_APPLICATIONS.name;
        if (rbacItem.cM_APPS_ROLES && rbacItem.cM_APPS_ROLES.cM_APPLICATIONS && rbacItem.cM_APPS_ROLES.cM_APPLICATIONS.name) {
            return rbacItem.cM_APPS_ROLES.cM_APPLICATIONS.name;
        }
        // Fallback to applications list if joined data is not directly available
        if (applications && rbacItem.apP_CODE) {
            const app = applications.find(app => app.apP_CODE === rbacItem.apP_CODE);
            if (app) return app.name;
        }
        return "";
    };

    // Helper function to get role name from RBAC item
    const getRoleName = (rbacItem: Rbac) => {
        if (rbacItem.cM_APPS_ROLES && rbacItem.cM_APPS_ROLES.name) return rbacItem.cM_APPS_ROLES.name;
        // Fallback to roles list if joined data is not directly available
        if (roles && rbacItem.rolE_CODE && rbacItem.apP_CODE) {
            const role = roles.find(role => role.rolE_CODE === rbacItem.rolE_CODE && role.apP_CODE === rbacItem.apP_CODE);
            if (role) return role.name;
        }
        return "";
    };

    const handleExport = () => {
        exportToExcel({
            fileName: "Applications_RBAC",
            sheetName: "Application RBAC",
            data: rbac,
            columns: [
                { header: 'RBAC Code', keys: ['rbaC_CODE'] },
                { header: 'APP Code', keys: ['apP_CODE'] },
                { header: 'Application Name', formatter: (item) => getAppName(item) as string },
                { header: 'ROLE Code', keys: ['rolE_CODE'] },
                { header: 'Role Name', formatter: (item) => getRoleName(item) },
                { header: 'FUNC Code', keys: ['funC_CODE'] },
                { header: 'Created By', keys: ['createD_BY'] },
                { header: 'Created Date', keys: ['createD_DATETIME'] },
                { header: 'Updated By', keys: ['updateD_BY'] },
                { header: 'Updated Date', keys: ['updateD_DATETIME'] }
            ]
        });
    };

    const handleRefresh = () => {
        setRefresh(prev => prev + 1)
    }

    useEffect(() => {
        const fetchAppsAndRoles = async () => {
            setLoading(true)
            try {
                const [rbacResponse, appResponse, appsRolesResponse] = await Promise.all([
                    rbacApi.getRbac(),
                    applicationApi.getApplications(),
                    AppsRolesApi.getAppsRoles()
                ])
                setApplications(appResponse)
                setRbac(rbacResponse)
                setRoles(appsRolesResponse)

            } catch (error) {
                console.error("Error fetching Apps and Roles:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchAppsAndRoles()
    }, [refresh])

    const {
        total: totalRbac,
        active: activeRbac,
        inactive: inactiveRbac,
        getLastUpdated,
    } = getStats({ data: rbac as Rbac[] })

    return (
        <main className="min-h-screen">
            <div className="p-6">

                <div className="flex justify-between items-start mb-6 -mt-4 px-2">
                    <div className="text-[var(--primary-color)] text-xl font-bold">
                        <span>RBAC: Role Base Access Control</span>
                    </div>
                </div>

                {/* Stats Cards */}
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
                                bgColor="bg-[var(--primary-color)] bg-opacity-10"
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

                {/* Header */}
                <div className="mb-8">
                    {loading ? (
                        <div className="flex justify-between items-center">
                            <div className="flex space-x-3">
                            <Skeleton height={40} width={180} borderRadius={8} />
                            <Skeleton height={40} width={240} borderRadius={8} />
                            <Skeleton height={40} width={220} borderRadius={8} />
                            </div>
            
                            <div className="flex items-center space-x-3">
                                <Skeleton height={40} width={180} borderRadius={8} />
                                <Skeleton height={40} width={240} borderRadius={8} />
                            </div>
                        </div>
                    ) : (
                        <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                            <div className="flex space-x-3">


                                <motion.button
                                    onClick={() => router.push("/RBAC/Create")}
                                    className="flex items-center space-x-2 bg-[var(--primary-color)] text-white px-6 py-2 rounded-lg
                                            shadow-lg cursor-pointer"
                                    whileHover={{ scale: 1.05, backgroundColor: "var(--primary-color-dark)", boxShadow: "0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)" }}
                                    whileTap={{ scale: 0.98 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                >
                                    <Plus size={20} />
                                    {/* <span>Create New Application&apos;s RBAC</span> */}
                                </motion.button>

                                <motion.button
                                    onClick={handleExport}
                                    className="flex items-center space-x-2 bg-gray-400 text-white px-6 py-2 rounded-lg
                                            shadow-lg cursor-pointer"
                                    whileHover={{ scale: 1.05, backgroundColor: "#6B7280", boxShadow: "0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)" }}
                                    whileTap={{ scale: 0.98 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                >
                                    <AiFillFileExcel size={20} />
                                    {/* <span>Export Application&apos;s RBAC</span> */}
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
                                    onChange={(e) => handleSearchTermChange(e.target.value)}
                                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] outline-none w-64"
                                />
                            </div>
                            
                            <div className="flex flex-col space-y-4 ml-4">
                                <AppTitleSelect
                                    selectedTitle={selectedTitle}
                                    setSelectedTitle={handleSelectedTitleChange}
                                    applications={applications}
                                />

                                <RoleTitleSelect
                                    selectedRole={selectedRole}
                                    setSelectedRole={handleSelectedRoleChange}
                                    roles={roles}
                                    selectedAppCode={selectedTitle}
                                />
                            </div>
                        </div>
                    </div>
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
            </div>
        </main>
    )
}

export default function RBAC() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <RBACContent />
        </Suspense>
    )
}