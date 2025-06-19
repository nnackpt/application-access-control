import { applicationApi } from "@/services/applicationApi";
import { AppsfunctionsApi } from "@/services/AppsfunctionsApi";
import { Application } from "@/types/Application";
import { AppsFunctions } from "@/types/AppsFunctions";
import { X } from "lucide-react";
import { useEffect, useState } from "react";

const initForm: AppsFunctions = {
    funcCode: '',
    appCode: '',
    name: '',
    desc: '',
    funcUrl: '',
    active: true,
    createdBy: '',
    createdDatetime: '',
    updatedBy: ''
}

interface AppsFunctionsModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    editData?: AppsFunctions | null
}

export default function AppsFunctionsModal({
    isOpen,
    onClose,
    onSuccess,
    editData = null
}: AppsFunctionsModalProps) {
    const [form, setForm] = useState<AppsFunctions>(initForm)
    const [error, setErrors] = useState<{[key: string]: string}>({})
    const [loading, setLoading] = useState(false)
    const [applications, setApplications] = useState<Application[]>([])
    const [loadingApps, setLoadingApps] = useState(false)

    // fetch applications for drop down
    useEffect(() => {
        if (isOpen && !editData) {
            const fetchApplications = async () => {
                setLoadingApps(true)
                try {
                    const response = await applicationApi.getApplications()
                    setApplications(response)
                } catch (error) {
                    console.error('Error fetching applications:', error)
                } finally {
                    setLoadingApps(false)
                }
            }

            fetchApplications()
        }
    }, [isOpen, editData])

    useEffect(() => {
        if (editData) {
            setForm(editData)
        } else {
            setForm(initForm)
        }
        setErrors({})
    }, [editData, isOpen])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target
        const checked = (e.target as HTMLInputElement).checked

        setForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))

        // Clear error when user starts typing
        if (error[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }))
        }
    }

    const validateForm = () => {
        const newErrors: {[key: string]: string} = {}

        if (!editData && !form.appCode.trim()) {
            newErrors.appCode = 'APP Code is required'
        }

        if (!editData && !form.funcCode.trim()) {
            newErrors.funcCode = 'Function Code is required'
        }

        if (!form.name.trim()) {
            newErrors.name = 'Name is required'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async () => {
        if (!validateForm()) return

        setLoading(true)
        try {
            const submitData = {
                ...form,
                createdBy: form.createdBy || 'system',
                createdDatetime: form.createdDatetime || new Date().toISOString(),
                updatedBy: 'system',
                updatedDatetime: new Date().toISOString()
            }

            if (editData) {
                await AppsfunctionsApi.updateAppsFunctions(editData.funcCode, submitData)
            } else {
                await AppsfunctionsApi.createAppsFunctions(submitData)
            }

            onSuccess()
            onClose()
        } catch (error) {
            console.error('Error submitting form:', error)
            // You can add error handling here (e.g., show toast notification)
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-xs flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation}>
                <div className="sticky top-0 bg-[#005496] text-white p-6 rounded-t-xl flex justify-between items-center">
                    <h2 className="text-xl font-semibold">
                        {editData ? 'Edit Apps Function' : 'Create New Apps Function'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-white hover:text-blue-200 transition-colors cursor-pointer"
                        disabled={loading}
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* App Code - Only for create mode */}
                        {!editData && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    APP Code <span className="text-red-500">*</span>
                                </label>
                                <select 
                                    name="appCode"
                                    value={form.appCode}
                                    onChange={handleChange}
                                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#005496] focus:border-[#005496] ${
                                        error.appCode ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    disabled={loading || loadingApps}
                                >
                                    <option value="">Select APP Code</option>
                                    {applications.map((app) => (
                                        <option key={app.appCode} value={app.appCode}>
                                            {app.appCode} - {app.name}
                                        </option>
                                    ))}
                                </select>
                                {error.appCode && <p className="text-red-500 text-sm mt-1">{error.appCode}</p>}
                                {loadingApps && <p className="text-gray-500 text-sm mt-1">Loading applications...</p>}
                            </div>
                        )}

                        {/* Function Code - Only for create mode */}
                        {editData && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Function Code <span className="text-red-500">*</span>
                                </label>
                                <input 
                                    type="text" 
                                    name="funcCode" 
                                    value={form.funcCode}
                                    onChange={handleChange}
                                    placeholder="e.g., FUNC001"
                                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#005496] focus:border-[#005496] ${
                                        error.funcCode ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    disabled={loading} 
                                />
                                {error.funcCode && <p className="text-red-500 text-sm mt-1">{error.funcCode}</p>}
                            </div>
                        )}

                        {/* Show read-only fields in edit mode */}
                        {editData && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        APP Code
                                    </label>
                                    <input 
                                        type="text" 
                                        value={form.appCode}
                                        className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100"
                                        disabled    
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Function Code
                                    </label>
                                    <input 
                                        type="text" 
                                        value={form.funcCode}
                                        className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100"
                                        disabled    
                                    />
                                </div>
                            </>
                        )}

                        {/* Name - Editable */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Name <span className="text-red-500">*</span>
                            </label>
                            <input 
                                type="text"     
                                name="name" 
                                value={form.name}
                                onChange={handleChange}
                                placeholder="e.g., User Management"
                                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#005496] focus:border-[#005496] ${
                                    error.name ? 'border-red-500' : 'border-gray-300'
                                }`}
                                disabled={loading}
                            />
                            {error.name && <p className="text-red-500 text-sm mt-1">{error.name}</p>}
                        </div>

                        {/* Function URL - Editable */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Function URL
                            </label>
                            <input 
                                type="text" 
                                name="funcUrl"
                                value={form.funcUrl || ''}
                                onChange={handleChange}
                                placeholder="/api/users" 
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005496] focus:border-[#005496]"
                                disabled={loading}
                            />
                        </div>

                        {/* Active Status - Editable */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Status
                            </label>
                            <select 
                                name="active"
                                value={form.active ? 'true' : 'false'}
                                onChange={(e) => setForm(prev => ({ ...prev, active: e.target.value === 'true' }))}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005496] focus:border-[#005496]"
                                disabled={loading} 
                            >
                                <option value="true">ACTIVE</option>
                                <option value="false">INACTIVE</option>
                            </select>
                        </div>

                        {/* Created By - Only for create mode */}
                        {!editData && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Created By
                                </label>
                                <input 
                                    type="text" 
                                    name="createdBy"
                                    value={form.createdBy || ''}
                                    onChange={handleChange}
                                    placeholder="system"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005496] focus:border-[#005496]"
                                    disabled={loading}
                                />
                            </div>
                        )}

                        {/* Description - Editable */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Description
                            </label>
                            <textarea 
                                name="desc"
                                value={form.desc || ''}
                                onChange={handleChange}
                                placeholder="e.g., Function description"
                                rows={3}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005496] focus:border-[#005496] resize-none"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end space-x-4 mt-8 pt-6 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="cursor-pointer px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onCanPlay={handleSubmit}
                            className="cursor-pointer px-6 py-3 bg-[#005496] text-white rounded-lg hover:bg-[#004080] transition-colors disabled:bg-gray-400"
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : (editData ? 'Update' : 'Create')} Function
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}