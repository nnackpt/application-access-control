"use client"

import React, { useState, useEffect } from "react"
import { Plus, Calculator, Search } from "lucide-react"
import { AiFillFileExcel } from 'react-icons/ai';
import 'react-loading-skeleton/dist/skeleton.css'
import Skeleton from 'react-loading-skeleton'

import AppsFunctionsTable from "@/Components/AppsFunctions/AppsFunctionsTable"
import AppsFunctionsCreateModal from "@/Components/AppsFunctions/AppsFunctionsCreateModal"
import AppTitleSelect from "@/Components/UI/Select/AppTitleSelect"
import StatsCard from "@/Components/UI/StatsCard"

import { AppsFunctionsApi } from "@/services/AppsFunctionsApi";
import { applicationApi } from "@/services/ApplicationApi"
import type { AppsFunctions } from "@/types/AppsFunctions"
import { Application } from "@/types/Application"

import { motion } from 'framer-motion';
import { useExportData } from "@/hooks/useExportData"
import { getStats } from "@/Utils/getStats"

export default function AppsFunctions() {
  const [refresh, setRefresh] = useState(0)
  const [appsFunctions, setAppsFunctions] = useState<AppsFunctions[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedAppTitle, setSelectedAppTitle] = useState("all")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
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
              {loading ? <Skeleton width={200} height={36} /> : "APPLICATION'S FUNCTION"}
            </div>
          </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {loading ? (
            <>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <Skeleton height={20} width="80%" className="mb-2" />
                <Skeleton height={30} width="50%" />
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <Skeleton height={20} width="80%" className="mb-2" />
                <Skeleton height={30} width="50%" />
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <Skeleton height={20} width="80%" className="mb-2" />
                <Skeleton height={30} width="50%" />
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <Skeleton height={20} width="80%" className="mb-2" />
                <Skeleton height={30} width="50%" />
              </div>
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
        <div className="mb-8 relative">
          {loading ? (
            <div className="flex justify-between items-center">
              {/* Skeleton ฝั่งซ้าย */}
              <div className="flex space-x-3">
                <Skeleton height={48} width={48} circle={true} />
                <Skeleton height={48} width={48} circle={true} />
              </div>

              {/* Skeleton Search */}
              <div className="flex items-center space-x-3">
                  <Skeleton height={40} width={320} borderRadius={8} />
                  <Skeleton height={40} width={240} borderRadius={8} />
              </div>
          </div>
          ) : (
            <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                    <div className="flex space-x-3">

                          
                        <motion.button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="p-3 bg-[var(--primary-color)] text-white rounded-full shadow-md hover:shadow-lg transition-all duration-200"
                            whileHover={{ 
                                scale: 1.06,
                                rotate: 1, 
                                opacity: 0.95
                            }}
                            whileTap={{ scale: 0.95, rotate: -2 }}
                            transition={{ type: "tween", ease: "easeOut", duration: 0.15 }}
                        >
                            <Plus size={20} />
                            {/* <span>Create New Application&apos;s Function</span> */}
                        </motion.button>

                        <motion.button
                            onClick={handleExport}
                            className="p-3 bg-gray-500 text-white rounded-full shadow-md hover:shadow-lg transition-all duration-200"
                            whileHover={{ 
                                scale: 1.06,
                                rotate: 1, 
                                opacity: 0.95
                            }}
                            whileTap={{ scale: 0.95, rotate: -2 }}
                            transition={{ type: "tween", ease: "easeOut", duration: 0.15 }}
                        >
                            <AiFillFileExcel size={20} />
                            {/* <span>Export Application&apos;s Function</span> */}
                        </motion.button>

                    </div>
                </div>

                <div className="flex items-center space-x-3 relative z-30">
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