"use client"

import useCurrentUser from "@/hooks/useCurrentUser"

import { applicationApi } from "@/services/ApplicationApi"
import { AppsRolesApi } from "@/services/AppsRolesApi"
import { AppsFunctionsApi } from "@/services/AppsFunctionsApi"
import { rbacApi } from "@/services/RbacApi"
import { Application } from "@/types/Application"
import { AppsRoles } from "@/types/AppsRoles"
import { AppsFunctions } from "@/types/AppsFunctions"
import { createRbac } from "@/types/Rbac"

import { ChevronDownIcon, ChevronLeft, Package, Users } from "lucide-react"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from 'framer-motion'
import { PlusIcon } from "@heroicons/react/24/outline"
import 'react-loading-skeleton/dist/skeleton.css'

import Pagination from "@/Components/UI/Pagination"
import RowsPerPageSelect from "@/Components/UI/Select/RowsPerPageSelect"

const initForm = {
  APP_CODE: "",
  ROLE_CODE: "",
  FUNC_CODES: [],
}

// Skeleton Components
const DropdownSkeleton = () => (
  <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
    <div className="flex items-center space-x-2 text-gray-600 mb-2">
      <Skeleton circle width={20} height={20} />
      <Skeleton width={100} height={16} />
    </div>
    <Skeleton height={52} className="rounded-lg" />
  </div>
)

