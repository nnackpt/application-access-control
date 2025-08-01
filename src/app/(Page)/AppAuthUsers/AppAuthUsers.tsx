"use client"

import { AppAuthApi } from "@/services/AppAuthUserApi"
import { User } from "@/types/User"

import { useEffect, useState, Suspense } from "react"
import { Users, Building2, MapPin, Search, UserCheck, Calendar, TrendingUp } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

import AppAuthUserTable from "@/Components/AppAuthUsers/AppAuthUserTable"
import StatsCard from "@/Components/UI/StatsCard"

import { useExportData } from "@/hooks/useExportData"
import { motion } from "framer-motion"
import 'react-loading-skeleton/dist/skeleton.css'
import Skeleton from 'react-loading-skeleton' 
import { AiFillFileExcel } from "react-icons/ai"
import AppTitleSelect from "@/Components/UI/Select/AppTitleSelect"
import AppRoleSelect from "@/Components/UI/Select/RoleNameSelect"

function AppAuthUserContent() {
    const [refresh, setRefresh] = useState(0)
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedApp, setSelectedApp] = useState("all")
    const [selectedRole, setSelectedRole] = useState("all")
    const [selectedOrg, setSelectedOrg] = useState("all")
    // const router = useRouter()
    const searchParams = useSearchParams()
    const { exportToExcel } = useExportData<User>()

    // Effect to pull values from URL parameters on component mount
    useEffect(() => {
        const appParam = searchParams.get('app')
        const roleParam = searchParams.get('role')
        const orgParam = searchParams.get('org')
        const searchParam = searchParams.get('search')

        if (appParam) setSelectedApp(appParam)
        if (roleParam) setSelectedRole(roleParam)
        if (orgParam) setSelectedOrg(orgParam)
        if (searchParam) setSearchTerm(searchParam)
    }, [searchParams])

    // const updateURLParams = (app?: string, role?: string, org?: string, search?: string) => {
    //     const params = new URLSearchParams()
        
    //     if (app && app !== "all") params.set('app', app)
    //     if (role && role !== "all") params.set('role', role)
    //     if (org && org !== "all") params.set('org', org)
    //     if (search && search.trim()) params.set('search', search)
        
    //     const queryString = params.toString()
    //     const newUrl = queryString ? `/AppAuthUser?${queryString}` : '/AppAuthUser'
        
    //     router.replace(newUrl)
    // }

    // Handlers for filter and search changes
    const handleSelectedAppChange = (app: string) => {
        setSelectedApp(app)
        setSelectedRole("all")
        // updateURLParams(app, selectedRole, selectedOrg, searchTerm)
    }

    const handleSelectedRoleChange = (role: string) => {
        setSelectedRole(role)
        // updateURLParams(selectedApp, role, selectedOrg, searchTerm)
    }

    // const handleSelectedOrgChange = (org: string) => {
    //     setSelectedOrg(org)
        // updateURLParams(selectedApp, selectedRole, org, searchTerm)
    // }

    const handleSearchTermChange = (search: string) => {
        setSearchTerm(search)
        // updateURLParams(selectedApp, selectedRole, selectedOrg, search)
    }

    const handleExport = () => {
        exportToExcel({
            fileName: "AppAuthUsers",
            sheetName: "Authorized Users",
            data: users,
            columns: [
                { header: 'Application Title', keys: ['applicationTitle'] },
                { header: 'Role Name', keys: ['roleName'] },
                { header: 'User ID', keys: ['userId'] },
                { header: 'Name', keys: ['name'] },
                { header: 'Organization', keys: ['org'] },
                { header: 'Site Facility', keys: ['siteFacility'] },
                { header: 'Created By', keys: ['createdBy'] },
                { header: 'Created Date', keys: ['createdDateTime'] },
                { header: 'Updated By', keys: ['updatedBy'] },
                { header: 'Updated Date', keys: ['updatedDateTime'] }
            ]
        });
    };

    const handleRefresh = () => {
        setRefresh(prev => prev + 1)
    }

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true)
            try {
                const response = await AppAuthApi.getAuthUser()
                setUsers(response || [])
            } catch (error) {
                console.error("Error fetching authorized users:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchUsers()
    }, [refresh])

    // Enhanced stats calculations
    const getEnhancedStats = () => {
        const totalUsers = users.length
        const uniqueApplications = new Set(users.map(user => user.applicationTitle)).size
        const uniqueOrganizations = new Set(users.map(user => user.org)).size
        const uniqueRoles = new Set(users.map(user => user.roleName)).size

        // Get recent users (last 7 days)
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
        const recentUsers = users.filter(user => 
            user.createdDateTime && new Date(user.createdDateTime) > sevenDaysAgo
        ).length

        // Organization distribution for pie chart
        const orgDistribution = users.reduce((acc, user) => {
            acc[user.org || 'Unknown'] = (acc[user.org || 'Unknown'] || 0) + 1
            return acc
        }, {} as Record<string, number>)

        const orgChartData = Object.entries(orgDistribution)
            .map(([org, count]) => ({ name: org, value: count }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 6) // Top 6 organizations

        // Role distribution for bar chart
        const roleDistribution = users.reduce((acc, user) => {
            acc[user.roleName || 'Unknown'] = (acc[user.roleName || 'Unknown'] || 0) + 1
            return acc
        }, {} as Record<string, number>)

        const roleChartData = Object.entries(roleDistribution)
            .map(([role, count]) => ({ name: role, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 8) 

        // Application distribution
        const appDistribution = users.reduce((acc, user) => {
            acc[user.applicationTitle || 'Unknown'] = (acc[user.applicationTitle || 'Unknown'] || 0) + 1
            return acc
        }, {} as Record<string, number>)

        const appChartData = Object.entries(appDistribution)
            .map(([app, count]) => ({ name: app, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5) 

        return {
            totalUsers,
            uniqueApplications,
            uniqueOrganizations,
            uniqueRoles,
            recentUsers,
            orgChartData,
            roleChartData,
            appChartData
        }
    }

    const stats = getEnhancedStats()
    // const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d']

    // Get unique values for filters
    // const uniqueApplications = Array.from(new Set(users.map(user => user.applicationTitle || 'Unknown'))).sort()
    const uniqueRoles = Array.from(new Set(
        users
            .filter(user => selectedApp === "all" || user.applicationTitle === selectedApp)
            .map(user => user.roleName || 'Unknown')
    )).sort()
    // const uniqueOrganizations = Array.from(new Set(users.map(user => user.org || 'Unknown'))).sort()

    return (
        <main className="min-h-screen">
            <div className="p-6">
                <div className="flex justify-between items-start mb-6 -mt-4 px-2">
                    <div className="text-[var(--primary-color)] text-xl font-bold">
                        {loading ? <Skeleton width={200} height={36} /> : "APPLICATION AUTHORIZED USER"}
                    </div>
                </div>

                {/* Enhanced Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {loading ? (
                        <>
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                                    <Skeleton height={20} width="80%" className="mb-2" />
                                    <Skeleton height={30} width="50%" />
                                </div>
                            ))}
                        </>
                    ) : (
                        <>
                            <StatsCard 
                                title="Total Users"
                                value={stats.totalUsers}
                                icon={<Users className="text-white" size={20} />}
                                bgColor="bg-[var(--primary-color)]"
                                delay={0}
                            />

                            <StatsCard 
                                title="Applications"
                                value={stats.uniqueApplications}
                                icon={<Building2 className="text-white" size={20} />}
                                bgColor="bg-green-500"
                                pulseColor="bg-green-500"
                                valueColor="text-green-600"
                                delay={0.1}
                            />

                            <StatsCard
                                title="Organizations"
                                value={stats.uniqueOrganizations}
                                icon={<MapPin className="text-white" size={20} />}
                                bgColor="bg-blue-500"
                                pulseColor="bg-blue-500"
                                valueColor="text-blue-600"
                                delay={0.2}
                            />

                            <StatsCard
                                title="Unique Roles"
                                value={stats.uniqueRoles}
                                icon={<UserCheck className="text-white" size={20} />}
                                bgColor="bg-purple-500"
                                pulseColor="bg-purple-500"
                                valueColor="text-purple-600"
                                delay={0.3}
                            />
                        </>
                    )}
                </div>

                {/* Header with Search and Filters */}
                <div className="mb-8">
                    {loading ? (
                        <div className="flex justify-between items-center">
                            <div className="flex space-x-3">
                                <Skeleton height={48} width={48} circle={true} />
                            </div>
            
                            <div className="flex items-start space-x-3">
                                <Skeleton height={40} width={240} borderRadius={8} className="mt-8" />
                                <div className="flex flex-col space-y-3">
                                    <Skeleton height={40} width={200} borderRadius={8} />
                                    <Skeleton height={40} width={200} borderRadius={8} />
                                    {/* <Skeleton height={40} width={200} borderRadius={8} /> */}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-4">
                                <motion.button
                                    onClick={handleExport}
                                    className="p-3 bg-gray-500 text-white rounded-full shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
                                    whileHover={{ scale: 1.05, backgroundColor: "#6B7280", boxShadow: "0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)" }}
                                    whileTap={{ scale: 0.98 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                >
                                    <AiFillFileExcel size={20} />
                                </motion.button>
                            </div>

                            <div className="flex items-center space-x-3">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                                    <input
                                        type="text"
                                        placeholder="Search Users..."
                                        value={searchTerm}
                                        onChange={(e) => handleSearchTermChange(e.target.value)}
                                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] outline-none w-64"
                                    />
                                </div>
                                
                                <div className="flex flex-col space-y-3 ml-4">
                                    {/* <select
                                        value={selectedApp}
                                        onChange={(e) => handleSelectedAppChange(e.target.value)}
                                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] outline-none w-64"
                                    >
                                        <option value="all">All Applications</option>
                                        {uniqueApplications.map(app => (
                                            <option key={app} value={app}>{app}</option>
                                        ))}
                                    </select> */}

                                    <AppTitleSelect
                                        selectedTitle={selectedApp}
                                        setSelectedTitle={handleSelectedAppChange}
                                        applications={users.map(user => ({
                                            apP_CODE: user.applicationTitle || '', // Ensure apP_CODE is a string
                                            title: user.applicationTitle || '', // Ensure title is a string
                                            name: user.applicationTitle || '', // Add name property
                                            active: true, // Add active property
                                        })).filter((app, index, self) => 
                                            index === self.findIndex(a => a.apP_CODE === app.apP_CODE)
                                        )}
                                    />

                                    <AppRoleSelect
                                        selectedRole={selectedRole}
                                        setSelectedRole={handleSelectedRoleChange}
                                        roles={uniqueRoles}
                                    />

                                    {/* <select
                                        value={selectedRole}
                                        onChange={(e) => handleSelectedRoleChange(e.target.value)}
                                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] outline-none w-64"
                                    >
                                        <option value="all">All Roles</option>
                                        {uniqueRoles.map(role => (
                                            <option key={role} value={role}>{role}</option>
                                        ))}
                                    </select> */}

                                    {/* <select
                                        value={selectedOrg}
                                        onChange={(e) => handleSelectedOrgChange(e.target.value)}
                                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] outline-none w-64"
                                    >
                                        <option value="all">All Organizations</option>
                                        {uniqueOrganizations.map(org => (
                                            <option key={org} value={org}>{org}</option>
                                        ))}
                                    </select> */}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <AppAuthUserTable
                    refreshSignal={refresh}
                    onRefresh={handleRefresh}
                    searchTerm={searchTerm}
                    selectedApp={selectedApp}
                    selectedRole={selectedRole}
                    selectedOrg={selectedOrg}
                />
            </div>
        </main>
    )
}

export default function AppAuthUser() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AppAuthUserContent />
        </Suspense>
    )
}