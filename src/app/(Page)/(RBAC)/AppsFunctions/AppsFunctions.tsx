"use client"

import React, { useState, useEffect } from "react"
import { Plus, Calculator, Search } from "lucide-react"
import { AiFillFileExcel } from 'react-icons/ai';
import 'react-loading-skeleton/dist/skeleton.css'
import Skeleton from 'react-loading-skeleton'

import AppsFunctionsTable from "@/Components/AppsFunctions/AppsFunctionsTable"
import AppsFunctionsCreateModal from "@/Components/AppsFunctions/AppsFunctionsCreateModal"
// import AppsFunctionsEditModal from "@/Components/AppsFunctions/AppsFunctionsEditModal"
import AppTitleSelect from "@/Components/UI/Select/AppTitleSelect"
import StatsCard from "@/Components/UI/StatsCard"

import { AppsFunctionsApi } from "@/services/AppsFunctionsApi"
import { applicationApi } from "@/services/ApplicationApi"
import type { AppsFunctions } from "@/types/AppsFunctions"
import { Application } from "@/types/Application"

import { motion } from 'framer-motion';
// import getValue from "@/Utils/getValue"
import { useExportData } from "@/hooks/useExportData"
import { getStats } from "@/Utils/getStats"
// import { saveAs } from 'file-saver';

