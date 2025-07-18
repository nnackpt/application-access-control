"use client"

import { rbacApi } from "@/services/RbacApi"
import { applicationApi } from "@/services/ApplicationApi"
import { AppsRolesApi } from "@/services/AppsRolesApi"
import { Application } from "@/types/Application"
import { Rbac } from "@/types/Rbac"

import getValue from "@/Utils/getValue"
import formatDateTime from './../../Utils/formatDateTime';

import { useEffect, useState } from "react"
import toast, { Toaster } from "react-hot-toast"
import { Edit, Eye, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import Skeleton from 'react-loading-skeleton'

import Pagination from "../UI/Pagination"

import RowsPerPageSelect from "../UI/Select/RowsPerPageSelect"
import DeleteConfirmModal from './../UI/DeleteConfirmModal';
import { AppsRoles } from "@/types/AppsRoles"

interface RbacTableProps {
    refreshSignal: number
    onRefresh: () => void
    searchTerm: string
    selectedTitle: string 
    selectedRole: string
}

export default function RbacTable({ refreshSignal, onRefresh, searchTerm, selectedTitle, selectedRole }: RbacTableProps) {
    const [data, setData] = useState<Rbac[]>([])
    const [loading, setLoading] = useState(false)
    // const [viewData, setViewData] = useState<Rbac | null>(null)
    // const [editData, setEditData] = useState<Rbac | null>(null)
    // const [isViewModalOpen, setIsViewModalOpen] = useState(false)
    const [applications, setApplications] = useState<Application[]>([])
    const [roles, setRoles] = useState<AppsRoles[]>([])
    // const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [deleteLoading, setDeleteLoading] = useState<string | null>(null)
    // const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
    const [deleteModal, setDeleteModal] = useState<{rbac: Rbac|null, open: boolean}>({rbac: null, open: false})
    const [deleteSuccess, setDeleteSuccess] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(10)
    const router = useRouter()

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
    }, [searchTerm, selectedTitle, selectedRole])

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            try {
                const response = await rbacApi.getRbac()
                const apps = await applicationApi.getApplications()
                const roles = await AppsRolesApi.getAppsRoles()
                setApplications(apps)
                setRoles(roles)
                setData(response || [])
                console.log('API Response:', response)
                console.log('First item:', response[0])
            } catch (error) {
                console.error("Error fetching RBAC data:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [refreshSignal])

    const getAppName = (rbacItem: Rbac) => {
        if (rbacItem.cM_APPLICATIONS && rbacItem.cM_APPLICATIONS.apP_NAME) return rbacItem.cM_APPLICATIONS.apP_NAME;
        if (rbacItem.cM_APPS_ROLES?.cM_APPLICATIONS?.apP_NAME) return rbacItem.cM_APPS_ROLES.cM_APPLICATIONS.apP_NAME;
        const app = applications.find(app => app.apP_CODE === rbacItem.apP_CODE);
        if (app) return app.apP_NAME;
        return "";
    };

    const getRoleName = (rbac: Rbac) => {
        if (rbac.cM_APPS_ROLES && rbac.cM_APPS_ROLES.name) return rbac.cM_APPS_ROLES.name;
        if (roles && rbac.rolE_CODE && rbac.apP_CODE) {
            const role = roles.find(role => role.rolE_CODE === rbac.rolE_CODE && role.apP_CODE === rbac.apP_CODE);
            if (role) return role.name;
        }
        return "";
    };


    useEffect(() => {
        const fetchMeta = async () => {
            setApplications(await applicationApi.getApplications() || [])
            setRoles(await AppsRolesApi.getAppsRoles() || [])
        }
        fetchMeta()
    }, [])

    const filteredData = data.filter(rbac => {
        const rbacCode = getValue(rbac, ['rbaC_CODE']) || ''
        const appCode = getValue(rbac, ['apP_CODE']) || ''
        const appName = getAppName(rbac) || ''
        const roleCode = getValue(rbac, ['rolE_CODE']) || ''
        const roleName = getRoleName(rbac) || ''
        const funcCode = getValue(rbac, ['funC_CODE']) || ''
        const createdBy = getValue(rbac, ['createD_BY']) || ''
        // const createdDate = getValue(rbac, ['createD_DATETIME'])
        const updatedBy = getValue(rbac, ['updateD_BY']) || ''
        // const updatedDate = getValue(rbac, ['updateD_DATETIME'])

        const matchesSearchTerm = searchTerm.toLowerCase()
        const appCodeMatches = selectedTitle === "all" || appCode.toLowerCase() === selectedTitle.toLowerCase()
        const roleCodeMatches = selectedRole === "all" || roleCode.toLowerCase() === selectedRole.toLowerCase()

        const textMatches = (
            rbacCode.toLowerCase().includes(matchesSearchTerm) ||
            appCode.toLowerCase().includes(matchesSearchTerm) ||
            appName.toLowerCase().includes(matchesSearchTerm) ||
            roleCode.toLowerCase().includes(matchesSearchTerm) ||
            roleName.toLowerCase().includes(matchesSearchTerm) ||
            funcCode.toLowerCase().includes(matchesSearchTerm) ||
            createdBy.toLowerCase().includes(matchesSearchTerm) ||
            updatedBy.toLowerCase().includes(matchesSearchTerm)
        )

        return appCodeMatches && roleCodeMatches && textMatches
    })

    const handleView = (rbac: Rbac) => {
        const rbacCode = getValue(rbac, ['rbaC_CODE'])
        if (rbacCode) {
            const params = new URLSearchParams()
            if (selectedTitle !== "all") params.set('app', selectedTitle)
            if (selectedRole !== "all") params.set('role', selectedRole)
            if (searchTerm.trim()) params.set('search', searchTerm)
            
            const queryString = params.toString()
            const url = queryString ? `/RBAC/view/${rbacCode}?${queryString}` : `/RBAC/view/${rbacCode}`
            
            router.push(url)
        }
    }

    const handleEdit = (rbac: Rbac) => {
        const rbacCode = getValue(rbac, ['rbaC_CODE'])
        if (rbacCode) {
            const params = new URLSearchParams()
            if (selectedTitle !== "all") params.set('app', selectedTitle)
            if (selectedRole !== "all") params.set('role', selectedRole)
            if (searchTerm.trim()) params.set('search', searchTerm)
            
            const queryString = params.toString()
            const url = queryString ? `/RBAC/Edit/${rbacCode}?${queryString}` : `/RBAC/Edit/${rbacCode}`
            
            router.push(url)
        }
    }

    const handleDelete = (rbac: Rbac) => {
        setDeleteModal({ rbac: rbac, open: true })
    }

    const confirmDelete = async () => {
        if (!deleteModal.rbac) return
        const rbac = deleteModal.rbac
        const rbacCode = getValue(rbac, ['rbaC_CODE'])
        if (!rbacCode) {
            toast.error("Invalid RBAC code")
            return
        }
        setDeleteLoading(rbacCode)
        try {
            console.log("Deleting rbac with code:", rbacCode)
            await rbacApi.deleteRbac(rbacCode)
            setDeleteModal({ rbac: null, open: false })
            toast.success("RBAC deleted successfully")
            setDeleteSuccess(true)
            onRefresh()
        } catch (error) {
            toast.error("Error deleting RBAC")
            console.error("Error deleting app role:", error)
        } finally {
            setDeleteLoading(null)
        }
    }

    // const handleEditSuccess = () => {
    //     setEditData(null)
    //     setIsEditModalOpen(false)
    //     onRefresh()
    // }

    // const toggleRowExpansion = (rbac: string) => {
    //     setExpandedRows(prev => {
    //         const newSet = new Set(prev)
    //         if (newSet.has(rbac)) {
    //             newSet.delete(rbac)
    //         } else {
    //             newSet.add(rbac)
    //         }
    //         return newSet
    //     })
    // }

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

                        {/* {Pagination BTN} */}
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
                    {/* {Desktop View} */}
                    <div className="hidden xl:block">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-[#005496] text-white">
                                    <tr>
                                        {['RBAC Code', 'APP Code', 'Application Name', 'ROLE Code', 'ROLE Name',
                                            'FUNC Code', 'Created By', 'Create Date', 'Updated By', 'Updated Date', 'Actions'
                                        ].map(header => (
                                            <th key={header} className="px-3 py-3 text-left text-sm font-semibold whitespace-nowrap">
                                                {header}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* {Table Rows} */}
                                    {getPaginatedData().map((rbac, index) => {
                                        const rbacCode = getValue(rbac,['rbaC_CODE'])
                                        const appCode = getValue(rbac, ['apP_CODE'])
                                        const appName = getAppName(rbac) || ''
                                        const roleCode = getValue(rbac, ['rolE_CODE'])
                                        const roleName = getRoleName(rbac)
                                        const funcCode = getValue(rbac, ['funC_CODE'])
                                        const createdBy = getValue(rbac, ['createD_BY'])
                                        const createdDate = getValue(rbac, ['createD_DATETIME']) || ''
                                        const updatedBy = getValue(rbac, ['updateD_BY'])
                                        const updatedDate = getValue(rbac, ['updateD_DATETIME']) || ''

                                        return (
                                            <tr key={`${rbacCode || index}-${index}`} className="border-b border-gray-200 hover:bg-blue-50 transition-colors">
                                                <td className="px-3 py-3 font-medium text-[#005486] text-sm">{rbacCode || '-'}</td>
                                                <td className="px-3 py-3 text-sm">{appCode || '-'}</td>
                                                <td className="px-3 py-3 text-sm">{appName || '-'}</td>
                                                <td className="px-3 py-3 text-sm">{roleCode || '-'}</td>
                                                <td className="px-3 py-3 text-sm">{roleName || '-'}</td>
                                                <td className="px-3 py-3 text-sm">{funcCode || '-'}</td>
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
                                                            onClick={() => handleView(rbac)}
                                                            className="cursor-pointer flex items-center justify-center w-8 h-8 rounded-full border-3 border-gray-300 bg-transparent text-[#005496] hover:border-[#005496] hover:bg-blue-50 hover:text-[#004080] transform hover:scale-110 transition-all duration-200"
                                                            title="View Details"
                                                        >
                                                            <Eye size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleEdit(rbac)}
                                                            className="cursor-pointer flex items-center justify-center w-8 h-8 rounded-full border-3 border-gray-300 bg-transparent text-green-600 hover:border-green-800 hover:bg-blue-50 hover:text-green-800 transform hover:scale-110 transition-all duration-200"
                                                            title="Edit"
                                                        >
                                                            <Edit size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(rbac)}
                                                            className="cursor-pointer flex items-center justify-center w-8 h-8 rounded-full border-3 border-gray-300 bg-transparent text-red-600 hover:border-red-800 hover:bg-blue-50 hover:text-red-800 disabled:opacity-50 transform hover:scale-110 transition-all duration-200"
                                                            title="Delete"
                                                            disabled={deleteLoading === rbacCode}
                                                        >
                                                            {deleteLoading === rbacCode ? (
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

                    {filteredData.length === 0 && !loading && (
                        <div className="text-center py-12 text-gray-500">
                            <div className="text-gray-400 mb-2">
                                <Eye size={48} className="mx-auto" />
                            </div>
                            <p>{searchTerm || selectedTitle !== "all" ? `No roles found matching your criteria` : 'No roles found'}</p>
                        </div>
                    )}
                </div>

                {/* <ViewModal
                    isOpen={isViewModalOpen}
                    onClose={() => setIsViewModalOpen(false)}
                    data={viewData}
                />

                <AppsRolesEditModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    onSuccess={handleEditSuccess}
                    editData={editData!}
                /> */}

                <DeleteConfirmModal
                    isOpen={deleteModal.open} 
                    onClose={() => setDeleteModal({ rbac: null, open: false })}
                    onConfirm={confirmDelete}
                    appName={deleteModal.rbac ? getValue(deleteModal.rbac, ['rbaC_CODE']) || '' : ''}
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