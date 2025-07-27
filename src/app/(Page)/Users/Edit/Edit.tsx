"use client"

// import useCurrentUser from "@/hooks/useCurrentUser";
import { UserApi } from "@/services/UserApi";
import { FacilitySelectionDto, User, UsersAuthorizeUpdateRequestDto } from "@/types/User";
import { Application } from "@/types/Application";
import { AppsRoles } from "@/types/AppsRoles";
import { applicationApi } from "@/services/ApplicationApi";
import { AppsRolesApi } from "@/services/AppsRolesApi";

import getValue from "@/Utils/getValue";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { motion } from 'framer-motion';

import { Package, Save, Users, X, User as UserIcon, Building, UserX, ChevronLeft } from "lucide-react";
// import RoleTitleSelect from "@/Components/UI/Select/RoleTitleSelect";

export default function UserEditPage() {
    // const { authCode } = useParams()
    const router = useRouter()
    const searchParams = useSearchParams()
    // const { userName } = useCurrentUser()

    const authCode = searchParams.get("authCode")
    const userIdFromUrl = searchParams.get("userid")
    const appCodeFromUrl = searchParams.get("appCode")
    const roleCodeFromUrl = searchParams.get("roleCode")

    const [user, setUser] = useState<User | null>(null)
    const [allFacilities, setAllFacilities] = useState<FacilitySelectionDto[]>([])
    const [selectedFacilities, setSelectedFacilities] = useState<FacilitySelectionDto[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [formData, setFormData] = useState<UsersAuthorizeUpdateRequestDto>({
        rolE_CODE: '',
        fname: '',
        lname: '',
        org: '',
        active: true,
        facilities: []
    })
    const [error, setError] = useState("")

    const [applications, setApplications] = useState<Application[]>([])
    const [roles, setRoles] = useState<AppsRoles[]>([])
    const [allRoles, setAllRoles] = useState<AppsRoles[]>([])

    useEffect(() => {
        if (!authCode) {
            console.log("No authCode found in query params, skipping fetch.")
            setLoading(false)
            setError("No authorization code provided in the URL. Can't load user data.")
            return
        }
        console.log("authCode from query params:", authCode)
        console.log("UserID from query params:", userIdFromUrl)
        console.log("AppCode from query params:", appCodeFromUrl)
        console.log("RoleCode from query params:", roleCodeFromUrl)

        const fetchData = async () => {
            try {
                const userData = await UserApi.getUserByCode(authCode as string)
                console.log("Fetched user data:", userData)
                setUser(userData)

                if (userData && userData.userid) {
                    const allAvailableFacilities = await UserApi.getAllAvailableFacilities()
                    setAllFacilities(allAvailableFacilities)

                    const currentUserFacilities = await UserApi.getUserFacilitiesByUserId(userData.userid)
                    setSelectedFacilities(currentUserFacilities)

                    setFormData(prevForm => ({
                        ...prevForm,
                        facilities: currentUserFacilities
                    }))
                } else {
                    const allAvailableFacilities = await UserApi.getAllAvailableFacilities()
                    setAllFacilities(allAvailableFacilities)
                    setSelectedFacilities([])
                    setFormData(prevForm => ({
                        ...prevForm,
                        facilities: []
                    }))
                }
                
                // Fetch all available roles
                const allAvailRoles = await AppsRolesApi.getAppsRoles()
                setAllRoles(allAvailRoles)

                // Set initial form data
                setFormData({
                    rolE_CODE: getValue(userData, ["rolE_CODE"]) || '',
                    fname: getValue(userData, ["fname"]) || '',
                    lname: getValue(userData, ["lname"]) || '',
                    org: getValue(userData, ["org"]) || '',
                    active: getValue(userData, ["active"]) ?? true,
                    // facilities: selectedFacilities
                })

                const allApplication = await applicationApi.getApplications()
                setApplications(allApplication)
        
                const allRoles = await AppsRolesApi.getAppsRoles()
                setRoles(allRoles)
            } catch (error) {
                console.error("Failed to fetch user data or facilities", error)
                toast.error("Failed to load user data")
                setApplications([])
                setRoles([])
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [authCode, userIdFromUrl, appCodeFromUrl, roleCodeFromUrl])

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
        if (error) setError("")
    }

    const handleFacilityToggle = (facility: FacilitySelectionDto, checked: boolean) => {
        setSelectedFacilities(prev => {
            const newFacilities = checked
                ? [...prev, facility]
                : prev.filter(f => !(f.sitE_CODE === facility.sitE_CODE && f.domaiN_CODE === facility.domaiN_CODE && f.facT_CODE === facility.facT_CODE))

            // Also update formData's facilities
            setFormData(prevForm => ({
                ...prevForm,
                facilities: newFacilities
            }))
            return newFacilities
        })
        if (error) setError("")
    } 

    const handleSave = async () => {
        if (!formData.rolE_CODE || !formData.rolE_CODE.trim()) {
            setError("Role Code is required")
            return
        }
        if (selectedFacilities.length === 0) {
            setError("Please select at least one facility.")
            return
        }

        if (!user || !authCode) return

        setSaving(true)
        try {
            const updateData: UsersAuthorizeUpdateRequestDto = {
                rolE_CODE: formData.rolE_CODE,
                fname: formData.fname || undefined,
                lname: formData.lname || undefined,
                org: formData.org || undefined,
                active: formData.active,
                facilities: selectedFacilities
            }

            await UserApi.updateUser(authCode as string, updateData)
            toast.success("User updated successfully")
            router.back()
        } catch (err) {
            toast.error("Failed to update user")
            console.error("User update error", err)
        } finally {
            setSaving(false)
        }
    }

    const handleCancel = () => {
        router.back()
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

                {/* User Info Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
                    {[...Array(3)].map((_, index) => (
                        <div key={index}>
                            <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                            <div className="h-6 bg-gray-300 rounded w-3/4 mb-1"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                    ))}
                </div>

                {/* Form Skeleton */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
                    <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[...Array(6)].map((_, index) => (
                            <div key={index}>
                                <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                                <div className="h-10 bg-gray-200 rounded w-full"></div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Facilities Table Skeleton */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
                    <div className="space-y-2">
                        {[...Array(3)].map((_, index) => (
                            <div key={index} className="h-12 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    // if (!user) return <div className="p-6 text-red-600">User Not Found</div>

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
                We couldn't find any user details for ID: <span className="font-medium text-gray-800">{userIdFromUrl}</span>
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

    const appCode = getValue(user, ["apP_CODE"]) || ""
    const appName = getAppName(user) || "-"
    const fname = getValue(user, ["fname"]) || ""
    const lname = getValue(user, ["lname"]) || ""
    const fullName = getFullName(fname, lname)
    const userId = getValue(user, ["userid"]) || "-"
    const roleName = getRoleName(user) || "-"

    return (
        <div className="max-w-6xl mx-auto px-4 py-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-[#005496]">Edit User: {fullName}</h1>
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

            {/* User Info (Read-only) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
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
                    <p className="text-[#005496] font-bold text-lg">{appName}</p>
                    <p className="text-sm text-gray-800 mt-1">{appCode}</p>
                </motion.div>

                <motion.div
                    className="p-4 bg-gray-50 rounded-lg border border-gray-100"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    whileHover={{ scale: 1.02 }}
                >
                    <div className="flex items-center space-x-2 text-gray-600 mb-2">
                        <UserIcon size={20} className="text-[#005496]" />
                        <label className="text-sm font-semibold">USER ID (AD User)</label>
                    </div>
                    <p className="text-[#005496] font-bold text-lg">{userId}</p>
                    {/* <p className="text-sm text-gray-600 mt-1">Cannot be edited</p> */}
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
                        <label className="text-sm font-semibold">CURRENT ROLE</label>
                    </div>
                    <p className="text-[#005496] font-bold text-lg">{roleName}</p>
                    <p className="text-sm text-gray-800 mt-1">{getValue(user, ["rolE_CODE"]) || "-"}</p>
                </motion.div>
            </div>

            {/* Edit Form */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
                <h3 className="text-lg font-semibold text-[#005496] mb-4">Edit User Information</h3>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Role Code */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            ROLE CODE <span className="text-red-500">*</span>
                        </label>
                        <select 
                            value={formData.rolE_CODE}
                            onChange={(e) => handleInputChange('rolE_CODE', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                            disabled={saving}
                        >
                            <option value="">Select a Role</option>
                            {allRoles
                                .filter(role => role.apP_CODE === appCode)
                                .map(role => (
                                    <option key={role.rolE_CODE} value={role.rolE_CODE}>
                                        {`${role.apP_CODE} - ${role.name}`}
                                    </option>
                                ))}
                        </select>
                        {/* <input
                            type="text"
                            value={formData.rolE_CODE}
                            onChange={(e) => handleInputChange('rolE_CODE', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005496] focus:border-transparent"
                            placeholder="Enter role code"
                            disabled={saving}
                        /> */}
                        {/* <RoleTitleSelect
                            selectedRole={formData.rolE_CODE}
                            setSelectedRole={(value) => handleInputChange('rolE_CODE', value)}
                            roles={allRoles} // Pass the fetched allRoles
                            selectedAppCode={appCode} // Pass the current user's app code
                        /> */}
                    </div>

                    {/* Active Status */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            ACTIVE STATUS
                        </label>
                        <select
                            value={formData.active ? 'true' : 'false'}
                            onChange={(e) => handleInputChange('active', e.target.value === 'true')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005496] focus:border-transparent"
                            disabled={saving}
                        >
                            <option value="true">Active</option>
                            <option value="false">Inactive</option>
                        </select>
                    </div>

                    {/* First Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            FIRST NAME
                        </label>
                        <input
                            type="text"
                            value={formData.fname}
                            onChange={(e) => handleInputChange('fname', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005496] focus:border-transparent"
                            placeholder="Enter first name"
                            disabled={saving}
                        />
                    </div>

                    {/* Last Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            LAST NAME
                        </label>
                        <input
                            type="text"
                            value={formData.lname}
                            onChange={(e) => handleInputChange('lname', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005496] focus:border-transparent"
                            placeholder="Enter last name"
                            disabled={saving}
                        />
                    </div>

                    {/* Organization */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            ORGANIZATION
                        </label>
                        <input
                            type="text"
                            value={formData.org}
                            onChange={(e) => handleInputChange('org', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005496] focus:border-transparent"
                            placeholder="Enter organization"
                            disabled={saving}
                        />
                    </div>
                </div>
            </div>

            {/* Facilities Section - Now Editable */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                <div className="p-6">
                    <div className="flex items-center space-x-2 mb-4">
                        <Building size={20} className="text-[#005496]" />
                        <h3 className="text-lg font-semibold text-[#005496]">Select Facilities <span className="text-red-500">*</span></h3>
                    </div>

                    {error && error.includes("facility") && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                            {error}
                        </div>
                    )}

                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-sm">
                            <thead className="bg-[#005496] text-white">
                                <tr>
                                    <th className="text-left px-4 py-3 w-16">SELECT</th>
                                    <th className="text-left px-4 py-3">SITE CODE</th>
                                    <th className="text-left px-4 py-3">DOMAIN CODE</th>
                                    <th className="text-left px-4 py-3">FACILITY CODE</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allFacilities.map((facility) => {
                                    const isSelected = selectedFacilities.some(sf =>
                                        sf.sitE_CODE === facility.sitE_CODE &&
                                        sf.domaiN_CODE === facility.domaiN_CODE &&
                                        sf.facT_CODE === facility.facT_CODE
                                    );

                                    return (
                                        <tr
                                            key={`${facility.sitE_CODE}-${facility.domaiN_CODE}-${facility.facT_CODE}`}
                                            className={`border-b border-gray-100 ${
                                                isSelected ? "bg-blue-50 font-semibold text-[#005496]" : "hover:bg-gray-50"
                                            }`}
                                        >
                                            <td className="px-4 py-3">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={(e) => handleFacilityToggle(facility, e.target.checked)}
                                                    className="h-4 w-4 text-[#005496] focus:ring-[#005496] border-gray-300 rounded"
                                                    disabled={saving}
                                                />
                                            </td>
                                            <td className="px-4 py-3">{facility.sitE_CODE || "-"}</td>
                                            <td className="px-4 py-3">{facility.domaiN_CODE || "-"}</td>
                                            <td className="px-4 py-3">{facility.facT_CODE || "-"}</td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>

                    {allFacilities.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                            <div className="text-gray-400 mb-2">
                                <Building size={48} className="mx-auto" />
                            </div>
                            <p>No facilities found.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}