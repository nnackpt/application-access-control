"use client"

import AppsRolesCreateModal from "@/Components/AppRoles/AppsRolesCreateModal"
// import AppsRolesEditModal from "@/Components/AppRoles/AppsRolesEditModal"
import AppsRolesTable from "@/Components/AppRoles/AppsRolesTable"
import AppTitleSelect from "@/Components/UI/Select/AppTitleSelect"
import StatsCard from "@/Components/UI/StatsCard"

import { applicationApi } from "@/services/ApplicationApi"
import { AppsRolesApi } from "@/services/AppsRolesApi"
import { Application } from "@/types/Application"
import type { AppsRoles } from "@/types/AppsRoles"

// import getValue from "@/Utils/getValue"
import { useExportData } from "@/hooks/useExportData"

import { Calculator, Plus, Search } from "lucide-react"
import { useEffect, useState } from "react"

import { motion } from 'framer-motion';
import 'react-loading-skeleton/dist/skeleton.css'
import Skeleton from 'react-loading-skeleton'
import { getStats } from "@/Utils/getStats"
import { AiFillFileExcel } from "react-icons/ai"

export default function AppsRoles() {
    const [refresh, setRefresh] = useState(0)
    // const [isModalOpen, setIsModalOpen] = useState(false)
    // const [editRoles, setEditRoles] = useState<AppsRoles | null>(null)
    const [appsRoles, setAppsRoles] = useState<AppsRoles[]>([])
    const [loading, setLoading] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedTitle, setSelectedTitle] = useState("all")
    // const [applicationTitle, setApplicationTitle] = useState<Record<string, string>>({})
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    // const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    // const [editData, setEditData] = useState<AppsRoles | null>(null)
    const [applications, setApplications] = useState<Application[]>([])
    const { exportToExcel } = useExportData<AppsRoles>();

    const handleExport = () => {
        exportToExcel({
            fileName: "Applications_Roles",
            sheetName: "Application Roles",
            data: appsRoles,
            columns: [
                { header: 'APP Code', keys: ['apP_CODE'] },
                { header: 'ROLE Code', keys: ['rolE_CODE'] },
                { header: 'Name', keys: ['name'] },
                { header: 'Description', keys: ['desc'] },
                { header: 'Active', keys: ['active'] },
                { header: 'Home URL', keys: ['homE_URL'] },
                { header: 'Created By', keys: ['createD_BY'] },
                { header: 'Updated By', keys: ['updateD_BY'] },
                { header: 'Updated Date', keys: ['updateD_DATETIME'] }
            ]
        });
    };

    // const handleOpenCreateModal = () => {
    //     setEditRoles(null)
    //     setIsModalOpen(true)
    // }

    // const handleEditRole = (role: AppsRoles) => {
    //     setEditRoles(role)
    //     setIsModalOpen(true)
    // }

    // const handleModalClose = () => {
    //     setIsModalOpen(false)
    //     setEditRoles(null)
    // }

    // const handleSuccess = () => {
    //     setIsModalOpen(false)
    //     setEditRoles(null)
    //     handleRefresh()
    // }

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
                setApplications(appResponse)

                // const TitlesMap: Record<string, string> = {}
                // appResponse.forEach((app: Application) => {
                //     const appCode = getValue(app, ['apP_CODE', 'appCode', 'app_code', 'AppCode', 'APP_CODE']) || ''
                //     const appTitle = getValue(app, ['titLE', 'title']) || ''
                //     if (appCode && appTitle) {
                //         TitlesMap[appCode] = appTitle
                //     }
                // })
                // setApplicationTitle(TitlesMap)

            } catch (error) {
                console.error("Error fetching Apps and Roles:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchAppsAndRoles()
    }, [refresh])

    // Calculate total, active, and inactive roles
    // const totalRoles = appsRoles.length
    // const activeRoles = appsRoles.filter(role => {
    //     const active = getValue(role as unknown as Record<string, unknown>, ['active'])
    //     return active === true
    // }).length
    // const inactiveRoles = totalRoles - activeRoles

    // Get unique app titles and sort them
    // const uniqueAppTitles = Array.from(new Set(appsRoles.map(role => {
    //     return getValue(role, ['apP_CODE', 'appCode', 'app_code', 'AppCode', 'APP_CODE'])
    // }).filter(Boolean))) as (string | number)[]
    
    // const sortedAppTitles = uniqueAppTitles.sort((a, b) => {
    //     const numA = parseFloat(String(a))
    //     const numB = parseFloat(String(b))

    //     if (!isNaN(numA) && !isNaN(numB)) {
    //         return numA - numB
    //     } else {
    //         return String(a).localeCompare(String(b))
    //     }
    // })

    // const getLastUpdated = () => {
    //     if (appsRoles.length === 0) return "No data available"

    //     const latestUpdate = appsRoles.reduce((latest: string | null, role) => {
    //         const updatedDate = getValue(role as unknown as Record<string, unknown>, ['updateD_DATETIME']) as string | undefined
    //         const createdDate = getValue(role as unknown as Record<string, unknown>, ['createD_DATETIME']) as string | undefined
          
    //       const roleDate = updatedDate || createdDate
    //       if (!roleDate) return latest

    //       const roleDateTime = new Date(roleDate).getTime()
    //       const latestDateTime = latest ? new Date(latest).getTime() : 0

    //       return roleDateTime > latestDateTime ? roleDate : latest
    //     }, null)

    //     if (!latestUpdate) return "No updates available"

    //     const today = new Date()
    //     const updateDate = new Date(latestUpdate)
    //     const diffTime = today.getTime() - updateDate.getTime()
    //     const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    //     if (diffDays === 0) return 'Today'
    //     if (diffDays === 1) return 'Yesterday'
    //     if (diffDays < 7) return `${diffDays} days ago`

    //     return updateDate.toLocaleDateString('th-TH')
    // }

    const {
        total: totalRoles,
        active: activeRoles,
        inactive: inactiveRoles,
        getLastUpdated,
    } = getStats({ data: appsRoles as AppsRoles[] })

    return (
        <main className="min-h-screen">
            <div className="p-6">

                <div className="flex justify-between items-start mb-6 -mt-4 px-2">
                    <div className="text-[var(--primary-color)] text-xl font-bold">
                        <span>APPLICATION&apos;s ROLES</span>
                    </div>
                </div>

                {/* {Stats Cards} */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
                                title="Total Roles"
                                value={loading ? '...' : totalRoles}
                                icon={<Calculator className="text-white" size={20} />}
                                bgColor="bg-[#005496] bg-opacity-10"
                                delay={0}
                            />

                            <StatsCard
                                title="Active Roles"
                                value={loading ? '...' : activeRoles}
                                bgColor="bg-green-100"
                                pulseColor="bg-green-500"
                                valueColor="text-green-600"
                                delay={0.1}
                            />
                            
                            <StatsCard
                                title="Inactive Roles"
                                value={loading ? '...' : inactiveRoles}
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
                        <div className="flex justify-between items-center flex-wrap gap-y-4">
                            <div className="flex items-center space-x-4">
                                <div className="flex space-x-3">


                                    <motion.button
                                        onClick={() => setIsCreateModalOpen(true)}
                                        className="flex items-center space-x-2 bg-[#005496] text-white px-6 py-2 rounded-lg
                                                shadow-lg cursor-pointer"
                                        whileHover={{ scale: 1.05, backgroundColor: "#004080", boxShadow: "0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)" }}
                                        whileTap={{ scale: 0.98 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                    >
                                        <Plus size={20} />
                                        {/* <span>Create New Application&apos;s Role</span> */}
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
                                        {/* <span>Export Application&apos;s Role</span> */}
                                    </motion.button>

                                </div>
                            </div>

                            <div className="flex items-center space-x-3">
                                <div className="relative">
                                    <AppTitleSelect
                                        selectedTitle={selectedTitle}
                                        setSelectedTitle={setSelectedTitle}
                                        applications={applications}
                                    />
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
                    )}
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