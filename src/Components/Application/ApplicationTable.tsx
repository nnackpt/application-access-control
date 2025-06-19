import React, { useEffect, useState } from "react"
import { Eye, Edit, Trash2, ChevronDown, ChevronUp } from "lucide-react"
import { Application } from "@/types/Application"
import { applicationApi } from "@/services/applicationApi"
import ApplicationModal from "./ApplicationModal"
import ViewModal from "./ApplicationViewModal"

interface ApplicationTableProps {
  refreshSignal: number
  onRefresh: () => void
}

export default function ApplicationTable({ refreshSignal, onRefresh }: ApplicationTableProps) {
  const [data, setData] = useState<Application[]>([])
  const [loading, setLoading] = useState(false)
  const [viewData, setViewData] = useState<Application | null>(null)
  const [editData, setEditData] = useState<Application | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const response = await applicationApi.getApplications()
        console.log('API Response:', response)
        console.log('First item:', response[0])
        setData(response)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [refreshSignal])

  const handleView = (app: Application) => {
    setViewData(app)
    setIsViewModalOpen(true)
  }

  const handleEdit = (app: Application) => {
    setEditData(app)
    setIsEditModalOpen(true)
  }

  const handleDelete = async (app: Application) => {
    const appCode = getValue(app, ['appCode', 'apP_CODE', 'app_code', 'AppCode', 'APP_CODE', 'code', 'id'])
    if (!confirm(`Are you sure you want to delete application "${app.name}"?`)) {
      return
    }

    setDeleteLoading(appCode)
    try {
      await applicationApi.deleteApplication(appCode)
      onRefresh()
    } catch (error) {
      console.error('Error deleting application:', error)
    } finally {
      setDeleteLoading(null)
    }
  }

  const handleEditSuccess = () => {
    setEditData(null)
    setIsEditModalOpen(false)
    onRefresh()
  }

  const toggleRowExpansion = (appCode: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev)
      if (newSet.has(appCode)) {
        newSet.delete(appCode)
      } else {
        newSet.add(appCode)
      }
      return newSet
    })
  }

  // ฟังก์ชันสำหรับดึงค่าจาก object ที่อาจมีชื่อ property ต่างกัน
  const getValue = (obj: any, possibleKeys: string[]) => {
    for (const key of possibleKeys) {
      if (obj[key] !== undefined && obj[key] !== null) {
        return obj[key]
      }
    }
    return null
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    try {
      return new Date(dateString).toLocaleDateString('th-TH')
    } catch {
      return '-'
    }
  }

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return '-'
    try {
      return new Date(dateString).toLocaleString('th-TH', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return '-'
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#005496]"></div>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Desktop View */}
        <div className="hidden xl:block">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#005496] text-white">
                <tr>
                  {[
                    'APP Code', 'Name', 'Title', 'Description', 'Active', 
                    'Base URL', 'Login URL', 'Created By', 'Created Date', 
                    'Updated By', 'Updated Date', 'Actions'
                  ].map(header => (
                    <th key={header} className="px-3 py-3 text-left text-sm font-semibold whitespace-nowrap">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((app, index) => {
                  const appCode = getValue(app, ['apP_CODE', 'appCode', 'app_code', 'AppCode', 'APP_CODE', 'code', 'id'])
                  const name = getValue(app, ['name', 'Name', 'app_name', 'appName'])
                  const title = getValue(app, ['title', 'Title', 'app_title', 'appTitle'])
                  const desc = getValue(app, ['desc', 'description', 'Description', 'app_desc', 'appDesc'])
                  const active = getValue(app, ['active', 'Active', 'is_active', 'isActive', 'status'])
                  const baseUrl = getValue(app, ['basE_URL', 'baseUrl', 'base_url', 'BaseUrl', 'BASE_URL', 'url'])
                  const loginUrl = getValue(app, ['logiN_URL', 'loginUrl', 'login_url', 'LoginUrl', 'LOGIN_URL'])
                  const createdBy = getValue(app, ['createD_BY', 'createdBy', 'created_by', 'CreatedBy', 'CREATED_BY', 'creator'])
                  const createdDate = getValue(app, ['createD_DATETIME', 'createdDatetime', 'created_datetime', 'createdDate', 'created_date', 'CreatedDate', 'CREATED_DATE', 'createDate'])
                  const updatedBy = getValue(app, ['updateD_BY', 'updatedBy', 'updated_by', 'UpdatedBy', 'UPDATED_BY', 'modifier'])
                  const updatedDate = getValue(app, ['updateD_DATETIME', 'updatedDatetime', 'updated_datetime', 'updatedDate', 'updated_date', 'UpdatedDate', 'UPDATED_DATE', 'updateDate'])

                  return (
                    <tr key={`${appCode || index}-${index}`} className="border-b border-gray-200 hover:bg-blue-50 transition-colors">
                      <td className="px-3 py-3 font-medium text-[#005496] text-sm">{appCode || '-'}</td>
                      <td className="px-3 py-3 font-medium text-sm">{name || '-'}</td>
                      <td className="px-3 py-3 text-sm">{title || '-'}</td>
                      <td className="px-3 py-3 text-sm max-w-[150px]">
                        <div className="truncate" title={desc || ''}>
                          {desc || '-'}
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-sm max-w-[120px]">
                        {baseUrl ? (
                          <a 
                            href={baseUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#005496] hover:underline truncate block"
                            title={baseUrl}
                          >
                            {baseUrl.length > 15 ? `${baseUrl.substring(0, 15)}...` : baseUrl}
                          </a>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-3 py-3 text-sm max-w-[120px]">
                        {loginUrl ? (
                          loginUrl.startsWith('http://') || loginUrl.startsWith('https://') ? (
                          <a
                            href={loginUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#005496] hover:underline truncate block"
                            title={loginUrl}
                          >
                            {loginUrl.length > 15 ? `${loginUrl.substring(0, 15)}...` : loginUrl}
                          </a>
                        ) : (
                          <div className="truncate" title={loginUrl}>
                            {loginUrl.length > 15 ? `${loginUrl.substring(0, 15)}...` : loginUrl}
                          </div>
                        )
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-3 py-3 text-sm">{createdBy || '-'}</td>
                      <td className="px-3 py-3 whitespace-nowrap text-sm">
                        {formatDateTime(createdDate)}
                      </td>
                      <td className="px-3 py-3 text-sm">{updatedBy || '-'}</td>
                      <td className="px-3 py-3 whitespace-nowrap text-sm">
                        {formatDateTime(updatedDate)}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleView(app)}
                            className="cursor-pointer p-2 text-[#005496] hover:text-[#004080] hover:bg-blue-100 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => handleEdit(app)}
                            className="cursor-pointer p-2 text-green-600 hover:text-green-800 hover:bg-green-100 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(app)}
                            className="cursor-pointer p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                            title="Delete"
                            disabled={deleteLoading === appCode}
                          >
                            {deleteLoading === appCode ? (
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600"></div>
                            ) : (
                              <Trash2 size={14} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile & Tablet View - Card Layout */}
        <div className="xl:hidden">
          {data.map((app, index) => {
            const appCode = getValue(app, ['apP_CODE', 'appCode', 'app_code', 'AppCode', 'APP_CODE', 'code', 'id'])
            const name = getValue(app, ['name', 'Name', 'app_name', 'appName'])
            const title = getValue(app, ['title', 'Title', 'app_title', 'appTitle'])
            const desc = getValue(app, ['desc', 'description', 'Description', 'app_desc', 'appDesc'])
            const active = getValue(app, ['active', 'Active', 'is_active', 'isActive', 'status'])
            const baseUrl = getValue(app, ['basE_URL', 'baseUrl', 'base_url', 'BaseUrl', 'BASE_URL', 'url'])
            const loginUrl = getValue(app, ['logiN_URL', 'loginUrl', 'login_url', 'LoginUrl', 'LOGIN_URL'])
            const createdBy = getValue(app, ['createD_BY', 'createdBy', 'created_by', 'CreatedBy', 'CREATED_BY', 'creator'])
            const createdDate = getValue(app, ['createD_DATETIME', 'createdDatetime', 'created_datetime', 'createdDate', 'created_date', 'CreatedDate', 'CREATED_DATE', 'createDate'])
            const updatedBy = getValue(app, ['updateD_BY', 'updatedBy', 'updated_by', 'UpdatedBy', 'UPDATED_BY', 'modifier'])
            const updatedDate = getValue(app, ['updateD_DATETIME', 'updatedDatetime', 'updated_datetime', 'updatedDate', 'updated_date', 'UpdatedDate', 'UPDATED_DATE', 'updateDate'])
            
            const isExpanded = expandedRows.has(appCode)

            return (
              <div key={`${appCode || index}-${index}`} className="border-b border-gray-200 p-4 hover:bg-blue-50 transition-colors">
                {/* Main Card Content */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-sm font-semibold text-[#005496] bg-blue-50 px-2 py-1 rounded">
                        {appCode || '-'}
                      </span>
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <h3 className="font-medium text-gray-900 truncate">{name || '-'}</h3>
                    <p className="text-sm text-gray-600 truncate">{title || '-'}</p>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => toggleRowExpansion(appCode)}
                      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2 mb-3">
                  <button
                    onClick={() => handleView(app)}
                    className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 text-[#005496] hover:text-[#004080] hover:bg-blue-100 rounded-lg transition-colors text-sm"
                  >
                    <Eye size={14} />
                    <span>View</span>
                  </button>
                  <button
                    onClick={() => handleEdit(app)}
                    className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 text-green-600 hover:text-green-800 hover:bg-green-100 rounded-lg transition-colors text-sm"
                  >
                    <Edit size={14} />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(app)}
                    className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50 text-sm"
                    disabled={deleteLoading === appCode}
                  >
                    {deleteLoading === appCode ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                    ) : (
                      <Trash2 size={14} />
                    )}
                    <span>Delete</span>
                  </button>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-gray-200 space-y-3">
                    <div className="grid grid-cols-1 gap-3 text-sm">
                      <div>
                        <span className="font-medium text-gray-600">Description:</span>
                        <p className="text-gray-900 mt-1">{desc || '-'}</p>
                      </div>
                      
                      <div>
                        <span className="font-medium text-gray-600">Base URL:</span>
                        <div className="mt-1">
                          {baseUrl ? (
                            <a 
                              href={baseUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#005496] hover:underline break-all"
                            >
                              {baseUrl}
                            </a>
                          ) : (
                            <span className="text-gray-500">-</span>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <span className="font-medium text-gray-600">Login URL:</span>
                        <div className="mt-1">
                          {loginUrl ? (
                            loginUrl.startsWith('http://') || loginUrl.startsWith('https://') ? (
                              <a
                                href={loginUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#005496] hover:underline break-all"
                              >
                                {loginUrl}
                              </a>
                            ) : (
                              <span className="text-gray-900 break-all">{loginUrl}</span>
                            )
                          ) : (
                            <span className="text-gray-500">-</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="font-medium text-gray-600">Created By:</span>
                          <p className="text-gray-900">{createdBy || '-'}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Updated By:</span>
                          <p className="text-gray-900">{updatedBy || '-'}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-2">
                        <div>
                          <span className="font-medium text-gray-600">Created:</span>
                          <p className="text-gray-900">{formatDateTime(createdDate)}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Updated:</span>
                          <p className="text-gray-900">{formatDateTime(updatedDate)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
        
        {data.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-500">
            <div className="text-gray-400 mb-2">
              <Eye size={48} className="mx-auto" />
            </div>
            <p>No applications found</p>
          </div>
        )}
      </div>

      <ViewModal 
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        data={viewData}
      />

      <ApplicationModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={handleEditSuccess}
        editData={editData}
      />
    </>
  )
}