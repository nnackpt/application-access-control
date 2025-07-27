"use client"

// import useCurrentUser from "@/hooks/useCurrentUser"

import { applicationApi } from "@/services/ApplicationApi"
import { AppsRolesApi } from "@/services/AppsRolesApi"
import { UserApi } from "@/services/UserApi"
import { Application } from "@/types/Application"
import { AppsRoles } from "@/types/AppsRoles"
import { FacilitySelectionDto, UsersAuthorizeCreateRequestDto } from "@/types/User"

import { ChevronLeft } from "lucide-react"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from 'framer-motion'
import { PlusIcon } from "@heroicons/react/24/outline"
import 'react-loading-skeleton/dist/skeleton.css'

import AppTitleSelect from "@/Components/UI/Select/AppTitleSelect"
import RoleTitleSelect from "@/Components/UI/Select/RoleTitleSelect"
// import BackButton from "@/Components/UI/Button/BackButton"

const initForm: UsersAuthorizeCreateRequestDto = {
    apP_CODE: "",
    rolE_CODE: "",
    userid: "",
    facilities: [],
    fname: "",
    lname: "",
    org: "",
    active: true, 
}

// Define the structure for a Facility entry
interface Facility {
    sitE_CODE: string;
    domaiN_CODE: string;
    facT_CODE: string;
}

// Skeleton Components
const DropdownSkeleton = () => (
    <div className="p-4 bg-gray-50 rounded-lg shadow-inner">
        <Skeleton width={150} />
        <Skeleton height={40} className="mt-2" />
    </div>
)

const InputSkeleton = () => (
    <div className="p-4 bg-gray-50 rounded-lg shadow-inner">
        <Skeleton width={100} />
        <Skeleton height={40} className="mt-2" />
    </div>
)

const CheckboxSkeleton = () => (
    <div className="flex items-center space-x-2 p-4 bg-gray-50 rounded-lg shadow-inner">
        <Skeleton circle width={20} height={20} />
        <Skeleton width={80} height={20} />
    </div>
)

const FacilityTableSkeleton = () => (
    <div className="bg-gray-50 p-4 rounded-lg shadow-inner">
        <Skeleton height={30} width="100%" className="mb-2" />
        {[...Array(3)].map((_, i) => (
            <div key={i} className="flex space-x-4 mb-2">
                <Skeleton width="30%" height={20} />
                <Skeleton width="30%" height={20} />
                <Skeleton width="30%" height={20} />
            </div>
        ))}
    </div>
)

