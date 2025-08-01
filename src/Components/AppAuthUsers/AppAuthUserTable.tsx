"use client"

import { AppAuthApi } from '@/services/AppAuthUserApi'
import { User } from "@/types/User"

import formatDateTime from '@/Utils/formatDateTime'
import getValue from "@/Utils/getValue"

import { useEffect, useState } from "react"
import { Users } from "lucide-react"
import Skeleton from 'react-loading-skeleton'

import Pagination from "../UI/Pagination"
import RowsPerPageSelect from "../UI/Select/RowsPerPageSelect"

interface AppAuthUserTableProps {
    refreshSignal: number
    onRefresh: () => void
    searchTerm: string
    selectedApp: string 
    selectedRole: string
    selectedOrg: string
}

export default function AppAuthUserTable({ 
    refreshSignal, 
    // onRefresh, 
    searchTerm, 
    selectedApp, 
    selectedRole, 
    selectedOrg 
}: AppAuthUserTableProps) {
    const [data, setData] = useState<User[]>([])
    const [loading, setLoading] = useState(false)
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
    }, [searchTerm, selectedApp, selectedRole, selectedOrg])

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            try {
                const response = await AppAuthApi.getAuthUser()
                setData(response || [])
                console.log('API Response:', response)
            } catch (error) {
                console.error("Error fetching authorized users data:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [refreshSignal])

    const filteredData = data.filter(user => {
        const applicationTitle = getValue(user, ['applicationTitle']) || ''
        const roleName = getValue(user, ['roleName']) || ''
        const userId = getValue(user, ['userId']) || ''
        const name = getValue(user, ['name']) || ''
        const org = getValue(user, ['org']) || ''
        const siteFacility = getValue(user, ['siteFacility']) || ''
        const createdBy = getValue(user, ['createdBy']) || ''
        const updatedBy = getValue(user, ['updatedBy']) || ''

        const matchesSearchTerm = searchTerm.toLowerCase()
        const appMatches = selectedApp === "all" || applicationTitle.toLowerCase() === selectedApp.toLowerCase()
        const roleMatches = selectedRole === "all" || roleName.toLowerCase() === selectedRole.toLowerCase()
        const orgMatches = selectedOrg === "all" || org.toLowerCase() === selectedOrg.toLowerCase()

        const textMatches = (
            applicationTitle.toLowerCase().includes(matchesSearchTerm) ||
            roleName.toLowerCase().includes(matchesSearchTerm) ||
            userId.toLowerCase().includes(matchesSearchTerm) ||
            name.toLowerCase().includes(matchesSearchTerm) ||
            org.toLowerCase().includes(matchesSearchTerm) ||
            siteFacility.toLowerCase().includes(matchesSearchTerm) ||
            createdBy.toLowerCase().includes(matchesSearchTerm) ||
            updatedBy.toLowerCase().includes(matchesSearchTerm)
        )

        return appMatches && roleMatches && orgMatches && textMatches
    })

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden p-4">
                <Skeleton height={40} className="mb-4" /> 
                <div className="hidden xl:block">
                    <Skeleton height={50} className="mb-2" /> 
                    {[...Array(rowsPerPage)].map((_, i) => (
                        <Skeleton key={i} height={40} className="mb-2" />
                    ))}
                </div>
                <div className="xl:hidden space-y-4">
                    {[...Array(rowsPerPage)].map((_, i) => (
                        <div key={i} className="border border-gray-200 rounded-lg p-4">
                            <Skeleton height={20} width="60%" className="mb-2" />
                            <Skeleton height={15} width="80%" className="mb-2" />
                            <Skeleton height={15} width="40%" className="mb-4" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <>
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

                    {/* Pagination */}
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
                            <thead className="bg-[var(--primary-color)] text-white">
                                <tr>
                                    {['Application', 'Role Name', 'User ID', 'Name', 'Organization',
                                        'Site Facility', 'Created By', 'Create Date', 'Updated By', 'Updated Date'
                                    ].map(header => (
                                        <th key={header} className="px-3 py-3 text-left text-sm font-semibold whitespace-nowrap">
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {getPaginatedData().map((user, index) => {
                                    const applicationTitle = getValue(user, ['applicationTitle'])
                                    const roleName = getValue(user, ['roleName'])
                                    const userId = getValue(user, ['userId'])
                                    const name = getValue(user, ['name'])
                                    const org = getValue(user, ['org'])
                                    const siteFacility = getValue(user, ['siteFacility'])
                                    const createdBy = getValue(user, ['createdBy'])
                                    const createdDate = getValue(user, ['createdDateTime']) || ''
                                    const updatedBy = getValue(user, ['updatedBy'])
                                    const updatedDate = getValue(user, ['updatedDateTime']) || ''

                                    return (
                                        <tr key={`${userId || index}-${index}`} className="border-b border-gray-200 hover:bg-blue-50 transition-colors">
                                            {/* <td className="px-3 py-3 font-medium text-[#005486] text-sm">{applicationTitle || '-'}</td>
                                            <td className="px-3 py-3 text-sm">
                                                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                                    {roleName || '-'}
                                                </span>
                                            </td>
                                            <td className="px-3 py-3 text-sm font-mono">{userId || '-'}</td>
                                            <td className="px-3 py-3 text-sm font-medium">{name || '-'}</td>
                                            <td className="px-3 py-3 text-sm">
                                                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                                    {org || '-'}
                                                </span>
                                            </td> */}

                                            <td className="px-3 py-3 font-medium text-[var(--primary-color)] text-sm">{applicationTitle || '-'}</td>
                                            <td className="px-3 py-3 text-sm">
                                            {roleName || '-'}
                                            </td>
                                            <td className="px-3 py-3 text-sm font-medium">{userId || '-'}</td>    
                                            <td className="px-3 py-3 text-sm">{name || '-'}</td>
                                            <td className="px-3 py-3 text-sm">
                                            {org || '-'}
                                            </td>

                                            <td className="px-3 py-3 text-sm">{siteFacility || '-'}</td>
                                            <td className="px-3 py-3 text-sm">{createdBy || '-'}</td>
                                            <td className="px-3 py-3 whitespace-nowrap text-sm">
                                                {formatDateTime(createdDate)}
                                            </td>
                                            <td className="px-3 py-3 text-sm">{updatedBy || '-'}</td>
                                            <td className="px-3 py-3 whitespace-nowrap text-sm">
                                                {formatDateTime(updatedDate)}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Mobile View */}
                <div className="xl:hidden space-y-4 p-4">
                    {getPaginatedData().map((user, index) => {
                        const applicationTitle = getValue(user, ['applicationTitle'])
                        const roleName = getValue(user, ['roleName'])
                        const userId = getValue(user, ['userId'])
                        const name = getValue(user, ['name'])
                        const org = getValue(user, ['org'])
                        const siteFacility = getValue(user, ['siteFacility'])
                        const createdBy = getValue(user, ['createdBy'])
                        const createdDate = getValue(user, ['createdDateTime']) || ''
                        const updatedBy = getValue(user, ['updatedBy'])
                        const updatedDate = getValue(user, ['updatedDateTime']) || ''

                        return (
                            <div key={`${userId || index}-${index}`} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h3 className="font-semibold text-[#005486] text-lg">{name || 'N/A'}</h3>
                                        <p className="text-sm text-gray-600 font-mono">{userId || 'N/A'}</p>
                                    </div>
                                    <div className="flex flex-col items-end space-y-1">
                                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                            {roleName || '-'}
                                        </span>
                                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                            {org || '-'}
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-2 text-sm">
                                    <div>
                                        <span className="font-medium text-gray-700">Application:</span>
                                        <span className="ml-2 text-gray-900">{applicationTitle || '-'}</span>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-700">Site Facility:</span>
                                        <span className="ml-2 text-gray-900">{siteFacility || '-'}</span>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-700">Created By:</span>
                                        <span className="ml-2 text-gray-900">{createdBy || '-'}</span>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-700">Created Date:</span>
                                        <span className="ml-2 text-gray-900">{formatDateTime(createdDate)}</span>
                                    </div>
                                    {updatedBy && (
                                        <>
                                            <div>
                                                <span className="font-medium text-gray-700">Updated By:</span>
                                                <span className="ml-2 text-gray-900">{updatedBy}</span>
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-700">Updated Date:</span>
                                                <span className="ml-2 text-gray-900">{formatDateTime(updatedDate)}</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>

                {filteredData.length === 0 && !loading && (
                    <div className="text-center py-12 text-gray-500">
                        <div className="text-gray-400 mb-2">
                            <Users size={48} className="mx-auto" />
                        </div>
                        <p>{searchTerm || selectedApp !== "all" || selectedRole !== "all" || selectedOrg !== "all" ? `No users found matching your criteria` : 'No users found'}</p>
                    </div>
                )}
            </div>
        </>
    )
}