export default function AppsFunctions() {
  const [refresh, setRefresh] = useState(0)
  // const [isModalOpen, setIsModalOpen] = useState(false)
  // const [editFunction, setEditFunction] = useState<AppsFunctions | null>(null)
  const [appsFunctions, setAppsFunctions] = useState<AppsFunctions[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedAppTitle, setSelectedAppTitle] = useState("all")
  // const [applicationTitle, setApplicationTitle] = useState<Record<string, string>>({})
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  // const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  // const [editData, setEditData] = useState<AppsFunctions | null>(null)
  const [applications, setApplications] = useState<Application[]>([]);
  const { exportToExcel } = useExportData<AppsFunctions>()

  const handleExport = () => {
    exportToExcel({
        fileName: "Applications_Functions",
        sheetName: "Application Functions",
        data: appsFunctions,
        columns: [
            { header: 'APP Code', keys: ['apP_CODE'] },
            { header: 'FUNC Code', keys: ['funC_CODE'] },
            { header: 'Name', keys: ['name'] },
            { header: 'Description', keys: ['desc'] },
            { header: 'Active', keys: ['active'] },
            { header: 'Function URL', keys: ['funC_URL'] },
            { header: 'Created By', keys: ['createD_BY'] },
            { header: 'Created Date', keys: ['createD_DATETIME'] },
            { header: 'Updated By', keys: ['updateD_BY'] },
            { header: 'Updated Date', keys: ['updateD_DATETIME'] }
        ]
    });
  };

  // const handleOpenCreateModal = () => {
  //   setEditFunction(null)
  //   setIsModalOpen(true)
  // }

  // const handleEditFunction = (func: AppsFunctions) => {
  //   setEditFunction(func)
  //   setIsModalOpen(true)
  // }

  // const handleModalClose = () => {
  //   setIsModalOpen(false)
  //   setEditFunction(null)
  // }

  // const handleSuccess = () => {
  //   setIsModalOpen(false)
  //   setEditFunction(null)
  //   handleRefresh()
  // }

  // ดึงข้อมูลสำหรับ stats
  useEffect(() => {
    const fetchAppsAndFunctions = async () => {
      setLoading(true)
      try {
        const [functionsResponse, applicationsResponse] = await Promise.all([
          AppsFunctionsApi.getAppsFunctions(),
          applicationApi.getApplications()
        ])
        setAppsFunctions(functionsResponse)
        setApplications(applicationsResponse)

        // const TitlesMap: Record<string, string> = {}
        // applicationsResponse.forEach((app: Application) => {
        //   const appCode = getValue(app, ['apP_CODE', 'appCode', 'app_code', 'AppCode', 'APP_CODE', 'code', 'id'])
        //   const appTitle = getValue(app, ['title', 'TITLE'])
        //   if (appCode && appTitle) {
        //     TitlesMap[appCode] = appTitle
        //   }
        // })
        // setApplicationTitle(TitlesMap)

      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchAppsAndFunctions()
  }, [refresh])

  const handleRefresh = () => {
    setRefresh(prev => prev + 1)
  }

  // คำนวณ stats จากข้อมูล apps functions
  // const totalFunctions = appsFunctions.length
  // const activeFunctions = appsFunctions.filter(func => {
  //   const active = getValue(func as unknown as Record<string, unknown>, ['active'])
  //   return active === true
  // }).length
  // const inactiveFunctions = totalFunctions - activeFunctions

  // นับจำนวน unique applications
  // const uniqueAppTitles = Array.from(new Set(appsFunctions.map(func => {
  //   return getValue(func, ['apP_CODE', 'appCode', 'app_code', 'AppCode', 'APP_CODE'])
  // }).filter(Boolean))) as (string | number)[]

  // const sortedAppTitles = uniqueAppTitles.sort((a, b) => {
  //   const numA = parseFloat(String(a))
  //   const numB = parseFloat(String(b))
    
  //   if (!isNaN(numA) && !isNaN(numB)) {
  //     return numA - numB
  //   } else {
  //     return String(a).localeCompare(String(b))
  //   }
  // })

  // หาวันที่ updated ล่าสุด
  // const getLastUpdated = () => {
  //   if (appsFunctions.length === 0) return 'No data'
    
  //   const latestUpdate = appsFunctions.reduce((latest: string | null, func) => {
  //     const updatedDate = getValue(func as unknown as Record<string, unknown>, ['updateD_DATETIME']) as string | undefined
  //     const createdDate = getValue(func as unknown as Record<string, unknown>, ['createD_DATETIME']) as string | undefined
      
  //     const funcDate = updatedDate || createdDate
  //     if (!funcDate) return latest

  //     const funcDateTime = new Date(funcDate).getTime()
  //     const latestDateTime = latest ? new Date(latest).getTime() : 0

  //     return funcDateTime > latestDateTime ? funcDate : latest
  //   }, null as string | null)

  //   if (!latestUpdate) return 'No data'
    
  //   const today = new Date()
  //   const updateDate = new Date(latestUpdate)
  //   const diffTime = today.getTime() - updateDate.getTime()
  //   const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    
  //   if (diffDays === 0) return 'Today'
  //   if (diffDays === 1) return 'Yesterday'
  //   if (diffDays < 7) return `${diffDays} days ago`
    
  //   return updateDate.toLocaleDateString('th-TH')
  // }

  const {
    total: totalFunctions,
    active: activeFunctions,
    inactive: inactiveFunctions,
    getLastUpdated,
  } = getStats({ data: appsFunctions as AppsFunctions[] })

  return (
    <main className="min-h-screen">
      <div className="p-6">

          <div className="flex justify-between items-start mb-6 -mt-4 px-2">
            <div className="text-[var(--primary-color)] text-xl font-bold">
              APPLICATION&apos;S FUNCTION
            </div>
          </div>

        {/* Stats Cards */}
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
                title="Total Functions"
                value={loading ? '...' : totalFunctions}
                icon={<Calculator className="text-white" size={20} />}
                bgColor="bg-[var(--primary-color)] bg-opacity-10"
                delay={0}
              />

              <StatsCard
                title="Active Functions"
                value={loading ? '...' : activeFunctions}
                bgColor="bg-green-100"
                pulseColor="bg-green-500"
                valueColor="text-green-600"
                delay={0.1}
              />
              
              <StatsCard
                title="Inactive Functions"
                value={loading ? '...' : inactiveFunctions}
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
            <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                    <div className="flex space-x-3">

                          
                        <motion.button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="flex items-center space-x-2 bg-[var(--primary-color)] text-white px-6 py-2 rounded-lg
                                    shadow-lg cursor-pointer"
                            whileHover={{ scale: 1.05, backgroundColor: "var(--primary-color-dark)", boxShadow: "0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)" }}
                            whileTap={{ scale: 0.98 }}
                            transition={{ type: "spring", stiffness: 400, damping: 17 }}
                        >
                            <Plus size={20} />
                            {/* <span>Create New Application&apos;s Function</span> */}
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
                            {/* <span>Export Application&apos;s Function</span> */}
                        </motion.button>

                    </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="relative">
                    {/* Select for Application Title */}
                    <AppTitleSelect
                      selectedTitle={selectedAppTitle}
                      setSelectedTitle={setSelectedAppTitle}
                      applications={applications}
                    />
                  </div>

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                        <input 
                            type="text" 
                            placeholder="Search Functions..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] outline-none w-64"     
                        />
                    </div>
                </div>
            </div>
          )}
          </div>


        {/* Table */}
        <AppsFunctionsTable 
          refreshSignal={refresh} 
          onRefresh={handleRefresh}
          searchTerm={searchTerm}
          selectedTitle={selectedAppTitle}
        />

        {/* Create Modal */}
        <AppsFunctionsCreateModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={handleRefresh}
        />

        {/* Edit Modal */}
        {/* <AppsFunctionsEditModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={handleRefresh} 
          editData={editData!}
        /> */}
      </div>
    </main>
  )
}