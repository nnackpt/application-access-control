"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { User } from "@/types/User"
import getValue from "@/Utils/getValue"
import Pagination from "@/Components/UI/Pagination"
import { motion } from 'framer-motion'
import { ChevronLeft, Package, Users, User as UserIcon, Building } from "lucide-react"
import RowsPerPageSelect from "@/Components/UI/Select/RowsPerPageSelect"
import { UserApi } from "@/services/UserApi"
import { Application } from '@/types/Application';
import { AppsRoles } from "@/types/AppsRoles"
import { applicationApi } from "@/services/ApplicationApi"
import { AppsRolesApi } from "@/services/AppsRolesApi"

export default function UserViewPage() {
  const { authCode } = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [user, setUser] = useState<User | null>(null)
  const [facilities, setFacilities] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [applications, setApplications] = useState<Application[]>([])
  const [roles, setRoles] = useState<AppsRoles[]>([])

  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  useEffect(() => {
    if (!authCode) {
        // console.warn("authCode is undefined or null, skipping data fetch.")
        setLoading(false)
        return
    } 

    const fetchData = async () => {
      try {
        // Get user by AUTH_CODE
        const userData = await UserApi.getUserByCode(authCode as string)
        setUser(userData)

        // Get all facilities for this user ID
        if (userData?.userid) {
          const userFacilities = await UserApi.getUserByUserId(userData.userid)
          setFacilities(userFacilities || [])
        } else {
            console.warn("User data found but no userid, no facilities to fetch.")
            setFacilities([])
        }
        const allApplication = await applicationApi.getApplications()
        setApplications(allApplication)

        const allRoles = await AppsRolesApi.getAppsRoles()
        setRoles(allRoles)

      } catch (error) {
        console.error("Failed to fetch User or facilities", error)
        setUser(null)
        setFacilities([])
        setApplications([])
        setRoles([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [authCode])

  const startIndex = (currentPage - 1) * rowsPerPage
  const endIndex = startIndex + rowsPerPage
  const paginatedFacilities = facilities.slice(startIndex, endIndex)
  const totalPages = Math.ceil(facilities.length / rowsPerPage)

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

  if (!user) return <div className="p-6 text-red-600">User Not Found</div>

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
  const userId = getValue(user, ["userid"]) || "-"
  const fname = getValue(user, ["fname"]) || ""
  const lname = getValue(user, ["lname"]) || ""
  const fullName = getFullName(fname, lname)
  const org = getValue(user, ["org"]) || "-"

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#005496]">{fullName}</h1>
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
            <Package size={20} className="text-[#005496]" />
            <label className="text-sm font-semibold">APPLICATION</label>
          </div>
          <p className="text-[#005496] font-bold text-lg">{appName}</p>
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
            <Users size={20} className="text-[#005496]"/>
            <label className="text-sm font-semibold">ROLE</label>
          </div>
          <p className="text-[#005496] font-bold text-lg">{roleName}</p>
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
            <UserIcon size={20} className="text-[#005496]"/>
            <label className="text-sm font-semibold">USER ID</label>
          </div>
          <p className="text-[#005496] font-bold text-lg">{userId}</p>
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
            <UserIcon size={20} className="text-[#005496]"/>
            <label className="text-sm font-semibold">NAME</label>
          </div>
          <p className="text-[#005496] font-bold text-lg">{fullName}</p>
        </motion.div>

        <motion.div
          className="p-4 bg-gray-50 rounded-lg border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          whileHover={{ scale: 1.05 }}
        >
          <div className="flex items-center space-x-2 text-gray-600 mb-2">
            <Building size={20} className="text-[#005496]"/>
            <label className="text-sm font-semibold">ORG</label>
          </div>
          <p className="text-[#005496] font-bold text-lg">{org}</p>
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
            <thead className="bg-[#005496] text-white">
              <tr>
                <th className="text-left px-4 py-3">SITE CODE</th>
                <th className="text-left px-4 py-3">DOMAIN CODE</th>
                <th className="text-left px-4 py-3">FAC CODE</th>
              </tr>
            </thead>
            <tbody>
              {paginatedFacilities.map((facility, index) => {
                const currentAuthCode = getValue(facility, ["autH_CODE"])
                const isCurrentAuth = currentAuthCode === authCode
                return (
                  <tr
                    key={index}
                    className={`border-b border-gray-100 ${
                      isCurrentAuth ? "bg-blue-50 font-semibold text-[#005496]" : "hover:bg-gray-50"
                    }`}
                  >
                    <td className="px-4 py-3">{getValue(facility, ["sitE_CODE"]) || "-"}</td>
                    <td className="px-4 py-3">{getValue(facility, ["domaiN_CODE"]) || "-"}</td>
                    <td className="px-4 py-3">{getValue(facility, ["facT_CODE"]) || "-"}</td>
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