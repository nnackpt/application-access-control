import React, { useEffect, useState } from "react"
import { Eye, Edit, Trash2, ChevronDown, ChevronUp } from "lucide-react"
import { Application } from "@/types/Application"
import { applicationApi } from "@/services/applicationApi"
import ViewModal from "./ApplicationViewModal"
import ApplicationEditModal from "./ApplicationEditModal"
import DeleteConfirmModal from "../UI/DeleteConfirmModal"
import toast, { Toaster } from "react-hot-toast"
import getValue from "@/Utils/getValue"
import formatDateTime from "@/Utils/formatDateTime"
import Pagination from "../UI/Pagination"

interface ApplicationTableProps {
  refreshSignal: number
  onRefresh: () => void
  searchTerm: string
}

export default function ApplicationTable({ refreshSignal, onRefresh, searchTerm }: ApplicationTableProps) {
  const [data, setData] = useState<Application[]>([])
  const [loading, setLoading] = useState(false)
  const [viewData, setViewData] = useState<Application | null>(null)
  const [editData, setEditData] = useState<Application | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [deleteModal, setDeleteModal] = useState<{app: Application|null, open: boolean}>({app: null, open: false})
  const [deleteSuccess, setDeleteSuccess] = useState(false)

  const getPaginatedData = () => {
    const startIndex = (currentPage - 1) * rowsPerPage
    const endIndex = startIndex + rowsPerPage
    return rowsPerPage === 0 ? filteredData : filteredData.slice(startIndex, endIndex)
  }

  const getTotalPages = () => {
    return rowsPerPage === 0 ? 1 : Math.ceil(filteredData.length / rowsPerPage)
  }

  const getDisplayInfo = () => {
    if (filteredData.length === 0) return "Showing 0 of 0 Records"

    if (rowsPerPage === 0) {
      return `Showing 1 to ${filteredData.length} of ${filteredData.length} Records`
    }

    const startIndex = (currentPage - 1) * rowsPerPage + 1
    const endIndex = Math.min(currentPage * rowsPerPage, filteredData.length)
    return `Showing ${startIndex} to ${endIndex} of ${filteredData.length} Records`
  }

  const handleRowsPerPageChange = (value: number) => {
    setRowsPerPage(value)
    setCurrentPage(1)
  }

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const response = await applicationApi.getApplications()
        console.log('API Response:', response)
        console.log('First item:', response[0])
        
        const sortedResponse = [...response].sort((a, b) => {
          const appCodeA = getValue(a, ['apP_CODE', 'appCode', 'app_code', 'AppCode', 'APP_CODE']) || ''
          const appCodeB = getValue(b, ['apP_CODE', 'appCode', 'app_code', 'AppCode', 'APP_CODE']) || ''
          return appCodeA.localeCompare(appCodeB)
        })
        
        setData(sortedResponse)
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
    setDeleteModal({app, open: true})
  }

  const confirmDelete = async () => {
    if (!deleteModal.app) return
    const app = deleteModal.app
    const appCode = getValue(app, ['appCode', 'app_code', 'AppCode', 'APP_CODE', 'APP_Code', 'apP_CODE', 'code', 'id']) || ''
    if (!appCode) {
      toast.error('Invalid application code')
      return
    }
    setDeleteLoading(appCode)
    try {
      console.log('appCode for delete:', appCode)
      await applicationApi.deleteApplication(appCode)
      setDeleteModal({ app: null, open: false })
      toast.success('Successfully Delete!')
      setDeleteSuccess(true)
      onRefresh()
      setTimeout(() => setDeleteSuccess(false), 2000)
    } catch (error) {
      toast.error("This didn't work.")
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

  const filteredData = data.filter(app => {
    const appCode = getValue(app, ['apP_CODE', 'appCode', 'app_code', 'AppCode', 'APP_CODE']) || ''
    const name = getValue(app, ['name', 'Name', 'app_name', 'appName']) || ''
    const title = getValue(app, ['title', 'Title', 'app_title', 'appTitle']) || ''
    const desc = getValue(app, ['desc', 'description', 'Description', 'app_desc', 'appDesc']) || ''
    const baseUrl = getValue(app, ['basE_URL', 'baseUrl', 'base_url', 'BaseUrl', 'BASE_URL', 'url']) || ''
    const loginUrl = getValue(app, ['logiN_URL', 'loginUrl', 'login_url', 'LoginUrl', 'LOGIN_URL']) || ''
    const createdBy = getValue(app, ['createD_BY', 'createdBy', 'created_by', 'CreatedBy', 'CREATED_BY', 'creator']) || ''
    const updatedBy = getValue(app, ['updateD_BY', 'updatedBy', 'updated_by', 'UpdatedBy', 'UPDATED_BY', 'modifier']) || ''

    const matchesSearchTerm = searchTerm.toLowerCase()

    const textMatches = (
      appCode.toLowerCase().includes(matchesSearchTerm) ||
      name.toLowerCase().includes(matchesSearchTerm) ||
      title.toLowerCase().includes(matchesSearchTerm) ||
      desc.toLowerCase().includes(matchesSearchTerm) ||
      baseUrl.toLowerCase().includes(matchesSearchTerm) ||
      loginUrl.toLowerCase().includes(matchesSearchTerm) ||
      createdBy.toLowerCase().includes(matchesSearchTerm) ||
      updatedBy.toLowerCase().includes(matchesSearchTerm)
    )

    return textMatches
  })

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#005496]"></div>
      </div>
    )
  }

  return (
    <>
    <Toaster
      position="bottom-center"
      reverseOrder={false}
    />
      <div className="bg-white rounded-lg p-4 mb-4 shadow-sm border border-gray-200">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Display</span>
              <select
                value={rowsPerPage}
                onChange={(e) => handleRowsPerPageChange(Number(e.target.value))}
                className="border border-gray-300 rounded px-3 py-1 text-sm focus:ring-2 focus:ring-[#005496] focus:border-[#005496] outline-none"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={0}>ALL</option>
              </select>
              <span className="text-sm text-gray-600">Records</span>
            </div>
            <div className="text-sm text-gray-600">
              {getDisplayInfo()}
            </div>
          </div>

          {/* Pagination Buttons */}
          {rowsPerPage > 0 && getTotalPages() > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={getTotalPages()}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      </div>

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
                {getPaginatedData().map((app, index) => {
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
                        <div className="whitespace-pre-wrap" title={desc || ''}>
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
                          baseUrl.startsWith('http://') || baseUrl.startsWith('https://') ? (
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
                            <div className="truncate" title={baseUrl}>
                              {baseUrl.length > 15 ? `${baseUrl.substring(0, 15)}...` : baseUrl}
                            </div>
                          )
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
                            className="cursor-pointer flex items-center justify-center w-8 h-8 rounded-full border-3 border-gray-300 bg-transparent text-[#005496] hover:border-[#005496] hover:bg-blue-50 hover:text-[#004080] transition-colors transform hover:scale-110 transition-transform duration-200"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleEdit(app)}
                            className="cursor-pointer flex items-center justify-center w-8 h-8 rounded-full border-3 border-gray-300 bg-transparent text-green-600 hover:border-green-800 hover:bg-blue-50 hover:text-green-800 transition-colors transform hover:scale-110 transition-transform duration-200"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(app)}
                            className="cursor-pointer flex items-center justify-center w-8 h-8 rounded-full border-3 border-gray-300 bg-transparent text-red-600 hover:border-red-800 hover:bg-blue-50 hover:text-red-800 transition-colors disabled:opacity-50 transform hover:scale-110 transition-transform duration-200"
                            title="Delete"
                            disabled={deleteLoading === appCode}
                          >
                            {deleteLoading === appCode ? (
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600"></div>
                            ) : (
                              <Trash2 size={16} />
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
          {getPaginatedData().map((app, index) => {
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
                    <Eye size={20} />
                    <span>View</span>
                  </button>
                  <button
                    onClick={() => handleEdit(app)}
                    className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 text-green-600 hover:text-green-800 hover:bg-green-100 rounded-lg transition-colors text-sm"
                  >
                    <Edit size={20} />
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
                      <Trash2 size={20} />
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
                            baseUrl.startsWith('http://') || baseUrl.startsWith('https://') ? (
                              <a 
                                href={baseUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#005496] hover:underline break-all"
                              >
                                {baseUrl}
                              </a>
                            ) : (
                              <span className="text-gray-900 break-all">{baseUrl}</span>
                            )
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
        
        {filteredData.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-500">
            <div className="text-gray-400 mb-2">
              <Eye size={48} className="mx-auto" />
            </div>
            <p>{searchTerm ? `No applications found matching your criteria` : 'No applications found'}</p>
          </div>
        )}
      </div>

      <ViewModal 
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        data={viewData}
      />

      <ApplicationEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={handleEditSuccess}
        editData={editData!}
      />

      <DeleteConfirmModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({app: null, open: false})}
        onConfirm={confirmDelete}
        appName={deleteModal.app ? getValue(deleteModal.app, ['title', 'TITLE', 'Title', 'appName']) || '' : ''}
        loading={!!deleteLoading}
      />

      {deleteSuccess && (
        <Toaster
          position="bottom-center"
          reverseOrder={false}
        />
      )}
    </>
  )
}