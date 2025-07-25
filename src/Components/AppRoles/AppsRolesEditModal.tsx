import { AppsRolesApi } from "@/services/AppsRolesApi"
import { AppsRoles } from "@/types/AppsRoles"

import { Trash2, X } from "lucide-react"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"

export default function AppsRolesEditModal({
    isOpen,
    onClose,
    onSuccess,
    editData
}: {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    editData: AppsRoles
}) {
    const [form, setForm] = useState<AppsRoles>(editData)
    const [error, setError] = useState<{ [key: string]: string }>({})
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (editData) {
            setForm(editData)
            setError({})
        }
    }, [editData, isOpen])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target
        const checked = (e.target as HTMLInputElement).checked
        setForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
        if (error[name]) setError(prev => ({ ...prev, [name]: '' }))
    }

    // const validateForm = () => {
    //     const newErrors: { [key: string]: string } = {}
    //     if 
    // }

    const handleSubmit = async () => {
        setLoading(true)
        try {
            const submitData = {
                rolE_CODE: form.rolE_CODE,
                apP_CODE: form.apP_CODE,
                name: form.name,
                desc: form.desc,
                homE_URL: form.homE_URL,
                active: form.active,
                updateD_BY: 'system',
                updateD_DATETIME: new Date().toISOString().slice(0, 19)
            }
            await AppsRolesApi.updateAppsRoles(form.rolE_CODE || '', submitData)
            toast.success('Successfully updated!')
            onSuccess()
            onClose()
        } catch (error) {
            toast.error('Update failed!')
            console.error('Error submitting form:', error)
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen || !form) return null

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-xs flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="sticky top-0 bg-[var(--primary-color)] text-white p-6 rounded-t-xl flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Edit Application Roles</h2>
                    <button onClick={onClose} className="text-white hover:text-blue-200 transition-colors cursor-pointer" disabled={loading}>
                        <X size={24} />
                    </button>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* {App Code (read )} */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">APP Code</label>
                            <div className="relative">
                                <input 
                                    type="text" 
                                    value={form.apP_CODE || ''}
                                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
                                    disabled
                                />
                            </div>
                        </div>
                        {/* Role Code (read only) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Role Code</label>
                            <div className="relative">
                                <input 
                                    type="text"
                                    value={form.rolE_CODE || ''}
                                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
                                    disabled    
                                />
                            </div>
                        </div>
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                            <div className="relative">
                                <input 
                                    type="text"
                                    name="name"
                                    value={form.name || ''}
                                    onChange={handleChange}
                                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] ${error.name ? 'border-red-500' : 'border-gray-300'}`}
                                    disabled={loading}    
                                />
                                {form.name && (
                                    <button
                                        type="button"
                                        onClick={() => setForm(prev => ({ ...prev, name: '' }))}
                                        className="cursor-pointer absolute inset-y-0 right-0 flex items-center pr-3 text-red-400 hover:text-red-600"
                                        disabled={loading}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                    )}
                                </div>
                            {error.name && <p className="text-red-500 text-sm mt-1">{error.name}</p>}
                        </div>
                        {/* Home URL */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Home URL</label>
                            <div className="relative">
                                <input 
                                    type="text" 
                                    name="homE_URL"
                                    value={form.homE_URL || ''}
                                    onChange={handleChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]"
                                    disabled={loading}
                                />
                                {form.homE_URL && (
                                    <button
                                        type="button"
                                        onClick={() => setForm(prev => ({ ...prev, homE_URL: '' }))}
                                        className="cursor-pointer absolute inset-y-0 right-0 flex items-center pr-3 text-red-400 hover:text-red-600"
                                        disabled={loading}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        </div>
                        {/* Active Status */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                            <select 
                                name="active"
                                value={form.active ? 'true' : 'false'}
                                onChange={e => setForm(prev => ({ ...prev, active: e.target.value === 'true' }))}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]"
                                disabled={loading}
                            >
                                <option value="true">ACTIVE</option>
                                <option value="false">INACTIVE</option>
                            </select>
                        </div>
                        {/* Description */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                            <div className="relative">
                                <textarea 
                                    name="desc"
                                    value={form.desc || ''}
                                    onChange={handleChange}
                                    placeholder="e.g., Role description"
                                    rows={3}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] resize-none"
                                    disabled={loading}    
                                />
                                {form.desc && (
                                    <button
                                        type="button"
                                        onClick={() => setForm(prev => ({ ...prev, desc: '' }))}
                                        className="cursor-pointer absolute inset-y-0 right-0 flex items-center pr-3 text-red-400 hover:text-red-600"
                                        disabled={loading}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end space-x-4 mt-8 pt-6 border-t">
                        <button type="button" onClick={onClose} className="cursor-pointer px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors" disabled={loading}>Cancel</button>
                        <button type="button" onClick={handleSubmit} className="cursor-pointer px-6 py-3 bg-[var(--primary-color)] text-white rounded-lg hover:bg-[var(--primary-color-dark)] transition-colors disabled:bg-gray-400" disabled={loading}>{loading ? 'Saving...' : 'Update'} Function</button>
                    </div>
                </div>
            </div>
        </div>
    )
}