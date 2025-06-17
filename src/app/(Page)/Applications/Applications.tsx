"use client"

import React, { useState, useEffect } from "react"
import { Plus, RefreshCcw, Settings } from "lucide-react"
import ApplicationTable from "@/Components/Application/ApplicationTable"
import ApplicationModal from "@/Components/Application/ApplicationModal"
import { applicationApi } from "@/services/applicationApi"
import { Application } from "@/types/Application"

export default function Applications() {
  const [refresh, setRefresh] = useState(0)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(false)

  // ฟังก์ชันสำหรับดึงค่าจาก object ที่อาจมีชื่อ property ต่างกัน
  const getValue = (obj: any, possibleKeys: string[]) => {
    for (const key of possibleKeys) {
      if (obj[key] !== undefined && obj[key] !== null) {
        return obj[key]
      }
    }
    return null
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
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-[#005496] rounded-lg">
                  <Settings className="text-white" size={24} />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">Application Management</h1>
              </div>
              <p className="text-gray-600">Manage your applications and their configurations</p>
              <div className="mt-4 flex space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-100 border border-green-300 rounded-full"></div>
                  <span>Active Applications</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-100 border border-red-300 rounded-full"></div>
                  <span>Inactive Applications</span>
                </div>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleRefresh}
                className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                disabled={loading}
              >
                <RefreshCcw size={16} className={loading ? 'animate-spin' : ''} />
                <span>Refresh</span>
              </button>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center space-x-2 bg-[#005496] text-white px-6 py-3 rounded-lg hover:bg-[#004080] transition-colors shadow-lg cursor-pointer"
              >
                <Plus size={20} />
                <span>Create New Application</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Applications</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? '...' : totalApplications}
                </p>
              </div>
              <div className="p-3 bg-[#005496] bg-opacity-10 rounded-lg">
                <Settings className="text-[#005496]" size={20} />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">
                  {loading ? '...' : activeApplications}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <div className="w-5 h-5 bg-green-500 rounded-full"></div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Inactive</p>
                <p className="text-2xl font-bold text-red-600">
                  {loading ? '...' : inactiveApplications}
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <div className="w-5 h-5 bg-red-500 rounded-full"></div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Last Updated</p>
                <p className="text-lg font-semibold text-gray-900">
                  {loading ? '...' : getLastUpdated()}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <div className="w-5 h-5 bg-blue-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <ApplicationTable 
          refreshSignal={refresh} 
          onRefresh={handleRefresh}
        />

        {/* Create Modal */}
        <ApplicationModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={handleCreateSuccess}
        />
      </div>
    </main>
  )
}