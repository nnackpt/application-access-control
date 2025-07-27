"use client"

import { useEffect, useState } from "react"
import { ChevronLeft, Package, Users, User as UserIcon, Building, UserX } from "lucide-react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { motion } from 'framer-motion'

import getValue from "@/Utils/getValue"

import Pagination from "@/Components/UI/Pagination"
import RowsPerPageSelect from "@/Components/UI/Select/RowsPerPageSelect"

import { FacilitySelectionDto, User } from "@/types/User"
import { Application } from '@/types/Application';
import { AppsRoles } from "@/types/AppsRoles"
import { UserApi } from "@/services/UserApi"
import { applicationApi } from "@/services/ApplicationApi"
import { AppsRolesApi } from "@/services/AppsRolesApi"
import Skeleton from "react-loading-skeleton"

export default function UserViewPage() {
  // const { authCode } = useParams()
  const params = useParams()
  const userId = params.userId as string
  
  const router = useRouter()
  const searchParams = useSearchParams()

  const [user, setUser] = useState<User | null>(null)
  const [facilities, setFacilities] = useState<FacilitySelectionDto[]>([])
  const [loading, setLoading] = useState(true)
  const [applications, setApplications] = useState<Application[]>([])
  const [roles, setRoles] = useState<AppsRoles[]>([])

  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) {
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        const userDetails = await UserApi.getUserByUserId(userId)
        if (userDetails && userDetails.length > 0) {
          setUser(userDetails[0])

          const currentAppCode = getValue(userDetails[0], ["apP_CODE"]) || ""
          const currentRoleCode = getValue(userDetails[0], ["rolE_CODE"]) || ""
          
          const userFacilities = await UserApi.getUserFacilitiesByUserIdAppCodeRoleCode(userId, currentAppCode, currentRoleCode)
          setFacilities(userFacilities)
        } else {
          setUser(null)
          setFacilities([])
        }

        const apps = await applicationApi.getApplications()
        const rolesData = await AppsRolesApi.getAppsRoles()
        setApplications(apps)
        setRoles(rolesData)

      } catch (err) {
        console.error("Error fetching Data:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [userId])

  const indexOfLastFacility = currentPage * rowsPerPage
  const indexOfFirstFacility = indexOfLastFacility - rowsPerPage
  const paginatedFacilities = facilities.slice(indexOfFirstFacility, indexOfLastFacility)

  const totalPages = Math.ceil(facilities.length / rowsPerPage)

  // const handlePageChange = (page: number) => {
  //   setCurrentPage(page)
  // }

  const handleRowsPerPageChange = (value: number) => {
    setRowsPerPage(value)
    setCurrentPage(1)
  }

  const getDisplayInfo = () => {
    if (facilities.length === 0) return "Showing 0 of 0 Records"

    if (rowsPerPage === 0) {
      return `Showing 1 to ${facilities.length} of ${facilities.length} Records`
    }

    const currentStartIndex = (currentPage - 1) * rowsPerPage + 1
    const currentEndIndex = Math.min(currentPage * rowsPerPage, facilities.length)
    return `Showing ${currentStartIndex} to ${currentEndIndex} of ${facilities.length} Records`
  }

  const handleBackToList = () => {
    const params = new URLSearchParams()

    const app = searchParams.get("app")
    const role = searchParams.get("role")
    const search = searchParams.get("search")
    const active = searchParams.get("active")

    if (app) params.set("app", app)
    if (role) params.set("role", role)
    if (search) params.set("search", search)
    if (active) params.set("active", active)

    const queryString = params.toString()
    const backUrl = queryString ? `/Users?${queryString}` : '/Users'

    router.push(backUrl)
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6 animate-pulse">
        {/* Header Skeleton */}
        <div className="flex justify-between items-center mb-6">
          <div className="h-8 bg-gray-200 rounded w-48"></div>
          <div className="h-10 bg-gray-200 rounded w-24"></div>
        </div>

        {/* User Info Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
          <div>
            <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
            <div className="h-6 bg-gray-300 rounded w-3/4 mb-1"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div>
            <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
            <div className="h-6 bg-gray-300 rounded w-3/4 mb-1"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div>
            <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
            <div className="h-6 bg-gray-300 rounded w-3/4 mb-1"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>

        {/* User Details Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
          <div>
            <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
            <div className="h-6 bg-gray-300 rounded w-3/4"></div>
          </div>
          <div>
            <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
            <div className="h-6 bg-gray-300 rounded w-3/4"></div>
          </div>
        </div>

        {/* Facilities Table Skeleton */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-4">
              <div className="h-6 bg-gray-200 rounded w-32"></div>
              <div className="h-6 bg-gray-200 rounded w-48"></div>
            </div>
            <div className="h-8 bg-gray-200 rounded w-40"></div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead className="bg-gray-200 text-transparent">
                <tr>
                  <th className="text-left px-4 py-3">SITE CODE</th>
                  <th className="text-left px-4 py-3">DOMAIN CODE</th>
                  <th className="text-left px-4 py-3">FAC CODE</th>
                </tr>
              </thead>
              <tbody>
                {[...Array(rowsPerPage)].map((_, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="px-4 py-3">
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end mt-4">
            <div className="h-8 bg-gray-200 rounded w-48"></div>
          </div>
        </div>
      </div>
    )
  }

  // if (loading) {
  //   return (
  //     <div className="container mx-auto p-6 bg-white rounded-lg shadow-md mt-6">
  //       <Skeleton height={30} width="30%" className="mb-4" />
  //       <Skeleton height={3} width={20} className="mb-2" />
  //       <Skeleton height={200} className="mb-6" />
  //       <Skeleton height={40} width="50%" className="mb-4" />
  //     </div>
  //   )
  // }

  if (!user) {
    return (
      <div className="container mx-auto p-8 mt-10 bg-gradient-to-br from-slate-100 via-white to-slate-50 rounded-2xl shadow-2xl max-w-2xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-center mb-4">
            <UserX className="h-12 w-12 text-red-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">User Not Found</h1>
          <p className="text-gray-600">
            We couldn't find any user details for ID: <span className="font-medium text-gray-800">{userId}</span>
          </p>
        </motion.div>

        <motion.button
          whileHover={{
            scale: 1.05,
            backgroundColor: "#4B5563", // Slate-600
            boxShadow: "0 10px 15px rgba(0, 0, 0, 0.15)",
          }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => router.back()}
          className="mt-8 inline-flex items-center px-5 py-2.5 text-sm font-medium text-white bg-[var(--primary-color)] rounded-lg shadow-md hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary-color)]"
        >
          <ChevronLeft className="mr-2 h-5 w-5" />
          Go Back
        </motion.button>
      </div>
    )
  }

  const getFullName = (fname: string | undefined, lname: string | undefined): string => {
    const firstName = fname ? fname.charAt(0).toUpperCase() + fname.slice(1).toLowerCase() : ''
    const lastName = lname ? lname.charAt(0).toUpperCase() + lname.slice(1).toLowerCase() : ''
    return `${firstName} ${lastName}`.trim()
  }

  const getAppName = (userItem: User) => {
    let appName = ''

    if (userItem.cM_APPLICATIONS?.apP_NAME) {
      appName = userItem.cM_APPLICATIONS.apP_NAME
    }
    else if (userItem.cM_APPS_ROLES?.cM_APPLICATIONS?.apP_NAME) {
      appName = userItem.cM_APPS_ROLES.cM_APPLICATIONS.apP_NAME
    }
    else if (applications.length > 0 && userItem.apP_CODE) {
      const app = applications.find(app => app.apP_CODE === userItem.apP_CODE)
      if (app) appName = app.name
    }

    // const appCode = userItem.apP_CODE || '-'
    // return appName ? `${appCode} - ${appName}` : appCode
    return appName || 'Unknown Application'
  }

  const getRoleName = (user: User) => {
    let roleName = ''

    if (user.cM_APPS_ROLES?.name) {
      roleName = user.cM_APPS_ROLES.name
    }
    else if (roles.length > 0 && user.rolE_CODE && user.apP_CODE) {
      const role = roles.find(role => role.rolE_CODE === user.rolE_CODE && role.apP_CODE === user.apP_CODE)
      if (role) return role.name
    }

    return roleName || 'Unknown Role'
  }

  const appCode = getValue(user, ["apP_CODE"]) || "-"
  const appName = getAppName(user) || "-"
  const roleCode = getValue(user, ["rolE_CODE"]) || "-"
  const roleName = getRoleName(user) || "-"
  const userid = getValue(user, ["userid"]) || "-"
  const fname = getValue(user, ["fname"]) || ""
  const lname = getValue(user, ["lname"]) || ""
  const fullName = getFullName(fname, lname)
  const org = getValue(user, ["org"]) || "-"

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[var(--primary-color)]">{fullName}</h1>
        <motion.button
          onClick={handleBackToList}
          className="flex items-center space-x-2 bg-gray-400 text-white px-6 py-2 rounded-lg shadow-lg cursor-pointer"
          whileHover={{ 
            scale: 1.05, 
            backgroundColor: "#6B7280", 
            boxShadow: "0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)",
          }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <motion.span
            whileHover={{ x: -5 }}
            transition={{ type: "spring", stiffness: 500, damping: 20 }}
          >  
            <ChevronLeft size={20} className="-ml-1" />
          </motion.span>
          <span>Back</span>
        </motion.button>
      </div>

      {/* Application & Role Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
        <motion.div
          className="p-4 bg-gray-50 rounded-lg border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          whileHover={{ scale: 1.05 }}
        >
          <div className="flex items-center space-x-2 text-gray-600 mb-2">
            <Package size={20} className="text-[var(--primary-color)]" />
            <label className="text-sm font-semibold">APPLICATION</label>
          </div>
          <p className="text-[var(--primary-color)] font-bold text-lg">{appName}</p>
          <p className="text-sm text-gray-800 mt-1">{appCode}</p>
        </motion.div>

        <motion.div
          className="p-4 bg-gray-50 rounded-lg border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          whileHover={{ scale: 1.05 }}
        >
          <div className="flex items-center space-x-2 text-gray-600 mb-2">
            <Users size={20} className="text-[var(--primary-color)]"/>
            <label className="text-sm font-semibold">ROLE</label>
          </div>
          <p className="text-[var(--primary-color)] font-bold text-lg">{roleName}</p>
          <p className="text-sm text-gray-800 mt-1">{roleCode}</p>
        </motion.div>

        <motion.div
          className="p-4 bg-gray-50 rounded-lg border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          whileHover={{ scale: 1.05 }}
        >
          <div className="flex items-center space-x-2 text-gray-600 mb-2">
            <UserIcon size={20} className="text-[var(--primary-color)]"/>
            <label className="text-sm font-semibold">USER ID</label>
          </div>
          <p className="text-[var(--primary-color)] font-bold text-lg">{userid}</p>
        </motion.div>
      </div>

      {/* User Details Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
        <motion.div
          className="p-4 bg-gray-50 rounded-lg border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          whileHover={{ scale: 1.05 }}
        >
          <div className="flex items-center space-x-2 text-gray-600 mb-2">
            <UserIcon size={20} className="text-[var(--primary-color)]"/>
            <label className="text-sm font-semibold">NAME</label>
          </div>
          <p className="text-[var(--primary-color)] font-bold text-lg">{fullName}</p>
        </motion.div>

        <motion.div
          className="p-4 bg-gray-50 rounded-lg border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          whileHover={{ scale: 1.05 }}
        >
          <div className="flex items-center space-x-2 text-gray-600 mb-2">
            <Building size={20} className="text-[var(--primary-color)]"/>
            <label className="text-sm font-semibold">ORG</label>
          </div>
          <p className="text-[var(--primary-color)] font-bold text-lg">{org}</p>
        </motion.div>
      </div>

      {/* Pagination Controls and Display Info */}
      <div className="bg-white rounded-lg p-4 mb-4 shadow-sm border border-gray-200">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Display</span>
              <RowsPerPageSelect
                rowsPerPage={rowsPerPage}
                setRowsPerPage={handleRowsPerPageChange}
              />
              <span className="text-sm text-gray-600">Records</span>
            </div>
            <div className="text-sm text-gray-600">
              {getDisplayInfo()}
            </div>
          </div>

          {/* Pagination BTN */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      </div>

      {/* Facilities Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200"> 
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-[var(--primary-color)] text-white">
              <tr>
                <th className="text-left px-4 py-3">SITE CODE</th>
                <th className="text-left px-4 py-3">DOMAIN CODE</th>
                <th className="text-left px-4 py-3">FAC CODE</th>
              </tr>
            </thead>
            <tbody>
              {paginatedFacilities.map((facility, index) => {
                // const currentAuthCode = getValue(facility, ["autH_CODE"])
                // const isCurrentAuth = currentAuthCode === authCode
                return (
                  <tr
                    key={index}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3">{facility.sitE_CODE || "-"}</td>
                    <td className="px-4 py-3">{facility.domaiN_CODE || "-"}</td>
                    <td className="px-4 py-3">{facility.facT_CODE || "-"}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {facilities.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-500">
            <div className="text-gray-400 mb-2">
              <Building size={48} className="mx-auto" />
            </div>
            <p>No facilities found for this user.</p>
          </div>
        )}
      </div>
    </div>
  )
}