export default function UserCreate() {
    const router = useRouter()
    // const { currentUser } = useCurrentUser()
    const searchParams = useSearchParams()
    const [form, setForm] = useState<UsersAuthorizeCreateRequestDto>(initForm)
    const [applications, setApplications] = useState<Application[]>([])
    const [roles, setRoles] = useState<AppsRoles[]>([])
    const [loading, setLoading] = useState(false)
    const [initialLoading, setInitialLoading] = useState(true)
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [isEditMode, setIsEditMode] = useState(false)
    const [currentAuthCode, setCurrentAuthCode] = useState<string | null>(null)
    const [allFacilities, setAllFacilities] = useState<FacilitySelectionDto[]>([])

    // Dummy data for facilities - replace with actual API call if available
    // const allFacilities: Facility[] = [
    //     { sitE_CODE: "ATH_AB", domaiN_CODE: "ATHAB", facT_CODE: "ATA" },
    //     { sitE_CODE: "ATH_SW", domaiN_CODE: "ATHSW", facT_CODE: "ATA" },
    //     { sitE_CODE: "ATH_TE", domaiN_CODE: "ATHTE", facT_CODE: "ATA" },
    //     { sitE_CODE: "ATH_EL", domaiN_CODE: "ATHEL", facT_CODE: "ATH" },
    //     { sitE_CODE: "ATH_SB", domaiN_CODE: "ATHSB", facT_CODE: "ATH" },
    //     { sitE_CODE: "ATH_SB", domaiN_CODE: "ATHSB", facT_CODE: "TCB" },
    //     { sitE_CODE: "ATH_SP", domaiN_CODE: "ATHSP", facT_CODE: "TCS" },
    // ];

    useEffect(() => {
        const fetchData = async () => {
            setInitialLoading(true)
            try {
                const [appRes, rolesRes, allFacilitiesRes] = await Promise.all([
                    applicationApi.getApplications(),
                    AppsRolesApi.getAppsRoles(),
                    UserApi.getAllAvailableFacilities()
                ])
                setApplications(appRes || [])
                setRoles(rolesRes || [])
                setAllFacilities(allFacilitiesRes || [])

                const authCodeFromUrl = searchParams.get('authCode')
                if (authCodeFromUrl) {
                    setIsEditMode(true)
                    setCurrentAuthCode(authCodeFromUrl)

                    // const userId = searchParams.get('userid')
                    // const appCode = searchParams.get('appCode')
                    // const roleCode = searchParams.get('roleCode')
                    // const fname = searchParams.get('fname')
                    // const lname = searchParams.get('lname')
                    // const org = searchParams.get('org')
                    // const active = searchParams.get('active') === 'true'

                    const userDataFromApi = await UserApi.getUserByCode(authCodeFromUrl) 
                    // const activeStatus = userDataFromApi?.active ?? false

                    let userFacilities: FacilitySelectionDto[] = []
                    if (userDataFromApi?.userid) {
                        userFacilities = await UserApi.getUserFacilitiesByUserId(userDataFromApi.userid) as unknown as FacilitySelectionDto[]
                    }

                    setForm({
                        apP_CODE: userDataFromApi?.apP_CODE || "",
                        rolE_CODE: userDataFromApi?.rolE_CODE || "",
                        userid: userDataFromApi?.userid || "",
                        fname: userDataFromApi?.fname || "",
                        lname: userDataFromApi?.lname || "",
                        org: userDataFromApi?.org || "",
                        active: userDataFromApi?.active ?? false,
                        facilities: userFacilities || []
                    })
                } else {
                    setIsEditMode(false)
                    setCurrentAuthCode(null)
                    setForm(initForm)
                }
            } catch (error) {
                toast.error("Failed to load initial data.")
                console.error("Error fetching dropdown data:", error)
            } finally {
                setInitialLoading(false)
            }
        }
        fetchData()
    }, [searchParams])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target
        if (type === 'checkbox') {
            setForm(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }))
        } else if (name === 'active') {
            setForm(prev => ({ ...prev, [name]: value === 'true' }))
        }
        else {
            setForm(prev => ({ ...prev, [name]: value }))
        }
        setErrors(prev => ({ ...prev, [name]: '' }))
    }

    const handleAppSelectChange = (appCode: string) => {
        setForm(prev => ({ ...prev, apP_CODE: appCode, rolE_CODE: "" })) 
        setErrors(prev => ({ ...prev, apP_CODE: '' }))
    }

    const handleRoleSelectChange = (roleCode: string) => {
        setForm(prev => ({ ...prev, rolE_CODE: roleCode }))
        setErrors(prev => ({ ...prev, rolE_CODE: '' }))
    }

    const handleFacilityToggle = (facility: FacilitySelectionDto) => {
        setForm(prev => {
            const isSelected = prev.facilities?.some(f =>
                f.sitE_CODE === facility.sitE_CODE &&
                f.domaiN_CODE === facility.domaiN_CODE &&
                f.facT_CODE === facility.facT_CODE
            )

            if (isSelected) {
                return {
                    ...prev,
                    facilities: prev.facilities?.filter(f =>
                        !(f.sitE_CODE === facility.sitE_CODE &&
                          f.domaiN_CODE === facility.domaiN_CODE &&
                          f.facT_CODE === facility.facT_CODE)
                    )
                }
            } else {
                return {
                    ...prev,
                    facilities: [...(prev.facilities || []), facility]
                }
            }
        })
        setErrors(prev => ({ ...prev, facilities: '' }))
    }

    const validateForm = () => {
        const newErrors: Record<string, string> = {}
        if (!form.apP_CODE) newErrors.apP_CODE = "Application is required."
        if (!form.rolE_CODE) newErrors.rolE_CODE = "Role is required."
        if (!form.userid.trim()) newErrors.userid = "User ID is required."
        if (!form.fname?.trim()) newErrors.fname = "First Name is required."
        if (!form.lname?.trim()) newErrors.lname = "Last Name is required."
        if (!form.org?.trim()) newErrors.org = "Organization is required."
        if (!form.facilities || form.facilities.length === 0) newErrors.facilities = "At least one facility must be selected."

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async () => {
        if (!validateForm()) {
            toast.error("Please correct the errors in the form.")
            return
        }

        setLoading(true)
        try {
            const payload : UsersAuthorizeCreateRequestDto = {
                apP_CODE: form.apP_CODE,
                rolE_CODE: form.rolE_CODE,
                userid: form.userid,
                facilities: form.facilities,
                fname: form.fname,
                lname: form.lname,
                org: form.org,
                active: form.active,
            }

            if (isEditMode && currentAuthCode) {
                await UserApi.updateUser(currentAuthCode, payload)
                toast.success("User authorization updated successfully!")
                console.log("User authorization updated successfully!", payload)
            } else {
                await UserApi.createUser(payload)
                toast.success("User authorization created successfully!")
                console.log("User authorization created successfully!", payload)
            }

            router.push("/Users") 
        } catch (error) {
            if (isEditMode) {
                toast.error("Failed tp updated user authorization.")
                console.error("Error updated user authorization:", error)
            } else {
                toast.error("Failed to create user authorization.")
                console.error("Error creating user authorization:", error)
            }
        } finally {
            setLoading(false)
        }
    }

    const filteredRoles = roles.filter(role => role.apP_CODE === form.apP_CODE)

    return (
        <SkeletonTheme baseColor="#e0e0e0" highlightColor="#f5f5f5">
            <main className="min-h-screen p-6">
                <div className="flex justify-between items-center mb-6">
                    {initialLoading ? (
                        <Skeleton width={300} height={32} />
                    ) : (
                        <h1 className="text-2xl font-bold text-[var(--primary-color)]">
                            {isEditMode ? "EDIT APPLICATION'S USERS AUTHORIZED" : "CREATE APPLICATION'S USERS AUTHORIZED"}
                        </h1>
                    )}
                    {initialLoading ? (
                        <Skeleton width={100} height={40} className="rounded-lg" />
                    ) : (
                        // <BackButton router={router} />
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

                <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
                    {/* Dropdowns and Inputs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {initialLoading ? (
                            <>
                                <DropdownSkeleton />
                                <DropdownSkeleton />
                                <InputSkeleton />
                                <InputSkeleton />
                                <InputSkeleton />
                                <InputSkeleton />
                                <CheckboxSkeleton />
                            </>
                        ) : (
                            <>
                                {/* Application Select */}
                                <div>
                                    <label htmlFor="appCode" className="block text-sm font-medium text-gray-700 mb-1">Application <span className="text-red-500">*</span></label>
                                    <AppTitleSelect
                                        selectedTitle={form.apP_CODE}
                                        setSelectedTitle={handleAppSelectChange}
                                        applications={applications}
                                        // disabled={isEditMode}
                                    />
                                    {errors.apP_CODE && <p className="text-red-500 text-xs mt-1">{errors.apP_CODE}</p>}
                                </div>

                                {/* Role Select */}
                                <div>
                                    <label htmlFor="roleCode" className="block text-sm font-medium text-gray-700 mb-1">Role <span className="text-red-500">*</span></label>
                                    <RoleTitleSelect
                                        selectedRole={form.rolE_CODE}
                                        setSelectedRole={handleRoleSelectChange}
                                        roles={filteredRoles}
                                        selectedAppCode={form.apP_CODE}
                                        // disabled={isEditMode}
                                    />
                                    {errors.rolE_CODE && <p className="text-red-500 text-xs mt-1">{errors.rolE_CODE}</p>}
                                </div>

                                {/* User ID (AD User) */}
                                <div>
                                    <label htmlFor="userid" className="block text-sm font-medium text-gray-700 mb-1">USERID (AD User) <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        id="userid"
                                        name="userid"
                                        value={form.userid}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] sm:text-sm"
                                        disabled={isEditMode}
                                    />
                                    {errors.userid && <p className="text-red-500 text-xs mt-1">{errors.userid}</p>}
                                </div>

                                {/* First Name */}
                                <div>
                                    <label htmlFor="fname" className="block text-sm font-medium text-gray-700 mb-1">FIRST NAME <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        id="fname"
                                        name="fname"
                                        value={form.fname}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] sm:text-sm"
                                    />
                                    {errors.fname && <p className="text-red-500 text-xs mt-1">{errors.fname}</p>}
                                </div>

                                {/* Last Name */}
                                <div>
                                    <label htmlFor="lname" className="block text-sm font-medium text-gray-700 mb-1">LAST NAME <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        id="lname"
                                        name="lname"
                                        value={form.lname}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] sm:text-sm"
                                    />
                                    {errors.lname && <p className="text-red-500 text-xs mt-1">{errors.lname}</p>}
                                </div>

                                {/* Organization */}
                                <div>
                                    <label htmlFor="org" className="block text-sm font-medium text-gray-700 mb-1">ORG <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        id="org"
                                        name="org"
                                        value={form.org}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] sm:text-sm"
                                    />
                                    {errors.org && <p className="text-red-500 text-xs mt-1">{errors.org}</p>}
                                </div>

                                {/* Active/Inactive Select */}
                                <div>
                                    <label htmlFor="active" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <select
                                        id="active"
                                        name="active"
                                        value={form.active ? "true" : "false"}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] sm:text-sm"
                                    >
                                        <option value="true">Active</option>
                                        <option value="false">Inactive</option>
                                    </select>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Facility Table */}
                    <div className="mb-8">
                        <h2 className="text-lg font-medium text-gray-700 mb-3">FACILITY <span className="text-red-500">*</span></h2>
                        {initialLoading ? (
                            <FacilityTableSkeleton />
                        ) : (
                            <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                {/* Select */}
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                SITE_CODE
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                DOMAIN_CODE
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                FAC_CODE
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {allFacilities.map((facility, index) => (
                                            <tr key={index} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <input
                                                        type="checkbox"
                                                        checked={form.facilities?.some(f =>
                                                            f.sitE_CODE === facility.sitE_CODE &&
                                                            f.domaiN_CODE === facility.domaiN_CODE &&
                                                            f.facT_CODE === facility.facT_CODE
                                                        )}
                                                        onChange={() => handleFacilityToggle(facility)}
                                                        className="h-4 w-4 text-[var(--primary-color)] border-gray-300 rounded focus:ring-[var(--primary-color)]"
                                                    />
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {facility.sitE_CODE}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {facility.domaiN_CODE}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {facility.facT_CODE}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        {errors.facilities && <p className="text-red-500 text-xs mt-1">{errors.facilities}</p>}
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end space-x-4 mt-8 pt-3 border-t border-gray-200">
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
                                disabled={loading || initialLoading}
                            >
                                <motion.span
                                    whileHover={{ x: -5 }}
                                    transition={{ type: "spring", stiffness: 500, damping: 20 }}
                                >
                                    <PlusIcon className="h-5 w-5" />
                                </motion.span>
                                <span>SAVE</span>
                            </motion.button>
                        )}
                    </div>
                </div>
            </main>
        </SkeletonTheme>
    )
}
