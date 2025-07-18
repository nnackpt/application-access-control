"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { Rbac } from "@/types/Rbac"
import { rbacApi } from "@/services/RbacApi"
import { AppsFunctionsApi } from "@/services/AppsFunctionsApi"
import getValue from "@/Utils/getValue"
import Pagination from "@/Components/UI/Pagination"
import { motion } from 'framer-motion';
import { ChevronLeft, Package, Users } from "lucide-react"
import RowsPerPageSelect from "@/Components/UI/Select/RowsPerPageSelect"
import { AppsFunctions } from "@/types/AppsFunctions"

export default function RbacViewPage() {
  const { code } = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [rbac, setRbac] = useState<Rbac | null>(null)
  const [functions, setFunctions] = useState<AppsFunctions[]>([])
  const [loading, setLoading] = useState(true)

  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  useEffect(() => {
    if (!code) return

    const fetchData = async () => {
      try {
        const data = await rbacApi.getRbacByCode(code as string)
        setRbac(data)

        const appCode = getValue(data, ["apP_CODE"])
        if (appCode) {
          const funcList = await AppsFunctionsApi.getFunctionsByAppCode(appCode)
          setFunctions(funcList || [])
        }
      } catch (error) {
        console.error("Failed to fetch RBAC or functions", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [code])

  const startIndex = (currentPage - 1) * rowsPerPage
  const endIndex = startIndex + rowsPerPage
  const paginatedFunctions = functions.slice(startIndex, endIndex)
  const totalPages = Math.ceil(functions.length / rowsPerPage)

  const handleRowsPerPageChange = (value: number) => {
    setRowsPerPage(value)
    setCurrentPage(1)
  }

  const getDisplayInfo = () => {
    if (functions.length === 0) return "Showing 0 of 0 Records"

    if (rowsPerPage === 0) {
      return `Showing 1 to ${functions.length} of ${functions.length} Records`
    }

    const currentStartIndex = (currentPage - 1) * rowsPerPage + 1
    const currentEndIndex = Math.min(currentPage * rowsPerPage, functions.length)
    return `Showing ${currentStartIndex} to ${currentEndIndex} of ${functions.length} Records`
  }

  const handleBackToList = () => {
    const params = new URLSearchParams()

    const app = searchParams.get("app")
    const role = searchParams.get("role")
    const search = searchParams.get("search")

    if (app) params.set("app", app)
    if (role) params.set("role", role)
    if (search) params.set("search", search)

    const queryString = params.toString()
    const backUrl = queryString ? `/RBAC?${queryString}` : '/RBAC'

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

        {/* Application Info Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
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

        {/* Functions Table Skeleton */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          {/* Display Info & Rows Per Page Skeleton */}
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
                  <th className="text-left px-4 py-3">FUNC CODE</th>
                  <th className="text-left px-4 py-3">FUNC NAME</th>
                  <th className="text-left px-4 py-3">FUNC DESC</th>
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

          {/* Pagination Skeleton */}
          <div className="flex justify-end mt-4">
            <div className="h-8 bg-gray-200 rounded w-48"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!rbac) return <div className="p-6 text-red-600">RBAC Not Found</div>

  const appCode = getValue(rbac, ["apP_CODE"]) || "-"
  const appName = rbac?.cM_APPLICATIONS?.name || "-"
  const roleCode = getValue(rbac, ["rolE_CODE"]) || "-"
  const roleName = rbac?.cM_APPS_ROLES?.name || "-"
  const selectedFuncCode = getValue(rbac, ["funC_CODE"])

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#005496]">{code}</h1>
        <motion.button
          onClick={handleBackToList}
          className="flex items-center space-x-2 bg-gray-400 text-white px-6 py-2 rounded-lg shadow-lg cursor-pointer"
          whileHover={{ 
            scale: 1.05, 
            backgroundColor: "#6B7280", 
            boxShadow: "0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)",
            // x: -3
          }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <motion.span
          whileHover={{   x: -5 }}
          transition={{ type: "spring", stiffness: 500, damping: 20 }}
          >  
          <ChevronLeft size={20} className="-ml-1" />
          </motion.span>
          <span>Back</span>
        </motion.button>
      </div>

      {/* Application Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
        <motion.div
          className="p-4 bg-gray-50 rounded-lg border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          whileHover={{ scale: 1.05 }}
        >
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
            <div className="flex items-center space-x-2 text-gray-600 mb-2">
              <Package size={20} className="text-[#005496]" />
              <label className="text-sm font-semibold">APPLICATION</label>
            </div>
            <p className="text-[#005496] font-bold text-lg">{appCode}</p>
            <p className="text-sm text-gray-800 mt-1">{appName}</p>
          </div>
        </motion.div>

        <motion.div
          className="p-4 bg-gray-50 rounded-lg border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          whileHover={{ scale: 1.05 }}
        >
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
            <div className="flex items-center space-x-2 text-gray-600 mb-2">
              <Users size={20} className="text-[#005496]"/>
              <label className="text-sm font-semibold">ROLE</label>
            </div>
            <p className="text-[#005496] font-bold text-lg">{roleCode}</p>
            <p className="text-sm text-gray-800 mt-1">{roleName}</p>
          </div>
        </motion.div>
      </div>

      {/* Pagination Controls and Display Info - Moved above the table */}
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

      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200"> 
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-[#005496] text-white">
              <tr>
                <th className="text-left px-4 py-3">FUNC CODE</th>
                <th className="text-left px-4 py-3">FUNC NAME</th>
                <th className="text-left px-4 py-3">FUNC DESC</th>
              </tr>
            </thead>
            <tbody>
              {paginatedFunctions.map((func, index) => {
                const funcCode = getValue(func, ["funC_CODE"])
                const isSelected = funcCode === selectedFuncCode
                return (
                  <tr
                    key={index}
                    className={`border-b border-gray-100 ${
                      isSelected ? "bg-blue-50 font-semibold text-[#005496]" : "hover:bg-gray-50"
                    }`}
                  >
                    <td className="px-4 py-3">{funcCode}</td>
                    <td className="px-4 py-3">{getValue(func, ["name"])}</td>
                    <td className="px-4 py-3 whitespace-pre-wrap">
                      {getValue(func, ["desc"]) || "-"}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {functions.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-500">
            <div className="text-gray-400 mb-2">
              <ChevronLeft size={48} className="mx-auto rotate-90" />
            </div>
            <p>No functions found for this RBAC or application.</p>
          </div>
        )}
      </div>
    </div>
  )
}