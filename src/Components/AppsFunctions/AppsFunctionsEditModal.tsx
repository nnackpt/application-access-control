import { AppsfunctionsApi } from "@/services/AppsfunctionsApi";
import { AppsFunctions } from "@/types/AppsFunctions";
import { Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

function getBangkokISOString() {
  const now = new Date();
  // ลบ offset ปัจจุบัน แล้วบวก 7 ชั่วโมง
  const utc = now.getTime() - (now.getTimezoneOffset() * 60000);
  const bangkok = new Date(utc + (7 * 60 * 60 * 1000));
  return bangkok.toISOString().slice(0, 19);
}

export default function AppsFunctionsEditModal({
    isOpen,
    onClose,
    onSuccess,
    editData
}: {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    editData: AppsFunctions;
}) {
    const [form, setForm] = useState<AppsFunctions>(editData);
    const [error, setErrors] = useState<{ [key: string]: string }>({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (editData) {
            setForm(editData);
            setErrors({});
        }
    }, [editData, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        if (error[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};
        if (!form.name.trim()) newErrors.name = 'Name is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;
        setLoading(true);
        try {
            const submitData = {
                funC_CODE: form.funC_CODE,
                apP_CODE: form.apP_CODE,
                name: form.name,
                desc: form.desc,
                funC_URL: form.funC_URL,
                active: form.active,
                updateD_BY: 'system',
                updateD_DATETIME: getBangkokISOString(),
            };
            await AppsfunctionsApi.updateAppsFunctions(form.funC_CODE, submitData);
            toast.success('Successfully updated!');
            onSuccess();
            onClose();
        } catch (error) {
            toast.error('Update failed!');
            console.error('Error submitting form:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !form) return null;

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-xs flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="sticky top-0 bg-[#005496] text-white p-6 rounded-t-xl flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Edit Apps Function</h2>
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
                                <input
                                    type="text"
                                    value={form.apP_CODE || ''}
                                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
                                    disabled
                                />
                            </div>
                        </div>
                        {/* Function Code (read only) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Function Code</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={form.funC_CODE || ''}
                                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
                                    disabled
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
                                value={form.name || ''}
                                onChange={handleChange}
                                // placeholder="e.g., User Management"
                                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#005496] focus:border-[#005496] ${error.name ? 'border-red-500' : 'border-gray-300'}`}
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
                        {/* Function URL */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Function URL</label>
                            <div className="relative">
                            <input
                                type="text"
                                name="funC_URL"
                                value={form.funC_URL || ''}
                                onChange={handleChange}
                                // placeholder="/api/users"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005496] focus:border-[#005496]"
                                disabled={loading}
                            />
                            {form.funC_URL && (
                                <button
                                    type="button"
                                    onClick={() => setForm(prev => ({ ...prev, funC_URL: '' }))}
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
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005496] focus:border-[#005496]"
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
                                placeholder="e.g., Function description"
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
                        <button type="button" onClick={handleSubmit} className="cursor-pointer px-6 py-3 bg-[#005496] text-white rounded-lg hover:bg-[#004080] transition-colors disabled:bg-gray-400" disabled={loading}>{loading ? 'Saving...' : 'Update'} Function</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
