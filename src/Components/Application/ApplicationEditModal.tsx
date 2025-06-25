import React, { useEffect, useState } from "react"
import { Trash2, X } from "lucide-react"
import { Application } from "@/types/Application"
import { applicationApi } from "@/services/applicationApi"
import toast from "react-hot-toast"

function getBangkokISOString() {
  const now = new Date()
  const bangkok = new Date(now.getTime() + (7 * 60 * 60 * 1000))
  return bangkok.toISOString().slice(0, 19)
}

const initForm: Application = {
  // APP_Code: '',
  apP_CODE: '',
  name: '',
  title: '',
  desc: '',
  basE_URL: '',
  logiN_URL: '',
  active: true,
  createD_BY: '',
  createD_DATETIME: '',
  updateD_BY: ''
}

export default function ApplicationEditModal({ isOpen, onClose, onSuccess, editData }: {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  editData: Application
}) {
  const [form, setForm] = useState<Application>(editData || initForm)
  const [errors, setErrors] = useState<{[key: string]: string}>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
  if (editData) {
    setForm({
      ...editData,
    basE_URL: editData.basE_URL || '',
    logiN_URL: editData.logiN_URL || '',
    })
    setErrors({})
  }
}, [editData, isOpen])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {}
    if (!form.name.trim()) newErrors.name = 'Name is required'
    if (!form.title.trim()) newErrors.title = 'Title is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return
    setLoading(true)
    try {
      const appCodeValue =
        // editData.APP_Code || 
        editData.apP_CODE || 
        // editData.APP_CODE ||
        // editData.AppCode ||
        // editData.app_code ||
        ''

      const submitData = {
        apP_CODE: appCodeValue, // For Frontend
        // appCode: appCodeValue, // For Frontend
        // APP_Code: appCodeValue, // For Backend
        name: form.name,
        title: form.title,
        desc: form.desc,
        basE_URL: form.basE_URL || '',
        logiN_URL: form.logiN_URL  || '',
        active: form.active,
        createD_BY: editData.createD_BY || 'system',
        createD_DATETIME: editData.createD_DATETIME || '',
        updateD_BY: form.updateD_BY || 'system',
        updateD_DATETIME: getBangkokISOString(),
      }
      console.log("submitData", submitData)
      await applicationApi.updateApplication(appCodeValue, submitData)
      toast.success('Successfully Updated!')
      onSuccess()
      onClose()
    } catch (error) {
      toast.error("Update failed!")
      console.error('Error submitting form:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen || !form) return null

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-xs flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-[#005496] text-white p-6 rounded-t-xl flex justify-between items-center">
          <h2 className="text-xl font-semibold">Edit Application</h2>
          <button onClick={onClose} className="text-white hover:text-blue-200 transition-colors cursor-pointer" disabled={loading}>
            <X size={24} />
          </button>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* APP Code (read only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">APP Code</label>
              <div className="relative">
                {/* <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none bg-gray-100 rounded-l-lg border border-r-0 border-gray-300">
                  <span className="text-gray-500 font-medium">APP_ATH_</span>
                </div> */}
                <input
                  type="text"
                  value={
                    // editData.appCode ||
                    // editData.APP_CODE ||
                    editData.apP_CODE ||
                    // editData.AppCode ||
                    // editData.app_code ||
                    ''}
                  readOnly
                  disabled
                  className="w-full pl-3 pr-3 py-3 border rounded-lg bg-gray-100 text-gray-500"
                />
              </div>
            </div>
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name <span className="text-red-500">*</span></label>
              <div className="relative">
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                // placeholder="e.g., TEST"
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#005496] focus:border-[#005496] ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
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
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title <span className="text-red-500">*</span></label>
              <div className="relative">
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                // placeholder="e.g., TEST API"
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#005496] focus:border-[#005496] ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
                disabled={loading}
              />
              {form.title && (
                  <button
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, title: '' }))}
                    className="cursor-pointer absolute inset-y-0 right-0 flex items-center pr-3 text-red-400 hover:text-red-600"
                    disabled={loading}
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
            </div>
            {/* Base URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Base URL</label>
              <div className="relative">
              <input
                type="url"
                name="basE_URL"
                value={form.basE_URL || ''}
                onChange={handleChange}
                // placeholder="https://example.com"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005496] focus:border-[#005496]"
                disabled={loading}
              />
              {form.basE_URL && (
                  <button
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, basE_URL: '' }))}
                    className="cursor-pointer absolute inset-y-0 right-0 flex items-center pr-3 text-red-400 hover:text-red-600"
                    disabled={loading}
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
            {/* Login URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Login URL</label>
              <div className="relative">
              <input
                type="url"
                name="logiN_URL"
                value={form.logiN_URL || ''}
                onChange={handleChange}
                // placeholder="https://example.com/login"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005496] focus:border-[#005496]"
                disabled={loading}
              />
              {form.logiN_URL && (
                  <button
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, logiN_URL: '' }))}
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
                value={form.active ? "true" : "false"}
                onChange={e => setForm(prev => ({ ...prev, active: e.target.value === "true" }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005496] focus:border-[#005496]"
                disabled={loading}  
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
            {/* Created By (read only) */}
            {/* {form.createD_BY && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Created By</label>
                <input
                  type="text"
                  name="createD_BY"
                  value={form.createD_BY}
                  readOnly
                  disabled
                  className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
                />
              </div>
            )} */}
            {/* Created Datetime (read only) */}
            {/* {form.createD_DATETIME && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Created Datetime</label>
                <input
                  type="text"
                  name="createdDatetime"
                  value={form.createD_DATETIME}
                  readOnly
                  disabled
                  className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
                />
              </div>
            )} */}
            {/* Updated By (read only) */}
            {/* {form.updateD_BY && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Updated By</label>
                <input
                  type="text"
                  name="updateD_BY"
                  value={form.updateD_BY}
                  readOnly
                  disabled
                  className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
                />
              </div>
            )} */}
            {/* Updated Datetime (read only) */}
            {/* {form.updateD_DATETIME && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Updated Datetime</label>
                <input
                  type="text"
                  name="updateD_DATETIME"
                  value={form.updateD_DATETIME}
                  readOnly
                  disabled
                  className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
                />
              </div>
            )} */}
            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <div className="relative">
              <textarea
                name="desc"
                value={form.desc || ''}
                onChange={handleChange}
                // placeholder="e.g., Application description"
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005496] focus:border-[#005496] resize-none"
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
            <button type="button" onClick={handleSubmit} className="cursor-pointer px-6 py-3 bg-[#005496] text-white rounded-lg hover:bg-[#004080] transition-colors disabled:bg-gray-400" disabled={loading}>{loading ? 'Saving...' : 'Update'} Application</button>
          </div>
        </div>
      </div>
    </div>
  )
}
