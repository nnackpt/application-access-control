import { AppsFunctionsApi } from "@/services/AppsFunctionsApi"
import { AppsFunctions } from "@/types/AppsFunctions"
import React, { useEffect, useState } from "react"
import ViewModal from "./AppsFunctionsViewModal"
import { ChevronDown, ChevronUp, Edit, Eye, Trash2 } from "lucide-react"
import toast, { Toaster } from "react-hot-toast"
import AppsFunctionsEditModal from "./AppsFunctionsEditModal"
import DeleteConfirmModal from "../UI/DeleteConfirmModal"
import getValue from "@/Utils/getValue"
import formatDateTime from "@/Utils/formatDateTime"
import Pagination from "../UI/Pagination"
import RowsPerPageSelect from "../UI/Select/RowsPerPageSelect"
import Skeleton from 'react-loading-skeleton'

interface AppsFunctionsTableProps {
    refreshSignal: number
    onRefresh: () => void
    searchTerm: string
    selectedTitle: string 
}

export default function AppsFunctionsTable({ refreshSignal, onRefresh, searchTerm, selectedTitle }: AppsFunctionsTableProps) {
    const [data, setData] = useState<AppsFunctions[]>([])
    const [loading, setLoading] = useState(false)
    const [viewData, setViewData] = useState<AppsFunctions | null>(null)
    const [editData, setEditData] = useState<AppsFunctions | null>(null)
    const [isViewModalOpen, setIsViewModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [deleteLoading, setDeleteLoading] = useState<string | null>(null)
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
    const [deleteModal, setDeleteModal] = useState<{appFunc: AppsFunctions|null, open: boolean}>({appFunc: null, open: false})
    const [deleteSuccess, setDeleteSuccess] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(10)

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
    }, [searchTerm, selectedTitle]) 

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            try {
                const response = await AppsFunctionsApi.getAppsFunctions()
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

    const handleView = (appFunc: AppsFunctions) => {
        setViewData(appFunc)
        setIsViewModalOpen(true)
    }

    const handleEdit = (appFunc: AppsFunctions) => {
        setEditData(appFunc)
        setIsEditModalOpen(true)
    }

    const handleDelete = async (appFunc: AppsFunctions) => {
        setDeleteModal({ appFunc, open: true })
    }

    const confirmDelete = async () => {
        if (!deleteModal.appFunc) return
        const appFunc = deleteModal.appFunc
        const funcCode = getValue(appFunc, ['funcCode', 'funC_CODE', 'func_code', 'FuncCode', 'FUNC_CODE', 'code', 'id']) || ''
        if (!funcCode) {
            toast.error('Invalid function code')
            return
        }
        setDeleteLoading(funcCode)
        try {
            console.log('Deleting function with code:', funcCode)
            await AppsFunctionsApi.deleteAppsFunctions(funcCode)
            setDeleteModal({ appFunc: null, open: false })
            toast.success('Function deleted successfully')
            setDeleteSuccess(true)
            onRefresh()
        } catch (error) {
            toast.error('Error deleting function')
            console.error('Error deleting function:', error)
        } finally {
            setDeleteLoading(null)
        }
    }

    const handleEditSuccess = () => {
        setEditData(null)
        setIsEditModalOpen(false)
        onRefresh()
    }

    const toggleRowExpansion = (funcCode: string) => {
        setExpandedRows(prev => {
            const newSet = new Set(prev)
            if (newSet.has(funcCode)) {
                newSet.delete(funcCode)
            } else {
                newSet.add(funcCode)
            }
            return newSet
        })
    }

    const filteredData = data.filter(appFunc => {
        const appCode = getValue(appFunc, ['apP_CODE', 'appCode', 'app_code', 'AppCode', 'APP_CODE']) || ''
        const funcCode = getValue(appFunc, ['funC_CODE', 'funcCode', 'func_code', 'FuncCode', 'FUNC_CODE', 'code', 'id']) || ''
        const name = getValue(appFunc, ['name', 'Name', 'func_name', 'funcName']) || ''
        const desc = getValue(appFunc, ['desc', 'description', 'Description', 'func_desc', 'funcDesc']) || ''
        const funcUrl = getValue(appFunc, ['funC_URL', 'funcUrl', 'func_url', 'FuncUrl', 'FUNC_URL', 'url']) || ''
        const createdBy = getValue(appFunc, ['createD_BY', 'createdBy', 'created_by', 'CreatedBy', 'CREATED_BY', 'creator']) || ''
        const updatedBy = getValue(appFunc, ['updateD_BY', 'updatedBy', 'updated_by', 'UpdatedBy', 'UPDATED_BY', 'modifier']) || ''

        const matchesSearchTerm = searchTerm.toLowerCase()
        const appCodeMatches = selectedTitle === "all" || appCode.toLowerCase() === selectedTitle.toLowerCase()

        const textMatches = (
            appCode.toLowerCase().includes(matchesSearchTerm) ||
            funcCode.toLowerCase().includes(matchesSearchTerm) ||
            name.toLowerCase().includes(matchesSearchTerm) ||
            desc.toLowerCase().includes(matchesSearchTerm) ||
            funcUrl.toLowerCase().includes(matchesSearchTerm) ||
            createdBy.toLowerCase().includes(matchesSearchTerm) ||
            updatedBy.toLowerCase().includes(matchesSearchTerm)
        )

        return appCodeMatches && textMatches
    })

    if (loading) {
    return (
        <div className="space-y-3">
        {[...Array(10)].map((_, i) => (
            <Skeleton key={i} height={40} borderRadius={8} />
        ))}
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
                            <RowsPerPageSelect
                                rowsPerPage={rowsPerPage}
                                setRowsPerPage={handleRowsPerPageChange}
                                isLoading={loading}
                            />
                            <span className="text-sm text-gray-600">Records</span>
                        </div>
                        <div className="text-sm text-gray-600">
                            {getDisplayInfo()}
                        </div>
                    </div>

                    {/* Pageination Btn */}
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
                                        'APP Code','FUNC Code', 'Name', 'Description', 'Active',
                                        'Function URL', 'Created By', 'Created Date',
                                        'Updated By', 'Updated Date', 'Actions'
                                    ].map(header => (
                                        <th key={header} className="px-3 py-3 text-left text-sm font-semibold whitespace-nowrap">
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {/* Table rows */}
                                {getPaginatedData().map((appFunc, index) => {
                                    const appCode = getValue(appFunc, ['apP_CODE', 'appCode', 'app_code', 'AppCode', 'APP_CODE'])
                                    const funcCode = getValue(appFunc, ['funC_CODE', 'funcCode', 'func_code', 'FuncCode', 'FUNC_CODE', 'code', 'id'])
                                    const name = getValue(appFunc, ['name', 'Name', 'func_name', 'funcName'])
                                    const desc = getValue(appFunc, ['desc', 'description', 'Description', 'func_desc', 'funcDesc'])
                                    const active = getValue(appFunc, ['active', 'Active', 'is_active', 'isActive', 'status'])
                                    const funcUrl = getValue(appFunc, ['funC_URL', 'funcUrl', 'func_url', 'FuncUrl', 'FUNC_URL', 'url'])
                                    const createdBy = getValue(appFunc, ['createD_BY', 'createdBy', 'created_by', 'CreatedBy', 'CREATED_BY', 'creator'])
                                    const createdDate = getValue(appFunc, ['createD_DATETIME']) || ''
                                    const updatedBy = getValue(appFunc, ['updateD_BY', 'updatedBy', 'updated_by', 'UpdatedBy', 'UPDATED_BY', 'modifier'])
                                    const updatedDate = getValue(appFunc, ['updateD_DATETIME']) || ''

                                    return (
                                        <tr key={`${funcCode || index}-${index}`} className="border-b border-gray-200 hover:bg-blue-50 transition-colors">
                                            <td className="px-3 py-3 font-medium text-[#005496] text-sm">{appCode || '-'}</td>
                                            <td className="px-3 py-3 font-medium text-[#005496] text-sm">{funcCode || '-'}</td>
                                            <td className="px-3 py-3 text-sm whitespace-break-spaces">{name || '-'}</td>
                                            <td className="px-3 py-3 text-sm">
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
                                            <td className="px-3 py-3 text-sm">
                                                {funcUrl ? (
                                                    funcUrl.startsWith('http://') || funcUrl.startsWith('https://') ? (
                                                        <a
                                                            href={funcUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-[#005496] hover:underline break-all whitespace-pre"
                                                            title={funcUrl}
                                                        >
                                                            {/* {funcUrl.length > 15 ? `${funcUrl.substring(0, 15)}...` : funcUrl} */}
                                                            {funcUrl}
                                                        </a>
                                                    ) : (
                                                        <div className="break-all whitespace-pre-wrap" title={funcUrl}>
                                                            {/* {funcUrl.length > 15 ? `${funcUrl.substring(0, 15)}...` : funcUrl} */}
                                                            {funcUrl}
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
                                                        onClick={() => handleView(appFunc)}
                                                        className="cursor-pointer flex items-center justify-center w-8 h-8 rounded-full border-3 border-gray-300 bg-transparent text-[#005496] hover:border-[#005496] hover:bg-blue-50 hover:text-[#004080] transform hover:scale-110 transition-all duration-200"
                                                        title="View Details"
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEdit(appFunc)}
                                                        className="cursor-pointer flex items-center justify-center w-8 h-8 rounded-full border-3 border-gray-300 bg-transparent text-green-600 hover:border-green-800 hover:bg-blue-50 hover:text-green-800 transform hover:scale-110 transition-all duration-200"
                                                        title="Edit"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(appFunc)}
                                                        className="cursor-pointer flex items-center justify-center w-8 h-8 rounded-full border-3 border-gray-300 bg-transparent text-red-600 hover:border-red-800 hover:bg-blue-50 hover:text-red-800 disabled:opacity-50 transform hover:scale-110 transition-all duration-200"
                                                        title="Delete"
                                                        disabled={deleteLoading === funcCode}
                                                    >
                                                        {deleteLoading === funcCode ? (
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
                    {/* Card layout rendering */}
                    {getPaginatedData().map((appFunc, index) => {
                        const appCode = getValue(appFunc, ['apP_CODE', 'appCode', 'app_code', 'AppCode', 'APP_CODE'])
                        const funcCode = getValue(appFunc, ['funC_CODE']) || ''
                        const name = getValue(appFunc, ['name', 'Name', 'func_name', 'funcName'])
                        const desc = getValue(appFunc, ['desc', 'description', 'Description', 'func_desc', 'funcDesc'])
                        const active = getValue(appFunc, ['active', 'Active', 'is_active', 'isActive', 'status'])
                        const funcUrl = getValue(appFunc, ['funC_URL', 'funcUrl', 'func_url', 'FuncUrl', 'FUNC_URL', 'url'])
                        const createdBy = getValue(appFunc, ['createD_BY', 'createdBy', 'created_by', 'CreatedBy', 'CREATED_BY', 'creator'])
                        const createdDate = getValue(appFunc, ['createD_DATETIME']) || ''
                        const updatedBy = getValue(appFunc, ['updateD_BY', 'updatedBy', 'updated_by', 'UpdatedBy', 'UPDATED_BY', 'modifier'])
                        const updatedDate = getValue(appFunc, ['updateD_DATETIME']) || ''

                        const isExpanded = expandedRows.has(funcCode)

                        return (
                            <div key={`${funcCode || index}-${index}`} className="border-b border-gray-200 p-4 hover:bg-blue-50 transition-colors">
                                {/* Main Card Content */}
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <span className="text-sm text-gray-600">({appCode || '-'})</span>
                                            <span className="text-sm font-semibold text-[#005496] bg-blue-50 px-2 py-1 rounded">
                                                {funcCode || '-'}
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
                                        <p className="text-sm text-gray-600 truncate">{funcUrl || '-'}</p>
                                    </div>

                                    <div className="flex items-center space-x-2 ml-4">
                                        <button
                                            onClick={() => toggleRowExpansion(funcCode)}
                                            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                        >
                                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                        </button>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex space-x-2 mb-3">
                                    <button
                                        onClick={() => handleView(appFunc)}
                                        className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 text-[#005496] hover:text-[#004080] hover:bg-blue-100 rounded-lg transition-colors text-sm"
                                    >
                                        <Eye size={14} />
                                        <span>View</span>
                                    </button>
                                    <button
                                        onClick={() => handleEdit(appFunc)}
                                        className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 text-green-600 hover:text-green-800 hover:bg-green-100 rounded-lg transition-colors text-sm"
                                    >
                                        <Edit size={14} />
                                        <span>Edit</span>
                                    </button>
                                    <button
                                        onClick={() => handleDelete(appFunc)}
                                        className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50 text-sm"
                                        disabled={deleteLoading === funcCode}
                                    >
                                        {deleteLoading === funcCode ? (
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
                                                <p className="text-gray-900 mt-1 whitespace-pre-wrap">{desc || '-'}</p>
                                            </div>

                                            <div>
                                                <span className="font-medium text-gray-600">Function URL:</span>
                                                <div className="mt-1">
                                                    {funcUrl ? (
                                                        funcUrl.startsWith('http://') || funcUrl.startsWith('https://') ? (
                                                            <a
                                                                href={funcUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-[#005496] hover:underline break-all"
                                                            >
                                                                {funcUrl}
                                                            </a>
                                                        ) : (
                                                            <span className="text-gray-900 break-all">{funcUrl}</span>
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
                        <p>{searchTerm || selectedTitle !== "all" ? `No functions found matching your criteria` : 'No functions found'}</p>
                    </div>
                )}
            </div>

            <ViewModal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                data={viewData}
            />

            <AppsFunctionsEditModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSuccess={handleEditSuccess}
                editData={editData!}
            />

            <DeleteConfirmModal
                isOpen={deleteModal.open}
                onClose={() => setDeleteModal({ appFunc: null, open: false })}
                onConfirm={confirmDelete}
                appName={deleteModal.appFunc ? getValue(deleteModal.appFunc, ['funC_CODE', 'FUNC_CODE']) || '' : ''}
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