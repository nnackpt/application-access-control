"use client"

import StatsCard from "@/Components/UI/StatsCard"
import AppTitleSelect from "@/Components/UI/Select/AppTitleSelect"
import RoleTitleSelect from "@/Components/UI/Select/RoleTitleSelect"
import UsersTable from "@/Components/Users/UsersTable"

import { useExportData } from "@/hooks/useExportData"
import { getStats } from "@/Utils/getStats"
import { motion } from 'framer-motion';

import { applicationApi } from "@/services/ApplicationApi"
import { AppsRolesApi } from "@/services/AppsRolesApi"
import { UserApi } from "@/services/UserApi"
import { Application } from "@/types/Application"
import { AppsRoles } from "@/types/AppsRoles"
import type { User } from "@/types/User"


import { Calculator, Plus, Search } from "lucide-react"
import { Suspense, useEffect, useState } from "react"
import Skeleton from "react-loading-skeleton"
import { AiFillFileExcel } from "react-icons/ai"
import { useRouter, useSearchParams } from "next/navigation"


function UserContent() {
    const [refresh, setRefresh] = useState(0)
    const [user, setUser] = useState<User[]>([])
    const [loading, setLoading] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedTitle, setSelectedTitle] = useState("all")
    // const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [applications, setApplications] = useState<Application[]>([])
    const [roles, setRoles] = useState<AppsRoles[]>([])
    const [selectedRole, setSelectedRole] = useState("all")
    const router = useRouter()
    const searchParams = useSearchParams()
    const { exportToExcel } = useExportData<User>()

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
        const newUrl = queryString ? `/Users?${queryString}` : '/Users'

        router.replace(newUrl)
    }

    // Handlers for filter and search changes
    const handleSelectedTitleChange =(title: string) => {
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
    
    // Helper function to get application name from User item
    const getAppName = (userItem: User) => {
        if (userItem.cM_APPLICATIONS && userItem.cM_APPLICATIONS.name) return userItem.cM_APPLICATIONS.name
        if (userItem.cM_APPS_ROLES && userItem.cM_APPS_ROLES.cM_APPLICATIONS && userItem.cM_APPS_ROLES.cM_APPLICATIONS.name) {
            return userItem.cM_APPS_ROLES.cM_APPLICATIONS.name
        }

        if (applications && userItem.apP_CODE) {
            const app = applications.find(app => app.apP_CODE === userItem.apP_CODE)
            if (app) return app.name
        }
        return ""
    }

    // Helper function to get role name from User item
    const getRoleName = (userItem: User) => {
        if (userItem.cM_APPS_ROLES && userItem.cM_APPS_ROLES.name) return userItem.cM_APPS_ROLES.name;
        if (roles && userItem.rolE_CODE && userItem.apP_CODE) {
            const role = roles.find(role => role.rolE_CODE === userItem.rolE_CODE && role.apP_CODE === userItem.apP_CODE);
            if (role) return role.name;
        }
        return "";
    };

    // Helper function to get full name
    const getFullName = (userItem: User) => {
        const firstName = userItem.fname || ''
        const lastName = userItem.lname || ''
        return `${firstName} ${lastName}`.trim()
    }

    const handleExport = () => {
        exportToExcel({
            fileName: "User_Authorization",
            sheetName: "User Authorization",
            data: user,
            columns: [
                { header: 'AUTH Code', keys: ['autH_CODE'] },
                { header: 'APP Code', keys: ['apP_CODE'] },
                { header: 'Application Name', formatter: (item) => getAppName(item) as string},
                { header: 'ROLE Code', keys: ['rolE_CODE'] },
                { header: 'Role Name', formatter: (item) => getRoleName(item) },
                { header: 'USERID', keys: ['userid'] },
                { header: 'Full Name', formatter: (item) => getFullName(item) },
                { header: 'Organization', keys: ['org'] },
                { header: 'Site Code', keys: ['sitE_CODE'] },
                { header: 'Domain Code', keys: ['domaiN_CODE'] },
                { header: 'Fact Code', keys: ['facT_CODE'] },
                { header: 'Active', keys: ['active'] },
                { header: 'Created By', keys: ['createD_BY'] },
                { header: 'Created Date', keys: ['createD_DATETIME'] },
                { header: 'Updated By', keys: ['updateD_BY'] },
                { header: 'Updated Date', keys: ['updateD_DATETIME'] }
            ]
        })
    }

    const handleRefresh = () => {
        setRefresh(prev => prev + 1)
    }

    useEffect(() => {
        const fetchUsersAndData = async () => {
            setLoading(true)
            try {
                const [userResponse, appResponse, appsRolesResponse] = await Promise.all([
                    UserApi.getUser(),
                    applicationApi.getApplications(),
                    AppsRolesApi.getAppsRoles()
                ])
                setApplications(appResponse),
                setUser(userResponse),
                setRoles(appsRolesResponse)
            
            } catch (error) {
                console.error("Error fetching Users and Data:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchUsersAndData()
    }, [refresh])

    const {
        total: totalUsers,
        active: activeUsers,
        inactive: inactiveUsers,
        getLastUpdated,
    } = getStats({ data: user as User[] })

    return (
        <main className="min-h-screen">
            <div className="p-6">

                <div className="flex justify-between items-start mb-6 -mt-4 px-2">
                    <div className="text-[var(--primary-color)] text-xl font-bold">
                        <span>APPLICATION&apos;S USERS AUTHORIZED</span>
                    </div>
                </div>

                {/* Stats Card */}
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
                                title="Total Users"
                                value={loading ? '...' : totalUsers}
                                icon={<Calculator className="text-white" size={20} />}
                                bgColor="bg-[var(--primary-color)] bg-opacity-10"
                                delay={0}
                            />

                            <StatsCard 
                                title="Active Users"
                                value={loading ? '...' : activeUsers}
                                bgColor="bg-green-100"
                                pulseColor="bg-green-500"
                                valueColor="text-green-600"
                                delay={0.1}
                            />

                            <StatsCard 
                                title="Inactive Users"
                                value={loading ? '...' : inactiveUsers}
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
                                        onClick={() => router.push("/Users/Create")}
                                        className="flex items-center space-x-2 bg-[var(--primary-color)] text-white px-4 py-3 rounded-lg shadow-lg cursor-pointer"
                                        whileHover={{ scale: 1.05, backgroundColor: "var(--primary-color-dark)", boxShadow: "0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)" }}
                                        whileTap={{ scale: 0.98 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 27 }}
                                    >
                                        <Plus size={20} />
                                    </motion.button>

                                    <motion.button
                                        onClick={handleExport}
                                        className="flex items-center space-x-2 bg-gray-400 text-white px-4 py-3 rounded-lg shadow-lg cursor-pointer"
                                        whileHover={{ scale: 1.05, backgroundColor: "#6B7280", boxShadow: "0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)" }}
                                        whileTap={{ scale: 0.98 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                    >
                                        <AiFillFileExcel size={20} />
                                    </motion.button>

                                </div>
                            </div>

                            <div className="flex items-center space-x-3">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                                    <input 
                                        type="text" 
                                        placeholder="Search USERS..."
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

                <UsersTable 
                    refreshSignal={refresh}
                    onRefresh={handleRefresh}
                    searchTerm={searchTerm}
                    selectedTitle={selectedTitle}
                    selectedRole={selectedRole}
                />
                
            </div>
        </main>
    )
}

export default function User() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <UserContent />
        </Suspense>
    )
}