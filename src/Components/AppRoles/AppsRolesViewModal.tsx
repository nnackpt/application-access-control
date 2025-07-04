import { AppsRoles } from "@/types/AppsRoles"
import formatDateTime from "@/Utils/formatDateTime"
import getValue from "@/Utils/getValue"
import { X } from "lucide-react"

interface ViewModalProps {
    isOpen: boolean
    onClose: () => void
    data: AppsRoles | null   
}

export default function ViewModal({
    isOpen,
    onClose,
    data
}: ViewModalProps) {
    if (!isOpen || !data) return null

    const appCode = getValue(data, ['apP_CODE'])
    const roleCode = getValue(data, ['rolE_CODE'])
    const name = getValue(data, ['name'])
    const desc = getValue(data, ['desc'])
    const active = getValue(data, ['active'])
    const homeUrl = getValue(data, ['homE_URL'])
    const createdBy = getValue(data, ['createD_BY'])
    const createdDatetime = getValue(data, ['createD_DATETIME'])
    const updatedBy = getValue(data, ['updateD_BY'])
    const updatedDatetime = getValue(data, ['updateD_DATETIME'])

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-[#005496] text-white p-6 rounded-t-xl flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Applications Roles Details</h2>
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
                            <label className="block text-sm font-medium text-gray-600 mb-1">ROLE Code</label>
                            <p className="text-lg font-semibold text-[#005496]">{roleCode || '-'}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">APP Code</label>
                            <p className="text-lg font-semibold text-[#005496]">{appCode || '-'}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Name</label>
                            <p className="text-lg text-gray-900">{name || '-'}</p>
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
                            <label className="block text-sm font-medium text-gray-600 mb-1">Home URL</label>
                            {homeUrl && typeof homeUrl === 'string' && (homeUrl.startsWith('http://') || homeUrl.startsWith('https://')) ? (
                                <a href={homeUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">{homeUrl}</a>
                            ) : (
                                <p className="text-gray-900 break-all">{homeUrl || '-'}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Created By</label>
                            <p className="text-gray-900">{createdBy || '-'}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Created Date</label>
                            <p className="text-gray-900">{formatDateTime(createdDatetime) || '-'}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Updated By</label>
                            <p className="text-gray-900">{updatedBy || '-'}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Updated Date</label>
                            <p className="text-gray-900">{formatDateTime(updatedDatetime) || '-'}</p>
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