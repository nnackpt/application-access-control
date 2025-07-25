"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Skeleton from "react-loading-skeleton"
import 'react-loading-skeleton/dist/skeleton.css'
import { AiFillFileExcel } from "react-icons/ai"
import { Calculator, Plus, Search } from "lucide-react"

import ApplicationTable from "@/Components/Application/ApplicationTable"
import ApplicationCreateModal from "@/Components/Application/ApplicationCreateModal"
// import ApplicationEditModal from "@/Components/Application/ApplicationEditModal"
import StatsCard from "@/Components/UI/StatsCard"

import { applicationApi } from "@/services/ApplicationApi"
import { Application } from "@/types/Application"
// import getValue from "@/Utils/getValue"
import { useExportData } from "@/hooks/useExportData"
import { getStats } from "@/Utils/getStats"

export default function Applications() {
  const [refresh, setRefresh] = useState(0)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  // const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  // const [editData, setEditData] = useState<Application | null>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const { exportToExcel } = useExportData<Application>()

  const handleExport = () => {
    exportToExcel({
      fileName: "Applications",
      sheetName: "Applications",
      data: applications,
      columns: [
        { header: 'APP Code', keys: ['apP_CODE'] },
        { header: 'Name', keys: ['name'] },
        { header: 'Title', keys: ['title'] },
        { header: 'Description', keys: ['desc'] },
        { header: 'Active', keys: ['active'] },
        { header: 'Base URL', keys: ['basE_URL'] },
        { header: 'Login URL', keys: ['logiN_URL'] },
        { header: 'Created By', keys: ['createD_BY'] },
        { header: 'Created Date', keys: ['createD_DATETIME'] },
        { header: 'Updated By', keys: ['updateD_BY'] },
        { header: 'Updated Date', keys: ['updateD_DATETIME'] }
      ]
    });
  };

  const handleRefresh = () => setRefresh(prev => prev + 1)

  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false)
    handleRefresh()
  }

  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true)
      try {
        const response = await applicationApi.getApplications()
        setApplications(response)
      } catch (error) {
        console.error('Error fetching applications:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchApplications()
  }, [refresh])

  // const totalApplications = applications.length
  // const activeApplications = applications.filter(app =>
  //   getValue(app, ['active', 'Active', 'is_active', 'isActive', 'status']) === true
  // ).length
  // const inactiveApplications = totalApplications - activeApplications

  // const getLastUpdated = () => {
  //   if (applications.length === 0) return 'No data'

  //   const latestUpdate = applications.reduce((latest, app) => {
  //     const updatedDate = getValue(app, ['updateD_DATETIME', 'updatedDatetime', 'updated_datetime', 'updatedDate', 'updated_date'])
  //     const createdDate = getValue(app, ['createD_DATETIME', 'createdDatetime', 'created_datetime', 'createdDate', 'created_date'])
  //     const appDate = updatedDate || createdDate
  //     if (!appDate) return latest
  //     const appDateTime = new Date(appDate).getTime()
  //     const latestDateTime = latest ? new Date(latest).getTime() : 0
  //     return appDateTime > latestDateTime ? appDate : latest
  //   }, null)

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
    total: totalApplications,
    active: activeApplications,
    inactive: inactiveApplications,
    getLastUpdated,
  } = getStats({ data: applications as Application[] })

  return (
    <main className="min-h-screen">
      <div className="p-6">

        {/* Header: Title */}
        <div className="flex justify-between items-start mb-6 -mt-4 px-2">
          <div className="text-[var(--primary-color)] text-xl font-bold">
            APPLICATION&apos;S LIST
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
                title="Total Applications"
                value={totalApplications}
                icon={<Calculator className="text-white" size={20} />}
                bgColor="bg-[#005496] bg-opacity-10"
                delay={0}
              />
              <StatsCard
                title="Active Applications"
                value={activeApplications}
                bgColor="bg-green-100"
                pulseColor="bg-green-500"
                valueColor="text-green-600"
                delay={0.1}
              />
              <StatsCard
                title="Inactive Applications"
                value={inactiveApplications}
                bgColor="bg-red-100"
                pulseColor="bg-red-500"
                valueColor="text-red-600"
                delay={0.2}
              />
              <StatsCard
                title="Last Updated"
                value={getLastUpdated()}
                bgColor="bg-blue-100"
                pulseColor="bg-blue-500"
                valueColor="text-gray-900"
                delay={0.3}
              />
            </>
          )}
        </div>

        {/* Search Bar + Action Buttons */}
        <div className="flex items-center space-x-4 mb-6 px-2 justify-between"> {/* Added justify-between */}
          <motion.button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center space-x-2 bg-[var(--primary-color)] text-white px-6 py-2 rounded-lg shadow-lg cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Plus size={20} />
          </motion.button>

          <motion.button
            onClick={handleExport}
            className="flex items-center space-x-2 bg-gray-400 text-white px-6 py-2 rounded-lg shadow-lg cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <AiFillFileExcel size={20} />
          </motion.button>

          <div className="relative ml-auto"> {/* Added ml-auto to push search to the right */}
            <motion.div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <Search size={16} />
            </motion.div>
            <motion.input
              type="text"
              placeholder="Search Applications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005496] focus:border-[#005496] outline-none w-64 md:w-72 lg:w-80 transition-all duration-300 ease-in-out"
              whileFocus={{
                borderColor: "#005496",
                boxShadow: "0 0 0 2px rgba(0, 84, 150, 0.2)",
                width: "min(320px, 90vw)",
              }}
              whileHover={{ borderColor: "#005496" }}
            />
          </div>
        </div>

        {/* Table */}
        <ApplicationTable
          refreshSignal={refresh}
          onRefresh={handleRefresh}
          searchTerm={searchTerm}
        />

        {/* Modals */}
        <ApplicationCreateModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={handleCreateSuccess}
        />
        {/* <ApplicationEditModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={handleRefresh}
          editData={editData!}
        /> */}
      </div>
    </main>
  )
}