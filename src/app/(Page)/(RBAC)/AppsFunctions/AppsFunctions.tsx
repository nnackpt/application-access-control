"use client"

import React, { useState, useEffect } from "react"
import { Plus, Calculator, Search, Download, ChevronDown } from "lucide-react"
import AppsFunctionsTable from "@/Components/AppsFunctions/AppsFunctionsTable"
import { AppsFunctionsApi } from "@/services/AppsFunctionsApi"
import type { AppsFunctions } from "@/types/AppsFunctions"
import { applicationApi } from "@/services/ApplicationApi"
import { Application } from "@/types/Application"
import AppsFunctionsCreateModal from "@/Components/AppsFunctions/AppsFunctionsCreateModal"
import AppsFunctionsEditModal from "@/Components/AppsFunctions/AppsFunctionsEditModal"
import getValue from "@/Utils/getValue"

export default function AppsFunctions() {
  const [refresh, setRefresh] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editFunction, setEditFunction] = useState<AppsFunctions | null>(null)
  const [appsFunctions, setAppsFunctions] = useState<AppsFunctions[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedAppTitle, setSelectedAppTitle] = useState("all")
  const [applicationTitle, setApplicationTitle] = useState<Record<string, string>>({})
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editData, setEditData] = useState<AppsFunctions | null>(null)

  const handleExport = () => {
    try {
        const exportData = appsFunctions.map(func => ({
            'APP Code': getValue(func, ['apP_CODE', 'appCode', 'app_code', 'AppCode', 'APP_CODE']) || '',
            'FUNC Code': getValue(func, ['funC_CODE', 'funcCode', 'func_code', 'FuncCode', 'FUNC_CODE', 'code', 'id']) || '',
            'Name': getValue(func, ['name', 'Name', 'func_name', 'funcName']) || '',
            'Description': getValue(func, ['desc', 'description', 'Description', 'func_desc', 'funcDesc']) || '',
            'Active': getValue(func, ['active', 'Active', 'is_active', 'isActive', 'status']) ? 'Yes' : 'No',
            'Function URL': getValue(func, ['funC_URL', 'funcUrl', 'func_url', 'FuncUrl', 'FUNC_URL', 'url']) || '',
            'Created By': getValue(func, ['createD_BY', 'createdBy', 'created_by', 'CreatedBy', 'CREATED_BY', 'creator']) || '',
            'Created Date': getValue(func, ['createD_DATETIME', 'createdDatetime', 'created_datetime', 'createdDate', 'created_date']) || '',
            'Updated By': getValue(func, ['updateD_BY', 'updatedBy', 'updated_by', 'UpdatedBy', 'UPDATED_BY', 'modifier']) || '',
            'Updated Date': getValue(func, ['updateD_DATETIME', 'updatedDatetime', 'updated_datetime', 'updatedDate', 'updated_date']) || ''
        }))

        const headers = Object.keys(exportData[0] || {})
        const csvContent = [
            headers.join(','),
            ...exportData.map(row => headers.map(header => `"${(row as Record<string, any>)[header]}"`).join(','))
        ].join('\n')

        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', `Application_Functions_${new Date().toISOString().split('T')[0]}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
    } catch (error) {
        console.error('Error exporting data:', error)
        alert('Error exporting data. Please try again')
    }
  }

  const handleOpenCreateModal = () => {
    setEditFunction(null)
    setIsModalOpen(true)
  }

  const handleEditFunction = (func: AppsFunctions) => {
    setEditFunction(func)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setEditFunction(null)
  }

  const handleSuccess = () => {
    setIsModalOpen(false)
    setEditFunction(null)
    handleRefresh()
  }

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

        const TitlesMap: Record<string, string> = {}
        applicationsResponse.forEach((app: Application) => {
          const appCode = getValue(app, ['apP_CODE', 'appCode', 'app_code', 'AppCode', 'APP_CODE', 'code', 'id'])
          const appTitle = getValue(app, ['title', 'TITLE'])
          if (appCode && appTitle) {
            TitlesMap[appCode] = appTitle
          }
        })
        setApplicationTitle(TitlesMap)

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
  const totalFunctions = appsFunctions.length
  const activeFunctions = appsFunctions.filter(func => {
    const active = getValue(func, ['active', 'Active', 'is_active', 'isActive', 'status'])
    return active === true
  }).length
  const inactiveFunctions = totalFunctions - activeFunctions

  // นับจำนวน unique applications
  const uniqueAppTitles = Array.from(new Set(appsFunctions.map(func => {
    return getValue(func, ['apP_CODE', 'appCode', 'app_code', 'AppCode', 'APP_CODE'])
  }).filter(Boolean))) as (string | number)[]

  const sortedAppTitles = uniqueAppTitles.sort((a, b) => {
    const numA = parseFloat(String(a))
    const numB = parseFloat(String(b))
    
    if (!isNaN(numA) && !isNaN(numB)) {
      return numA - numB
    } else {
      return String(a).localeCompare(String(b))
    }
  })

  // หาวันที่ updated ล่าสุด
  const getLastUpdated = () => {
    if (appsFunctions.length === 0) return 'No data'
    
    const latestUpdate = appsFunctions.reduce((latest, func) => {
      const updatedDate = getValue(func, ['updateD_DATETIME', 'updatedDatetime', 'updated_datetime', 'updatedDate', 'updated_date'])
      const createdDate = getValue(func, ['createD_DATETIME', 'createdDatetime', 'created_datetime', 'createdDate', 'created_date'])
      
      const funcDate = updatedDate || createdDate
      if (!funcDate) return latest
      
      const funcDateTime = new Date(funcDate).getTime()
      const latestDateTime = latest ? new Date(latest).getTime() : 0
      
      return funcDateTime > latestDateTime ? funcDate : latest
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
                                    <span>Application's Function's</span>
                                </div>
                            </div>
                        </div>
                          
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="flex items-center space-x-2 bg-[#005496] text-white px-6 py-2 rounded-lg hover:bg-[#004080] transition-colors shadow-lg cursor-pointer"
                        >
                            <Plus size={20} />
                            <span>Create New Application's Function</span>
                        </button>

                        <button
                            onClick={handleExport}
                            className="flex items-center space-x-2 bg-gray-400 hover:bg-gray-500 text-white px-6 py-3 rounded-lg transition-colors shadow-lg cursor-pointer"
                        >
                            <Download size={20} />
                            <span>Export Application's Function</span>
                        </button>
                    </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="relative">
                    {/* Select for Application Title */}
                    <select
                        value={selectedAppTitle}
                        onChange={(e) => setSelectedAppTitle(e.target.value)}
                        className="cursor-pointer border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-[#005496] focus:border-[#005496] appearance-none outline-none"
                    >
                        <option value="all">All Applications</option>
                        {sortedAppTitles.map(appCode => (
                            <option key={appCode} value={appCode.toString()}>
                                {applicationTitle[appCode.toString()] || `Unknown App (${appCode})`}
                            </option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                  </div>

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                        <input 
                            type="text" 
                            placeholder="Search Functions..."
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
                <p className="text-sm font-medium text-gray-600">Total Functions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? '...' : totalFunctions}
                </p>
              </div>
              <div className="p-3 bg-[#005496] bg-opacity-10 rounded-lg">
                <Calculator className="text-[#005496] " size={20} />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Functions</p>
                <p className="text-2xl font-bold text-green-600">
                  {loading ? '...' : activeFunctions}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <div className="w-5 h-5 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Inactive Functions</p>
                <p className="text-2xl font-bold text-red-600">
                  {loading ? '...' : inactiveFunctions}
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <div className="w-5 h-5 bg-red-500 rounded-full animate-pulse"></div>
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
        <AppsFunctionsEditModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={handleRefresh} 
          editData={editData!}
        />
      </div>
    </main>
  )
}