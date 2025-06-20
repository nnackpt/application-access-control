import { AppsfunctionsApi } from "@/services/AppsfunctionsApi"
import { AppsFunctions } from "@/types/AppsFunctions"
import React, { useEffect, useState } from "react"
import AppsFunctionsModal from "./AppsFunctionsModal"
import ViewModal from "./AppsFunctionsViewModal"
import { ChevronDown, ChevronUp, Edit, Eye, Trash2 } from "lucide-react"
import { get } from "http"

interface AppsFunctionsTableProps {
    refreshSignal: number
    onRefresh: () => void
    searchTerm: string
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

export default function AppsFunctionsTable({ refreshSignal, onRefresh, searchTerm }: AppsFunctionsTableProps) {
    const [data, setData] = useState<AppsFunctions[]>([])
    const [loading, setLoading] = useState(false)
    const [viewData, setViewData] = useState<AppsFunctions | null>(null)
    const [editData, setEditData] = useState<AppsFunctions | null>(null)
    const [isViewModalOpen, setIsViewModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [deleteLoading, setDeleteLoading] = useState<string | null>(null)
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
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
        return `Showing 1 to ${filteredData.length} of ${filteredData.length} Records`
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
                const response = await AppsfunctionsApi.getAppsFunctions()
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
        const funcCode = getValue(appFunc, ['funcCode', 'funC_CODE', 'func_code', 'FuncCode', 'FUNC_CODE', 'code', 'id'])
        if (!confirm(`Are you sure you want to delete function "${appFunc.name}"?`)) {
            return
        }

        setDeleteLoading(funcCode)
        try {
            await AppsfunctionsApi.deleteAppsFunctions(funcCode)
            onRefresh()
        } catch (error) {
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
        if (!searchTerm) return true

        const searchLower = searchTerm.toLowerCase()
        const appCode = getValue(appFunc, ['apP_CODE', 'appCode', 'app_code', 'AppCode', 'APP_CODE']) || ''
        const funcCode = getValue(appFunc, ['funC_CODE', 'funcCode', 'func_code', 'FuncCode', 'FUNC_CODE', 'code', 'id']) || ''
        const name = getValue(appFunc, ['name', 'Name', 'func_name', 'funcName']) || ''
        const desc = getValue(appFunc, ['desc', 'description', 'Description', 'func_desc', 'funcDesc']) || ''
        const funcUrl = getValue(appFunc, ['funC_URL', 'funcUrl', 'func_url', 'FuncUrl', 'FUNC_URL', 'url']) || ''
        const createdBy = getValue(appFunc, ['createD_BY', 'createdBy', 'created_by', 'CreatedBy', 'CREATED_BY', 'creator']) || ''
        const updatedBy = getValue(appFunc, ['updateD_BY', 'updatedBy', 'updated_by', 'UpdatedBy', 'UPDATED_BY', 'modifier']) || ''

        return (
            appCode.toLowerCase().includes(searchLower) ||
            funcCode.toLowerCase().includes(searchLower) ||
            name.toLowerCase().includes(searchLower) ||
            desc.toLowerCase().includes(searchLower) ||
            funcUrl.toLowerCase().includes(searchLower) ||
            createdBy.toLowerCase().includes(searchLower) ||
            updatedBy.toLowerCase().includes(searchLower)
        )
    })

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

    const wordWrap = (text: string, maxLength: number) => {
        if (!text) return '-'
        let result = ''
        let currentLength = 0
        for (let i = 0; i < text.length; i++) {
            result += text[i]
            currentLength++;
            if (currentLength >= maxLength && text[i] !== ' ' && text[i] !== '-' && text[i] !== '_' && text[i] !== '/') {
                if (i < text.length - 1) {
                    result += '\n'
                    currentLength = 0
                }
            } else if ((text[i] === ' ' || text[i] === '-' || text[i] === '_' || text[i] === '/') && i < text.length - 1) {
                result += '\n'
                currentLength = 9
            }
        }

        return result
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
                                <option value={20}>20</option>
                                <option value={30}>30</option>
                                <option value={40}>40</option>
                                <option value={50}>50</option>
                                <option value={0}>ALL</option>
                            </select>
                            <span className="text-sm text-gray-600">Records</span>
                        </div>
                        <div className="text-sm text-gray-600">
                            {getDisplayInfo()}
                        </div>
                    </div>

                    {/* Pageination Btn */}
                    {rowsPerPage > 0 && getTotalPages() > 1 && (
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                            >
                                Previous
                            </button>

                            <div className="flex space-x-1">
                                {Array.from({ length: getTotalPages() }, (_, i) => i + 1)
                                    .filter(page => {
                                        return page === 1 || page === getTotalPages() ||
                                            Math.abs(page - currentPage) <= 1
                                    })
                                    .map((page, index, array) => {
                                        const prevPage = array[index - 1]
                                        const showDots = prevPage && page - prevPage > 1

                                        return (
                                            <React.Fragment key={page}>
                                                {showDots && (
                                                    <span className="px-2 py-1 text-gray-400">...</span>
                                                )}
                                                <button
                                                    onClick={() => setCurrentPage(page)}
                                                    className={`px-3 py-1 border rounded text-sm ${
                                                        currentPage === page
                                                            ? 'bg-[#005495] text-white border-[#005496]'
                                                            : 'border-gray-300 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    {page}
                                                </button>
                                            </React.Fragment>
                                        )
                                    })
                                }
                            </div>

                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, getTotalPages()))}
                                disabled={currentPage === getTotalPages()}
                                className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                            >
                                Next
                            </button>
                        </div>
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
                                    const createdDate = getValue(appFunc, ['createD_DATETIME', 'createdDatetime', 'created_datetime', 'createdDate', 'created_date', 'CreatedDate', 'CREATED_DATE', 'createDate'])
                                    const updatedBy = getValue(appFunc, ['updateD_BY', 'updatedBy', 'updated_by', 'UpdatedBy', 'UPDATED_BY', 'modifier'])
                                    const updatedDate = getValue(appFunc, ['updateD_DATETIME', 'updatedDatetime', 'updated_datetime', 'updatedDate', 'updated_date', 'UpdatedDate', 'UPDATED_DATE', 'updateDate'])

                                    return (
                                        <tr key={`${funcCode || index}-${index}`} className="border-b border-gray-200 hover:bg-blue-50 transition-colors">
                                            <td className="px-3 py-3 font-medium text-[#005496] text-sm">{appCode || '-'}</td>
                                            <td className="px-3 py-3 font-medium text-[#005496] text-sm">{funcCode || '-'}</td>
                                            <td className="px-3 py-3 text-sm whitespace-break-spaces">{name || '-'}</td>
                                            <td className="px-3 py-3 text-sm">
                                                <div className="whitespace-pre-wrap" title={desc || ''}>
                                                    {wordWrap(desc, 100)}
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
                                                {funcUrl ? (
                                                    funcUrl.startsWith('http://') || funcUrl.startsWith('https://') ? (
                                                        <a
                                                            href={funcUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-[#005496] hover:underline truncate block whitespace-pre"
                                                            title={funcUrl}
                                                        >
                                                            {funcUrl.length > 15 ? `${funcUrl.substring(0, 15)}...` : funcUrl}
                                                        </a>
                                                    ) : (
                                                        <div className="truncate" title={funcUrl}>
                                                            {funcUrl.length > 15 ? `${funcUrl.substring(0, 15)}...` : funcUrl}
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
                                                        className="cursor-pointer p-2 text-[#005496] hover:text-[#004080] hover:bg-blue-100 rounded-lg transition-colors"
                                                        title="View Details"
                                                    >
                                                        <Eye size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEdit(appFunc)}
                                                        className="cursor-pointer p-2 text-green-600 hover:text-green-800 hover:bg-green-100 rounded-lg transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(appFunc)}
                                                        className="cursor-pointer p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                                                        title="Delete"
                                                        disabled={deleteLoading === funcCode}
                                                    >
                                                        {deleteLoading === funcCode ? (
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
                    {/* Card layout rendering */}
                    {getPaginatedData().map((appFunc, index) => {
                        const appCode = getValue(appFunc, ['apP_CODE', 'appCode', 'app_code', 'AppCode', 'APP_CODE'])
                        const funcCode = getValue(appFunc, ['funC_CODE', 'funcCode', 'func_code', 'FuncCode', 'FUNC_CODE', 'code', 'id'])
                        const name = getValue(appFunc, ['name', 'Name', 'func_name', 'funcName'])
                        const desc = getValue(appFunc, ['desc', 'description', 'Description', 'func_desc', 'funcDesc'])
                        const active = getValue(appFunc, ['active', 'Active', 'is_active', 'isActive', 'status'])
                        const funcUrl = getValue(appFunc, ['funC_URL', 'funcUrl', 'func_url', 'FuncUrl', 'FUNC_URL', 'url'])
                        const createdBy = getValue(appFunc, ['createD_BY', 'createdBy', 'created_by', 'CreatedBy', 'CREATED_BY', 'creator'])
                        const createdDate = getValue(appFunc, ['createD_DATETIME', 'createdDatetime', 'created_datetime', 'createdDate', 'created_date', 'CreatedDate', 'CREATED_DATE', 'createDate'])
                        const updatedBy = getValue(appFunc, ['updateD_BY', 'updatedBy', 'updated_by', 'UpdatedBy', 'UPDATED_BY', 'modifier'])
                        const updatedDate = getValue(appFunc, ['updateD_DATETIME', 'updatedDatetime', 'updated_datetime', 'updatedDate', 'updated_date', 'UpdatedDate', 'UPDATED_DATE', 'updateDate'])

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
                        <p>{searchTerm ? `No functions found matching "${searchTerm}"` : 'No functions found'}</p>
                    </div>
                )}
            </div>

            <ViewModal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                data={viewData}
            />

            <AppsFunctionsModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSuccess={handleEditSuccess}
                editData={editData}
            />
        </>
    )
}