const FunctionTableSkeleton = () => (
  <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
    <div className="p-4 bg-[#005496] text-white">
      <Skeleton height={24} width={100} baseColor="#004080" highlightColor="#0066cc" />
    </div>
    
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="text-left px-4 py-3 w-16">
              <Skeleton width={16} height={16} />
            </th>
            <th className="text-left px-4 py-3">
              <Skeleton width={80} height={16} />
            </th>
            <th className="text-left px-4 py-3">
              <Skeleton width={90} height={16} />
            </th>
            <th className="text-left px-4 py-3">
              <Skeleton width={100} height={16} />
            </th>
          </tr>
        </thead>
        <tbody>
          {[...Array(5)].map((_, index) => (
            <tr key={index} className="border-b border-gray-100">
              <td className="px-4 py-3">
                <Skeleton width={16} height={16} />
              </td>
              <td className="px-4 py-3">
                <Skeleton width={80} height={16} />
              </td>
              <td className="px-4 py-3">
                <Skeleton width={120} height={16} />
              </td>
              <td className="px-4 py-3">
                <Skeleton width={150} height={16} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)

const PaginationSkeleton = () => (
  <div className="bg-white rounded-lg p-4 mb-4 shadow-sm border border-gray-200">
    <div className="flex justify-between items-center">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Skeleton width={50} height={16} />
          <Skeleton width={80} height={32} />
          <Skeleton width={60} height={16} />
        </div>
        <Skeleton width={150} height={16} />
      </div>
      <Skeleton width={200} height={32} />
    </div>
  </div>
)

export default function RbacCreatePage() {
  const [form, setForm] = useState<createRbac>(initForm)
  const [error, setError] = useState<{ [key: string]: string }>({})
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true) // เพิ่มสำหรับ loading ตอนเริ่มต้น
  const [applications, setApplications] = useState<Application[]>([])
  const [roles, setRoles] = useState<AppsRoles[]>([])
  const [functions, setFunctions] = useState<AppsFunctions[]>([])
  const [loadingAssignedFuncs, setLoadingAssignedFuncs] = useState(false)

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const { userName } = useCurrentUser()
  const router = useRouter()

  const [showAppDropDown, setShowAppDropdown] = useState(false)
  const [showRoleDropDown, setShowRoleDropdown] = useState(false)

  useEffect(() => {
    Promise.all([
      applicationApi.getApplications(),
      AppsRolesApi.getAppsRoles(),
      AppsFunctionsApi.getAppsFunctions()
    ])
      .then(([apps, rolesData, funcs]) => {
        setApplications(apps)
        setRoles(rolesData)
        setFunctions(funcs)
        setInitialLoading(false) 
      })
      .catch(() => {
        toast.error("ERROR LOADING DATA")
        setInitialLoading(false)
      })
  }, [])

  // const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
  //   const { name, value } = e.target
  //   setForm((prev: any) => ({ ...prev, [name]: value }))
  //   if (error[name]) setError(prev => ({ ...prev, [name]: "" }))
  // }

  const handleCheck = (funcCode: string, checked: boolean) => {
    setForm((prev) => ({
      ...prev,
      FUNC_CODES: checked
        ? [...prev.FUNC_CODES, funcCode]
        : prev.FUNC_CODES.filter((code) => code !== funcCode),
    }))
    if (error.FUNC_CODES) setError((prev) => ({ ...prev, FUNC_CODES: "" }))
  }

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}
    if (!form.APP_CODE) newErrors.APP_CODE = "APP Code is required"
    if (!form.ROLE_CODE) newErrors.ROLE_CODE = "Role Code is required"
    if (!form.FUNC_CODES || form.FUNC_CODES.length === 0) newErrors.FUNC_CODES = "Select at least one function"
    setError(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return
    setLoading(true)
    try {
      await rbacApi.createRbac({ ...form, createD_BY: userName })
      toast.success("SUCCESSFULLY CREATED!")
      router.push("/RBAC")
    } catch (err) {
      toast.error("CREATED FAILED!")
      console.error("RBAC create error", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let isCancelled = false

    const fetchAssignedFuncs = async () => {
      if (!form.APP_CODE || !form.ROLE_CODE) {
        setForm((prev: createRbac) => ({ ...prev, FUNC_CODES: [] }))
        return
      }

      setLoadingAssignedFuncs(true)
      try {
        const assigned = await rbacApi.getAssignedFuncCodes(form.APP_CODE, form.ROLE_CODE)
        if (!isCancelled) {
          setForm((prev: createRbac) => ({
            ...prev,
            FUNC_CODES: assigned || []
          }))
        }
      } catch (err) {
        if (!isCancelled) {
          console.error("Failed to load assigned functions", err)
          setForm((prev: createRbac) => ({ ...prev, FUNC_CODES: [] }))
        }
      } finally {
        if (!isCancelled) {
          setLoadingAssignedFuncs(false)
        }
      }
    }

    fetchAssignedFuncs()
    return () => { isCancelled = true }
  }, [form.APP_CODE, form.ROLE_CODE])

  // Filter functions based on selected APP_CODE
  const filteredFunctions = functions.filter(f => f.apP_CODE === form.APP_CODE)

  // Pagination Logic
  const startIndex = (currentPage - 1) * rowsPerPage
  const endIndex = startIndex + rowsPerPage
  const paginatedFunctions = filteredFunctions.slice(startIndex, endIndex)
  const totalPages = Math.ceil(filteredFunctions.length / rowsPerPage)

  const handleRowsPerPageChange = (value: number) => {
    setRowsPerPage(value)
    setCurrentPage(1)
  }

  const getDisplayInfo = () => {
    if (filteredFunctions.length === 0) return "Showing 0 of 0 Records"

    if (rowsPerPage === 0) {
      return `Showing 1 to ${filteredFunctions.length} of ${filteredFunctions.length} Records`
    }

    const currentStartIndex = (currentPage - 1) * rowsPerPage + 1
    const currentEndIndex = Math.min(currentPage * rowsPerPage, filteredFunctions.length)
    return `Showing ${currentStartIndex} to ${currentEndIndex} of ${filteredFunctions.length} Records`
  }

  // Get selected application and role info
  const selectedApp = applications.find(app => app.apP_CODE === form.APP_CODE)
  const selectedRole = roles.find(role => role.rolE_CODE === form.ROLE_CODE)

  return (
    <SkeletonTheme baseColor="#f3f4f6" highlightColor="#e5e7eb">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          {initialLoading ? (
            <Skeleton width={300} height={32} />
          ) : (
            <h1 className="text-2xl font-bold text-[#005496]">CREATE APPLICATION&apos;S RBAC</h1>
          )}
          {initialLoading ? (
            <Skeleton width={100} height={40} className="rounded-lg" />
          ) : (
            <motion.button
              onClick={() => router.back()}
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
          )}
        </div>

        {/* Application and Role Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
          {initialLoading ? (
            <>
              <DropdownSkeleton />
              <DropdownSkeleton />
            </>
          ) : (
            <>
              {/* APP Code */}
              <motion.div
                className="p-4 bg-gray-50 rounded-lg border border-gray-100"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <div className="flex items-center space-x-2 text-gray-600 mb-2">
                  <Package size={20} className="text-[#005496]" />
                  <label className="text-sm font-semibold">APPLICATION <span className="text-red-500">*</span></label>
                </div>
                <div className="relative">
                  <button
                    onClick={() => setShowAppDropdown(prev => !prev)}
                    className={`w-full p-3 border rounded-lg text-left flex justify-between items-center  
                      focus:ring-2 focus:ring-[#005496] focus:border-[#005496] cursor-pointer 
                      ${error.APP_CODE ? 'border-red-500' : 'border-gray-300'}`}
                    disabled={loading}
                  >
                    <div>
                      <span className="text-[#005496] font-bold text-lg block">
                        {selectedApp?.apP_CODE || "Select APP Code"}
                      </span>
                      {selectedApp && (
                        <span className="text-sm text-gray-800">{selectedApp.title}</span>
                      )}
                    </div>
                    <motion.div animate={{ rotate: showAppDropDown ? 180 : 0 }} transition={{ duration: 0.2 }}>
                      <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                    </motion.div>
                  </button>

                  <AnimatePresence>
                    {showAppDropDown && (
                      <motion.ul
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="absolute z-10 w-full mt-1 max-h-60 overflow-y-auto bg-white border border-gray-300 rounded-lg shadow-lg"
                      >
                        {applications.map(app => (
                          <li
                            key={app.apP_CODE}
                            onClick={() => {
                              setForm((prev) => ({ ...prev, APP_CODE: app.apP_CODE, ROLE_CODE: "", FUNC_CODES: [] }))
                              setShowAppDropdown(false)
                              setCurrentPage(1)
                            }}
                            className="px-4 py-2 hover:bg-[#005496] hover:text-white cursor-pointer text-sm"
                          >
                            <div className="font-semibold">{app.apP_CODE}</div>
                            <div className="text-xs opacity-80">{app.title}</div>
                          </li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </div>
                {error.APP_CODE && <p className="text-red-500 text-sm mt-1">{error.APP_CODE}</p>}
              </motion.div>

              {/* Role Code */}
              <motion.div
                className="p-4 bg-gray-50 rounded-lg border border-gray-100"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <div className="flex items-center space-x-2 text-gray-600 mb-2">
                  <Users size={20} className="text-[#005496]"/>
                  <label className="text-sm font-semibold">ROLE <span className="text-red-500">*</span></label>
                </div>
                <div className="relative">
                  <button
                    onClick={() => setShowRoleDropdown(prev => !prev)}
                    className={`w-full p-3 border rounded-lg text-left flex justify-between items-center
                      focus:ring-2 focus:ring-[#005496] focus:border-[#005496] cursor-pointer 
                      ${error.ROLE_CODE ? 'border-red-500' : 'border-gray-300'}`}
                    disabled={loading || !form.APP_CODE}
                  >
                    <div>
                      <span className="text-[#005496] font-bold text-lg block">
                        {selectedRole?.rolE_CODE || "Select Role Code"}
                      </span>
                      {selectedRole && (
                        <span className="text-sm text-gray-800">{selectedRole.name}</span>
                      )}
                    </div>
                    <motion.div animate={{ rotate: showRoleDropDown ? 180 : 0 }} transition={{ duration: 0.2 }}>
                      <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                    </motion.div>
                  </button>

                  <AnimatePresence>
                    {showRoleDropDown && (
                      <motion.ul
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="absolute z-10 w-full mt-1 max-h-60 overflow-y-auto bg-white border border-gray-300 rounded-lg shadow-lg"
                      >
                        {roles.filter(r => r.apP_CODE === form.APP_CODE).map(role => (
                          <li
                            key={role.rolE_CODE}
                            onClick={() => {
                              setForm((prev: createRbac) => ({
                                ...prev,
                                ROLE_CODE: role.rolE_CODE!,
                                FUNC_CODES: []
                              }))
                              setShowRoleDropdown(false)
                              setCurrentPage(1)
                            }}
                            className="px-4 py-2 hover:bg-[#005496] hover:text-white cursor-pointer text-sm"
                          >
                            <div className="font-semibold">{role.rolE_CODE}</div>
                            <div className="text-xs opacity-80">{role.name}</div>
                          </li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </div>
                {error.ROLE_CODE && <p className="text-red-500 text-sm mt-1">{error.ROLE_CODE}</p>}
              </motion.div>
            </>
          )}
        </div>

        {/* Functions Section */}
        {form.APP_CODE && (
          <>
            {/* Pagination Controls and Display Info */}
            {loadingAssignedFuncs ? (
              <PaginationSkeleton />
            ) : (
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
            )}

            {/* Functions Table */}
            {loadingAssignedFuncs ? (
              <FunctionTableSkeleton />
            ) : (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                <div className="p-4 bg-[#005496] text-white">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Functions</h3>
                    {loadingAssignedFuncs && (
                      <span className="text-blue-200 text-sm">(Loading assigned functions...)</span>
                    )}
                  </div>
                  {error.FUNC_CODES && (
                    <p className="text-red-200 text-sm mt-1">{error.FUNC_CODES}</p>
                  )}
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-4 py-3 w-16">
                          <input
                            type="checkbox"
                            checked={paginatedFunctions.length > 0 && paginatedFunctions.every(func => 
                              form.FUNC_CODES.includes(func.funC_CODE)
                            )}
                            onChange={(e) => {
                              const allFuncCodes = paginatedFunctions.map((func) => func.funC_CODE)
                              if (e.target.checked) {
                                setForm((prev) => ({
                                  ...prev,
                                  FUNC_CODES: [...new Set([...prev.FUNC_CODES, ...allFuncCodes])],
                                }))
                              } else {
                                setForm((prev) => ({
                                  ...prev,
                                  FUNC_CODES: prev.FUNC_CODES.filter(
                                    (code: string) => !allFuncCodes.includes(code)
                                  ),
                                }))
                              }
                            }}
                            disabled={loadingAssignedFuncs || paginatedFunctions.length === 0}
                          />
                        </th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-700">FUNC CODE</th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-700">FUNC NAME</th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-700">FUNC DESC</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedFunctions.map((func) => {
                        const isSelected = form.FUNC_CODES.includes(func.funC_CODE)
                        return (
                          <tr
                            key={func.funC_CODE}
                            className={`border-b border-gray-100 ${
                              isSelected ? "bg-blue-50" : "hover:bg-gray-50"
                            }`}
                          >
                            <td className="px-4 py-3">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => handleCheck(func.funC_CODE, e.target.checked)}
                                disabled={loadingAssignedFuncs}
                              />
                            </td>
                            <td className={`px-4 py-3 ${isSelected ? 'font-semibold text-[#005496]' : ''}`}>
                              {func.funC_CODE}
                            </td>
                            <td className={`px-4 py-3 ${isSelected ? 'font-semibold text-[#005496]' : ''}`}>
                              {func.name}
                            </td>
                            <td className={`px-4 py-3 whitespace-pre-wrap ${isSelected ? 'font-semibold text-[#005496]' : ''}`}>
                              {func.desc || "-"}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {filteredFunctions.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <div className="text-gray-400 mb-2">
                      <ChevronLeft size={48} className="mx-auto rotate-90" />
                    </div>
                    <p>No functions found for this application.</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Buttons */}
        <div className="flex justify-end space-x-4 mt-8 pt-3">
          {initialLoading ? (
            <Skeleton width={120} height={40} className="rounded-lg" />
          ) : (
            <motion.button
              onClick={handleSubmit}
              className="flex items-center space-x-2 bg-[var(--primary-color)] text-white px-6 py-2 rounded-lg shadow-lg cursor-pointer"
              whileHover={{ 
                scale: 1.05, 
                backgroundColor: "var(--primary-color-dark)", 
                boxShadow: "0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)",
              }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              disabled={loading || loadingAssignedFuncs || initialLoading}
            >
              <motion.span
                whileHover={{ x: -5 }}
                transition={{ type: "spring", stiffness: 500, damping: 20 }}
              >  
                <PlusIcon className="w-4 h-4 -ml-1" />
              </motion.span>
              <span>{loading ? "Creating..." : "Create"}</span>
            </motion.button>
          )}
        </div>
      </div>
    </SkeletonTheme>
  )
}