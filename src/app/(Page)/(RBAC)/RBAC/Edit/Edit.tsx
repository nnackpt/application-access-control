"use client"

import useCurrentUser from "@/hooks/useCurrentUser";
import { AppsFunctionsApi } from "@/services/AppsFunctionsApi";
import { rbacApi, RbacUpdateData } from "@/services/RbacApi";
import { Rbac } from "@/types/Rbac";
import getValue from "@/Utils/getValue";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { motion } from 'framer-motion';
import { ChevronLeft, Package, Save, Users, UserX, X } from "lucide-react";
import { AppsFunctions } from "@/types/AppsFunctions";

export default function RbacEditPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const code = searchParams.get('code')
    const { userName }  = useCurrentUser()

    const [rbac, setRbac] = useState<Rbac | null>(null)
    const [functions, setFunctions] = useState<AppsFunctions[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [selectedFuncCodes, setSelectedFuncCodes] = useState<string[]>([])
    const [error, setError] = useState("")

    useEffect(() => {
        if (!code) {
            setLoading(false)
            return
        }

        const fetchData = async () => {
            try {
                const data = await rbacApi.getRbacByCode(code as string)
                setRbac(data)

                const appCode = getValue(data, ["apP_CODE"])
                if (appCode) {
                    const funcList = await AppsFunctionsApi.getFunctionsByAppCode(appCode)
                    setFunctions(funcList || [])
                }

                const roleCode = getValue(data, ["rolE_CODE"])
                if (appCode && roleCode) {
                    const assigned = await rbacApi.getAssignedFuncCodes(appCode, roleCode)
                    setSelectedFuncCodes(assigned || [])
                }
            } catch (error) {
                console.error("Failed to fetch RBAC or functions", error)
                toast.error("Failed to load RBAC data")
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [code])

    const handleFunctionToggle = (funcCode: string, checked: boolean) => {
        setSelectedFuncCodes(prev => 
            checked
                ? [...prev, funcCode]
                : prev.filter(code => code !== funcCode)
        )
        if (error) setError("")
    }

    const handleSave = async () => {
        if (selectedFuncCodes.length === 0) {
            setError("Please select at least one function")
            return
        }

        if (!rbac || !code) return

        setSaving(true)
        try {
            const appCode = getValue(rbac, ["apP_CODE"]) || ""
            const roleCode = getValue(rbac, ["rolE_CODE"]) || ""

            const updateData: RbacUpdateData = {
                APP_CODE: appCode,
                ROLE_CODE: roleCode,
                FUNC_CODES: selectedFuncCodes,
                UPDATED_BY: userName
            }

            await rbacApi.updateRbac(code as string, updateData)
            toast.success("RBAC updated successfully")
            router.back()
        } catch (err) {
            toast.error("Failed to update RBAC")
            console.error("RBAC update error", err)
        } finally {
            setSaving(false)
        }
    }

    const handleCancel = () => {
        router.back()
    }

    // แสดง error ถ้าไม่มี code parameter
    if (!code) {
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
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Missing RBAC Code</h1>
                    <p className="text-gray-600">
                        Please provide a valid RBAC code in the URL parameters.
                    </p>
                </motion.div>

                <motion.button
                    whileHover={{
                        scale: 1.05,
                        backgroundColor: "#4B5563",
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

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto px-4 py-6 animate-pulse">
                {/* Header Skeleton */}
                <div className="flex justify-between items-center mb-6">
                    <div className="h-8 bg-gray-200 rounded w-48"></div>
                    <div className="flex space-x-2">
                        <div className="h-10 bg-gray-200 rounded w-24"></div>
                        <div className="h-10 bg-gray-200 rounded w-24"></div>
                    </div>
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

                {/* Functions Section Skeleton */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[...Array(6)].map((_, index) => (
                            <div key={index} className="flex items-center space-x-2">
                                <div className="h-4 w-4 bg-gray-200 rounded"></div>
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }
    
    if (!rbac) {
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
            <h1 className="text-3xl font-bold text-gray-800 mb-2">RBAC Not Found</h1>
            <p className="text-gray-600">
                We couldn&apos;t find any RBAC details for code: <span className="font-medium text-gray-800">{code}</span>
            </p>
            </motion.div>

            <motion.button
            whileHover={{
                scale: 1.05,
                backgroundColor: "#4B5563",
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

    const appCode = getValue(rbac, ["apP_CODE"]) || ""
    const appName = rbac?.cM_APPLICATIONS?.name || "-"
    const roleCode = getValue(rbac, ["rolE_CODE"]) || "-"
    const roleName = rbac?.cM_APPS_ROLES?.name || "-"

    return (
        <div className="max-w-6xl mx-auto px-4 py-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-[#005496]">Edit RBAC: {code}</h1>
                <div className="flex space-x-2">
                    <motion.button
                        onClick={handleCancel}
                        className="flex items-center space-x-2 bg-gray-400 text-white px-6 py-2 rounded-lg shadow-lg cursor-pointer"
                        whileHover={{
                            scale: 1.05,
                            backgroundColor: "#6B7280",
                            boxShadow: "0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)"
                        }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                        disabled={saving}
                    >
                        <X size={20} />
                        <span>Cancel</span>
                    </motion.button>

                    <motion.button
                        onClick={handleSave}
                        className="flex items-center space-x-2 bg-[#005496] text-white px-6 py-2 rounded-lg shadow-lg cursor-pointer"
                        whileHover={{
                            scale: 1.05,
                            backgroundColor: "#004080",
                            boxShadow: "0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)"
                        }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                        disabled={saving}
                    >
                        <Save size={20} />
                        <span>{saving ? "Saving..." : "Save"}</span>
                    </motion.button>
                </div>
            </div>

            {/* Application Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
                <motion.div
                    className="p-4 bg-gray-50 rounded-lg border border-gray-100"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    whileHover={{ scale: 1.02 }}
                >
                    <div className="flex items-center space-x-2 text-gray-600 mb-2">
                        <Package size={20} className="text-[#005496]" />
                        <label className="text-sm font-semibold">APPLICATION</label>
                    </div>
                    <p className="text-[#005496] font-bold text-lg">{appCode}</p>
                    <p className="text-sm text-gray-800 mt-1">{appName}</p>
                </motion.div>

                <motion.div
                    className="p-4 bg-gray-50 rounded-lg border border-gray-100"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    whileHover={{ scale: 1.02 }}
                >
                    <div className="flex items-center space-x-2 text-gray-600 mb-2">
                        <Users size={20} className="text-[#005496]" />
                        <label className="text-sm font-semibold">ROLE</label>
                    </div>
                    <p className="text-[#005496] font-bold text-lg">{roleCode}</p>
                    <p className="text-sm text-gray-800 mt-1">{roleName}</p>
                </motion.div>
            </div>

            {/* Functions Section */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                <div className="p-6">
                    <h3 className="text-lg font-semibold text-[#005496] mb-4">Select Functions</h3>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                            {error}
                        </div>
                    )}

                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-sm">
                            <thead className="bg-[#005496] text-white">
                                <tr>
                                    <th className="text-left px-4 py-3 w-16">SELECT</th>
                                    <th className="text-left px-4 py-3">FUNC CODE</th>
                                    <th className="text-left px-4 py-3">FUNC NAME</th>
                                </tr>
                            </thead>
                            <tbody>
                                {functions.map((func, index) => {
                                    const funcCode = getValue<string>(func, ["funC_CODE"])
                                    if (!funcCode) return null
                                    const isSelected = selectedFuncCodes.includes(funcCode)

                                    return (
                                        <tr
                                            key={index}
                                            className={`border-b border-gray-100 ${
                                                isSelected ? "bg-blue-50 font-semibold text-[#005496]" : "hover:bg-gray-50"
                                            }`}
                                        >
                                            <td className="px-4 py-3">
                                                <input 
                                                    type="checkbox"  
                                                    value={funcCode}
                                                    checked={isSelected}
                                                    onChange={(e) => handleFunctionToggle(funcCode, e.target.checked)}
                                                    className="h-4 w-4 text-[#005496] focus:ring-[#005496] border-gray-300 rounded"
                                                    disabled={saving}    
                                                />
                                            </td>
                                            <td className="px-4 py-3">{funcCode}</td>
                                            <td className="px-4 py-3">{getValue(func, ["name"]) || "-"}</td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>

                    {functions.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                            <div className="text-gray-400 mb-2">
                                <ChevronLeft size={48} className="mx-auto rotate-90" />
                            </div>
                            <p>No functions found for this application.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}