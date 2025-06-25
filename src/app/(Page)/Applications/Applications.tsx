"use client"

import React, { useState, useEffect } from "react"
import { Download, Plus, Search, Settings } from "lucide-react"
import ApplicationTable from "@/Components/Application/ApplicationTable"
import { applicationApi } from "@/services/applicationApi"
import { Application } from "@/types/Application"
import ApplicationCreateModal from "@/Components/Application/ApplicationCreateModal"
import ApplicationEditModal from "@/Components/Application/ApplicationEditModal"

export default function Applications() {
  const [refresh, setRefresh] = useState(0)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editData, setEditData] = useState<Application | null>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  // ฟังก์ชันสำหรับดึงค่าจาก object ที่อาจมีชื่อ property ต่างกัน
  const getValue = (obj: any, possibleKeys: string[]) => {
    for (const key of possibleKeys) {
      if (obj[key] !== undefined && obj[key] !== null) {
        return obj[key]
      }
    }
    return null
  }

  // const handleOpenCreate = () => setIsCreateModalOpen(true)
  // const handleOpenEdit = (app: Application) => {
  //   setEditData(app)
  //   setIsEditModalOpen(true)
  // }

  const handleExport = () => {
    try {
        const exportData = applications.map(app => ({
            'APP Code': getValue(app, ['apP_CODE', 'appCode', 'app_code', 'AppCode', 'APP_CODE']) || '',
            'Name': getValue(app, ['name', 'Name', 'func_name', 'funcName']) || '',
            'Title': getValue(app, ['title', 'TITLE']) || '',
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
        const csvContent = [
            headers.join(','),
            ...exportData.map(row => headers.map(header => `"${row[header]}"`).join(','))
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
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="flex space-x-3">

                <div className="bg-[#005496] rounded-lg shadow-lg p-[3px]"> {/* ชั้นที่ 1: สีน้ำเงินเข้ม #005496 (ด้านหลังสุด) */}
                    <div className="bg-[#FBFCFD] rounded-lg p-[3px]"> {/* ชั้นที่ 2: สีขาว #FBFCFD (ชั้นกลาง) */}
                        <div className="bg-[#009EE3] text-white px-4 py-2 rounded-lg flex items-center justify-center"> {/* ชั้นที่ 3: สีน้ำเงิน #009EE3 (ชั้นบนสุดพร้อมข้อความ) */}
                            <span>Applications List</span>
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center space-x-2 bg-[#005496] text-white px-6 py-2 rounded-lg hover:bg-[#004080] transition-colors shadow-lg cursor-pointer"
                >
                    <Plus size={20} />
                    <span>Create New Application's</span>
                </button>

                <button
                    onClick={handleExport}
                    className="flex items-center space-x-2 bg-gray-400 hover:bg-gray-500 text-white px-6 py-3 rounded-lg transition-colors shadow-lg cursor-pointer"
                >
                    <Download size={20} />
                    <span>Export Application's</span>
                </button>
              </div>
            </div>

            <div className="flex ites-center space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Search Applications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005496] focus:border-[#005496] outline-none w-64"  
                />
              </div>
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
                <p className="text-sm font-medium text-gray-600">Active Applications</p>
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
                <p className="text-sm font-medium text-gray-600">Inactive Applications</p>
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