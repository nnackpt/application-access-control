import React from "react"
import { X } from "lucide-react"
import { Application } from "@/types/Application"

interface ViewModalProps {
  isOpen: boolean
  onClose: () => void
  data: Application | null
}

export default function ViewModal({ 
  isOpen, 
  onClose, 
  data 
}: ViewModalProps) {
  if (!isOpen || !data) return null

  // ฟังก์ชันสำหรับดึงค่าจาก object ที่อาจมีชื่อ property ต่างกัน
  const getValue = (obj: any, possibleKeys: string[]) => {
    for (const key of possibleKeys) {
      if (obj[key] !== undefined && obj[key] !== null) {
        return obj[key]
      }
    }
    return null
  }

  // ดึงข้อมูลจาก data object โดยรองรับ property names ที่แตกต่างกัน
  const appCode = getValue(data, ['apP_CODE', 'appCode', 'app_code', 'AppCode', 'APP_CODE', 'code', 'id'])
  const name = getValue(data, ['name', 'Name', 'app_name', 'appName'])
  const title = getValue(data, ['title', 'Title', 'app_title', 'appTitle'])
  const desc = getValue(data, ['desc', 'description', 'Description', 'app_desc', 'appDesc'])
  const active = getValue(data, ['active', 'Active', 'is_active', 'isActive', 'status'])
  const baseUrl = getValue(data, ['basE_URL', 'baseUrl', 'base_url', 'BaseUrl', 'BASE_URL', 'url'])
  const loginUrl = getValue(data, ['logiN_URL', 'loginUrl', 'login_url', 'LoginUrl', 'LOGIN_URL'])
  const createdBy = getValue(data, ['createD_BY', 'createdBy', 'created_by', 'CreatedBy', 'CREATED_BY', 'creator'])
  const createdDate = getValue(data, ['createD_DATETIME', 'createdDatetime', 'created_datetime', 'createdDate', 'created_date', 'CreatedDate', 'CREATED_DATE', 'createDate'])
  const updatedBy = getValue(data, ['updateD_BY', 'updatedBy', 'updated_by', 'UpdatedBy', 'UPDATED_BY', 'modifier'])
  const updatedDate = getValue(data, ['updateD_DATETIME', 'updatedDatetime', 'updated_datetime', 'updatedDate', 'updated_date', 'UpdatedDate', 'UPDATED_DATE', 'updateDate'])

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    try {
      return new Date(dateString).toLocaleString('th-TH', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    } catch {
      return '-'
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-[#005496] text-white p-6 rounded-t-xl flex justify-between items-center">
          <h2 className="text-xl font-semibold">Application Details</h2>
          <button 
            onClick={onClose}
            className="text-white hover:text-blue-200 transition-colors cursor-pointer"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">APP Code</label>
              <p className="text-lg font-semibold text-[#005496]">{appCode || '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Name</label>
              <p className="text-lg text-gray-900">{name || '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Title</label>
              <p className="text-lg text-gray-900">{title || '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Status</label>
              <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                active 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Base URL</label>
              <p className="text-gray-900 break-all">{baseUrl || '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Login URL</label>
              <p className="text-gray-900 break-all">{loginUrl || '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Created By</label>
              <p className="text-gray-900">{createdBy || '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Created Date</label>
              <p className="text-gray-900">{formatDate(createdDate)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Updated By</label>
              <p className="text-gray-900">{updatedBy || '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Updated Date</label>
              <p className="text-gray-900">{formatDate(updatedDate)}</p>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-600 mb-1">Description</label>
              <p className="text-gray-900 whitespace-pre-wrap">{desc || '-'}</p>
            </div>
          </div>
          
          <div className="flex justify-end mt-8 pt-6 border-t border-t-[#005496]">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-[#005496] text-white rounded-lg hover:bg-[#004080] transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}