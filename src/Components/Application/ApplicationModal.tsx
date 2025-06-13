import React, { useEffect, useState } from "react"
import { X } from "lucide-react"
import { Application } from "@/types/Application"
import { applicationApi } from "@/services/applicationApi"

const initForm: Application = {
  appCode: '',
  name: '',
  title: '',
  desc: '',
  baseUrl: '',
  loginUrl: '',
  active: true,
  createdBy: '',
  createdDatetime: '',
  updatedBy: ''
}

interface ApplicationModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  editData?: Application | null
}

export default function ApplicationModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  editData = null 
}: ApplicationModalProps) {
  const [form, setForm] = useState<Application>(initForm)
  const [errors, setErrors] = useState<{[key: string]: string}>({})
  const [loading, setLoading] = useState(false)
  const [appCodeInput, setAppCodeInput] = useState('') // สำหรับเก็บตัวเลขที่ user ป้อน

  useEffect(() => {
    if (editData) {
      setForm(editData)
      // ถ้าเป็น edit mode ให้แยกเอาตัวเลขจาก APP_ATH_ prefix
      if (editData.appCode && editData.appCode.startsWith('APP_ATH_')) {
        setAppCodeInput(editData.appCode.replace('APP_ATH_', ''))
      } else {
        setAppCodeInput(editData.appCode || '')
      }
    } else {
      setForm(initForm)
      setAppCodeInput('')
    }
    setErrors({})
  }, [editData, isOpen])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    
    setForm(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleAppCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // อนุญาตเฉพาะตัวเลขเท่านั้น
    const numericValue = value.replace(/[^0-9]/g, '')
    setAppCodeInput(numericValue)
    
    // อัพเดท form.appCode ให้มี APP_ATH_ prefix
    const formattedAppCode = numericValue ? `APP_ATH_${numericValue}` : ''
    setForm(prev => ({ 
      ...prev, 
      appCode: formattedAppCode
    }))
    
    // Clear error when user starts typing
    if (errors.appCode) {
      setErrors(prev => ({ ...prev, appCode: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {}
    
    if (!appCodeInput.trim()) {
      newErrors.appCode = 'APP Code is required'
    } else if (!/^[0-9]+$/.test(appCodeInput.trim())) {
      newErrors.appCode = 'APP Code must contain only numbers'
    }
    
    if (!form.name.trim()) newErrors.name = 'Name is required'
    if (!form.title.trim()) newErrors.title = 'Title is required'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setLoading(true)
    try {
      const submitData = {
        ...form,
        appCode: `APP_ATH_${appCodeInput}`, // ให้แน่ใจว่ามี prefix
        createdBy: form.createdBy || 'system',
        createdDatetime: form.createdDatetime || new Date().toISOString(),
        updatedBy: 'system',
        updatedDatetime: new Date().toISOString()
      }

      if (editData) {
        await applicationApi.updateApplication(editData.appCode, submitData)
      } else {
        await applicationApi.createApplication(submitData)
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-[#005496] text-white p-6 rounded-t-xl flex justify-between items-center">
          <h2 className="text-xl font-semibold">
            {editData ? 'Edit Application' : 'Create New Application'}
          </h2>
          <button 
            onClick={onClose}
            className="text-white hover:text-blue-200 transition-colors"
            disabled={loading}
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* APP Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                APP Code <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none bg-gray-100 rounded-l-lg border border-r-0 border-gray-300">
                  <span className="text-gray-500 font-medium">APP_ATH_</span>
                </div>
                <input
                  type="text"
                  value={appCodeInput}
                  onChange={handleAppCodeChange}
                  placeholder="01"
                  className={`w-full pl-24 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-[#005496] focus:border-[#005496] ${
                    errors.appCode ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={!!editData || loading}
                />
              </div>
              {errors.appCode && <p className="text-red-500 text-sm mt-1">{errors.appCode}</p>}
              <p className="text-xs text-gray-500 mt-1">Enter numbers only (e.g., 01, 123)</p>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g., TEST"
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#005496] focus:border-[#005496] ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={loading}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g., TEST API"
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#005496] focus:border-[#005496] ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={loading}
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
            </div>

            {/* Base URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Base URL
              </label>
              <input
                type="url"
                name="baseUrl"
                value={form.baseUrl || ''}
                onChange={handleChange}
                placeholder="https://example.com"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005496] focus:border-[#005496]"
                disabled={loading}
              />
            </div>

            {/* Login URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Login URL
              </label>
              <input
                type="url"
                name="loginUrl"
                value={form.loginUrl || ''}
                onChange={handleChange}
                placeholder="https://example.com/login"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005496] focus:border-[#005496]"
                disabled={loading}
              />
            </div>

            {/* Created By */}
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

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="desc"
                value={form.desc || ''}
                onChange={handleChange}
                placeholder="e.g., Application description"
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005496] focus:border-[#005496]"
                disabled={loading}
              />
            </div>

            {/* Active Status */}
            <div className="md:col-span-2">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  name="active"
                  checked={form.active}
                  onChange={handleChange}
                  className="w-5 h-5 text-[#005496] border-gray-300 rounded focus:ring-2 focus:ring-[#005496]"
                  disabled={loading}
                />
                <span className="text-sm font-medium text-gray-700">Active</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-8 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-6 py-3 bg-[#005496] text-white rounded-lg hover:bg-[#004080] transition-colors disabled:bg-gray-400"
              disabled={loading}
            >
              {loading ? 'Saving...' : (editData ? 'Update' : 'Create')} Application
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}