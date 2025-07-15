"use client"

import React, { useState, useEffect } from "react"
import { Calculator, Download, Plus, Search, Settings } from "lucide-react"
import ApplicationTable from "@/Components/Application/ApplicationTable"
import { applicationApi } from "@/services/ApplicationApi"
import { Application } from "@/types/Application"
import ApplicationCreateModal from "@/Components/Application/ApplicationCreateModal"
import ApplicationEditModal from "@/Components/Application/ApplicationEditModal"
import getValue from "@/Utils/getValue"
import { motion } from 'framer-motion';
import StatsCard from "@/Components/UI/StatsCard"
import 'react-loading-skeleton/dist/skeleton.css'
import Skeleton from 'react-loading-skeleton'

export default function Applications() {
  const [refresh, setRefresh] = useState(0)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editData, setEditData] = useState<Application | null>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const handleExport = () => {
    try {
        const exportData = applications.map(app => ({
            'APP Code': getValue(app, ['apP_CODE', 'appCode', 'app_code', 'AppCode', 'APP_CODE']) || '',
            'Name': getValue(app, ['name', 'Name', 'func_name', 'funcName']) || '',
            'Title': getValue(app, ['title', 'TITLE', 'Title']) || '',
            'Description': getValue(app, ['desc', 'description', 'Description', 'func_desc', 'funcDesc']) || '',
            'Active': getValue(app, ['active', 'Active', 'is_active', 'isActive', 'status']) ? 'Yes' : 'No',
            'Base URL': getValue(app, ['base_URL', 'baseUrl', 'baseURL', 'base_url', 'BaseURL', 'BASE_URL']) || '',
            'Login URL': getValue(app, ['login_URL', 'loginURL', 'login_url', 'LoginURL', 'LOGIN_URL', 'loginUrl']) || '',
            'Created By': getValue(app, ['createD_BY', 'createdBy', 'created_by', 'CreatedBy', 'CREATED_BY', 'creator']) || '',
            'Created Date': getValue(app, ['createD_DATETIME', 'createdDatetime', 'created_datetime', 'createdDate', 'created_date']) || '',
            'Updated By': getValue(app, ['updateD_BY', 'updatedBy', 'updated_by', 'UpdatedBy', 'UPDATED_BY', 'modifier']) || '',
            'Updated Date': getValue(app, ['updateD_DATETIME', 'updatedDatetime', 'updated_datetime', 'updatedDate', 'updated_date']) || ''
        }))

        const headers = Object.keys(exportData[0] || {})
        const csvContent = [ // @ts-ignore
            headers.map(header => `"${header}"`).join(','),
            ...exportData.map(row => headers.map(header => `"${row[header as keyof typeof row]}"`).join(','))
        ].join('\n')

        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', `Application_${new Date().toISOString().split('T')[0]}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
    } catch (error) {
        console.error('Error exporting data:', error)
        alert('Error exporting data. Please try again')
    }
  }

  // ดึงข้อมูลสำหรับ stats
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

  const handleRefresh = () => {
    setRefresh(prev => prev + 1)
  }

  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false)
    handleRefresh()
  }

  // คำนวณ stats จากข้อมูล applications
  const totalApplications = applications.length
  const activeApplications = applications.filter(app => {
    const active = getValue(app, ['active', 'Active', 'is_active', 'isActive', 'status'])
    return active === true
  }).length
  const inactiveApplications = totalApplications - activeApplications

  // หาวันที่ updated ล่าสุด
  const getLastUpdated = () => {
    if (applications.length === 0) return 'No data'
    
    const latestUpdate = applications.reduce((latest, app) => {
      const updatedDate = getValue(app, ['updateD_DATETIME', 'updatedDatetime', 'updated_datetime', 'updatedDate', 'updated_date'])
      const createdDate = getValue(app, ['createD_DATETIME', 'createdDatetime', 'created_datetime', 'createdDate', 'created_date'])
      
      const appDate = updatedDate || createdDate
      if (!appDate) return latest
      
      const appDateTime = new Date(appDate).getTime()
      const latestDateTime = latest ? new Date(latest).getTime() : 0
      
      return appDateTime > latestDateTime ? appDate : latest
    }, null)

    if (!latestUpdate) return 'No data'
    
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
          {loading ? (
            <div className="flex justify-between items-center">
              {/* Skeleton ฝั่งซ้าย */}
              <div className="flex space-x-3">
                <Skeleton height={40} width={200} borderRadius={8} />
                <Skeleton height={40} width={160} borderRadius={8} />
                <Skeleton height={40} width={200} borderRadius={8} />
              </div>

              {/* Skeleton Search */}
              <Skeleton height={40} width={200} borderRadius={8} />
            </div>
          ) : (
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <div className="flex space-x-3">
                  {/* Title */}
                  <div className="bg-[#005496] rounded-lg shadow-lg p-[3px]">
                    <div className="bg-[#FBFCFD] rounded-lg p-[3px]">
                      <div className="bg-[#009EE3] text-white px-4 py-2 rounded-lg flex items-center justify-center">
                        <span>Applications List</span>
                      </div>
                    </div>
                  </div>

                  {/* ปุ่ม Create */}
                  <motion.button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center space-x-2 bg-[#005496] text-white px-6 py-2 rounded-lg shadow-lg cursor-pointer"
                    whileHover={{ scale: 1.05, backgroundColor: "#004080", boxShadow: "0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)" }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <Plus size={20} />
                    <span>Create New Application's</span>
                  </motion.button>

                  {/* ปุ่ม Export */}
                  <motion.button
                    onClick={handleExport}
                    className="flex items-center space-x-2 bg-gray-400 text-white px-6 py-2 rounded-lg shadow-lg cursor-pointer"
                    whileHover={{ scale: 1.05, backgroundColor: "#6B7280", boxShadow: "0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)" }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <Download size={20} />
                    <span>Export Application's</span>
                  </motion.button>
                </div>
              </div>

              {/* Search */}
              <div className="flex items-center space-x-3">
                <div className="relative">
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
            </div>
          )}
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
                value={loading ? '...' : totalApplications}
                icon={<Calculator className="text-white" size={20} />}
                bgColor="bg-[#005496] bg-opacity-10"
                delay={0}
              />

              <StatsCard
                title=" Active Applications"
                value={loading ? '...' : activeApplications}
                bgColor="bg-green-100"
                pulseColor="bg-green-500"
                valueColor="text-green-600"
                delay={0.1}
              />
              
              <StatsCard
                title="Inactive Applications"
                value={loading ? '...' : inactiveApplications}
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

        {/* Table */}
        <ApplicationTable 
          refreshSignal={refresh} 
          onRefresh={handleRefresh}
          searchTerm={searchTerm}
        />

        {/* Create/Edit Modal */}
        <ApplicationCreateModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={handleCreateSuccess} 
        />
        <ApplicationEditModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={handleRefresh}
          editData={editData!} 
        />
      </div>
    </main>
  )
}