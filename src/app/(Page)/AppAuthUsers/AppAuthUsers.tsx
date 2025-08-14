"use client"

import { AppAuthApi } from "@/services/AppAuthUserApi"
import { User } from "@/types/User"

import { useEffect, useState, Suspense } from "react"
import { 
    Users, 
    Building2, 
    MapPin, 
    Search, 
    UserCheck, 
    // Calendar, 
    // TrendingUp 
} from "lucide-react"
import { useSearchParams } from "next/navigation"

import AppAuthUserTable from "@/Components/AppAuthUsers/AppAuthUserTable"
import StatsCard from "@/Components/UI/StatsCard"

import { useExportData } from "@/hooks/useExportData"
import { motion } from "framer-motion"
import 'react-loading-skeleton/dist/skeleton.css'
import Skeleton from 'react-loading-skeleton' 
import { AiFillFileExcel } from "react-icons/ai"
import AppTitleSelect from "@/Components/UI/Select/AppTitleSelect"
import AppRoleSelect from "@/Components/UI/Select/RoleNameSelect"
import { GrDocumentExcel } from "react-icons/gr"
import { UserReviewFormService } from "@/services/UserReviewFormApi"

function AppAuthUserContent() {
    const [refresh, setRefresh] = useState(0)
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(false)
    const [isDownloading, setIsDownloading] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedApp, setSelectedApp] = useState("all")
    const [selectedRole, setSelectedRole] = useState("all")
    const [selectedOrg, setSelectedOrg] = useState("all")
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

    const handleDownloadForm = async () => {
        setIsDownloading(true);
        try {
            console.log('Downloading form for:', { selectedApp, selectedRole })

            const blob = await UserReviewFormService.downloadUserReviewForm(
                selectedApp === "all" ? undefined : selectedApp,
                selectedRole === "all" ? undefined : selectedRole
            )

            if (blob.size === 0) {
                throw new Error("Downloaded file is empty")
            }

            // Create filename with filter info
            const filenameParts = ['Application_User_Review']
            if (selectedApp !== "all") {
                filenameParts.push(selectedApp.replace(/[^a-zA-Z0-9]/g, '_'))
            }
            if (selectedRole !== "all") {
                filenameParts.push(selectedRole.replace(/[^a-zA-Z0-9]/g, '_'))
            }
            filenameParts.push(new Date().toISOString().slice(0, 10))

            const filename = `${filenameParts.join('_')}.xlsx`

            // Download file
            const urlBlob = window.URL.createObjectURL(blob)
            const link = document.createElement("a")
            link.href = urlBlob
            link.setAttribute("download", filename)
            document.body.appendChild(link)
            link.click()
            link.parentNode?.removeChild(link)

            // Clean up the url object
            window.URL.revokeObjectURL(urlBlob)

            console.log("File downloaded successfully:", filename)

        } catch (err) {
            console.error("Error downloading the file:", err)
            alert(`Error downloading file: ${err instanceof Error ? err.message : 'Unknown error'}`)
        } finally {
            setIsDownloading(false)
        }
    }

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
                <div className="mb-8 relative z-20">
                    {loading || isDownloading ? (
                        <div className="flex justify-between items-center">
                            <div className="flex space-x-3">
                                <Skeleton height={48} width={48} circle={true} />
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
                                    title="Export users to Excel"
                                    className="group relative grid h-12 w-12 place-items-center rounded-full text-white shadow-sm ring-1 ring-black/5 bg-gradient-to-br
                                                from-[var(--primary-color)] to-[color-mix(in_oklch,var(--primary-color)_70%,white)] transition-all focus:outline-none
                                                focus-visible:ring-2 focus-visible:ring-[var(--primary-color)]/60 hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                                    whileHover={{ 
                                        scale: 1.06,
                                        rotate: 1, 
                                        opacity: 0.95
                                    }}
                                    whileTap={{ scale: 0.95, rotate: -2 }}
                                    transition={{ type: "tween", ease: "easeOut", duration: 0.15 }}
                                >
                                    <span className="pointer-events-none absolute -indent-1 rounded-full bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.35),transparent_60%)] 
                                                    opacity-0 blur-sm transition-opacity group-hover:opacity-100" />
                                    <AiFillFileExcel size={20} />
                                    <span className="sr-only">Export users</span>
                                </motion.button>

                                <motion.button
                                    onClick={handleDownloadForm}
                                    aria-label="Download user review form"
                                    title="Download user review form"
                                    className="group relative grid h-12 w-12 place-items-center rounded-full text-white shadow-sm ring-1 ring-black/5 bg-gradient-to-br
                                                from-[var(--primary-color-light)] to-[color-mix(in_oklch,var(--primary-color)_70%,white)] transition-all focus:outline-none
                                                focus-visible:ring-2 focus-visible:ring-[var(--primary-color)]/60 hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                                    whileHover={{ 
                                        scale: 1.06,
                                        rotate: 1, 
                                        opacity: 0.95
                                    }}
                                    whileTap={{ scale: 0.95, rotate: -2 }}
                                    transition={{ type: "tween", ease: "easeOut", duration: 0.15 }}
                                >
                                    <span className="pointer-events-none absolute -inset-1 rounded-full bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.35),transparent_60%)] 
                                                    opacity-0 blur-sm transition-opacity group-hover:opacity-100" />
                                    {isDownloading ? (
                                        <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                                        </svg>
                                    ) : (
                                        <GrDocumentExcel size={20} />
                                    )}
                                    <span className="sr-only">Download review form</span>
                                </motion.button>
                            </div>

                            <div className="flex items-center space-x-3 relative z-30">
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
                                
                                <div className="flex flex-col space-y-3 ml-4 relative z-30">

                                    <AppTitleSelect
                                        selectedTitle={selectedApp}
                                        setSelectedTitle={handleSelectedAppChange}
                                        applications={users.map(user => ({
                                            apP_CODE: user.applicationTitle || '', 
                                            title: user.applicationTitle || '', 
                                            name: user.applicationTitle || '', 
                                            active: true,
                                        })).filter((app, index, self) => 
                                            index === self.findIndex(a => a.apP_CODE === app.apP_CODE)
                                        )}
                                    />

                                    <AppRoleSelect
                                        selectedRole={selectedRole}
                                        setSelectedRole={handleSelectedRoleChange}
                                        roles={uniqueRoles}
                                    />

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