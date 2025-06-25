import { applicationApi } from "@/services/applicationApi";
import { AppsfunctionsApi } from "@/services/AppsfunctionsApi";
import { Application } from "@/types/Application";
import { AppsFunctions } from "@/types/AppsFunctions";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const initForm: AppsFunctions = {
    funC_CODE: '',
    apP_CODE: '',
    name: '',
    desc: '',
    funC_URL: '',
    active: true,
    createdBy: '',
    createdDatetime: '',
    updatedBy: ''
};

function getBangkokISOString() {
  const now = new Date()
  const bangkok = new Date(now.getTime() + (7 * 60 * 60 * 1000))
  return bangkok.toISOString().slice(0, 19)
}

export default function AppsFunctionsCreateModal({
    isOpen,
    onClose,
    onSuccess
}: {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [form, setForm] = useState<AppsFunctions>(initForm);
    const [error, setErrors] = useState<{ [key: string]: string }>({});
    const [loading, setLoading] = useState(false);
    const [applications, setApplications] = useState<Application[]>([]);
    const [loadingApps, setLoadingApps] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const fetchApplications = async () => {
                setLoadingApps(true);
                try {
                    const response = await applicationApi.getApplications();
                    setApplications(response);
                } catch (error) {
                    console.error('Error fetching applications:', error);
                } finally {
                    setLoadingApps(false);
                }
            };
            fetchApplications();
        }
    }, [isOpen]);

    useEffect(() => {
        setForm(initForm);
        setErrors({});
    }, [isOpen]);

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
        if (!form.apP_CODE.trim()) newErrors.appCode = 'APP Code is required';
        if (!form.funC_CODE.trim()) newErrors.funcCode = 'Function Code is required';
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
                funcUrl: form.funC_URL,
                active: form.active,
                createD_BY: form.createdBy || 'system',
                createD_DATETIME: getBangkokISOString(),
                updateD_BY: ''
            };
            await AppsfunctionsApi.createAppsFunctions(submitData);
            toast.success('Successfully created!');
            onSuccess();
            onClose();
        } catch (error) {
            toast.error('Create failed!');
            console.error('Error submitting form:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-xs flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="sticky top-0 bg-[#005496] text-white p-6 rounded-t-xl flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Create New Apps Function</h2>
                    <button onClick={onClose} className="text-white hover:text-blue-200 transition-colors cursor-pointer" disabled={loading}>
                        <X size={24} />
                    </button>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* App Code */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">APP Code <span className="text-red-500">*</span></label>
                            <select
                                name="apP_CODE"
                                value={form.apP_CODE || ''}
                                onChange={handleChange}
                                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#005496] focus:border-[#005496] ${error.apP_CODE ? 'border-red-500' : 'border-gray-300'}`}
                                disabled={loading || loadingApps}
                            >
                                <option value="">Select APP Code</option>
                                {applications.map((app, index) => (
                                    <option key={`${app.apP_CODE || app.title}-${index}`} value={app.apP_CODE}>
                                        {app.title}
                                    </option>
                                ))}
                            </select>
                            {error.apP_CODE && <p className="text-red-500 text-sm mt-1">{error.apP_CODE}</p>}
                            {loadingApps && <p className="text-gray-500 text-sm mt-1">Loading applications...</p>}
                        </div>
                        {/* Function Code */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Function Code <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="funC_CODE"
                                value={form.funC_CODE || ''}
                                onChange={handleChange}
                                // placeholder="e.g., FUNC001"
                                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#005496] focus:border-[#005496] ${error.funcCode ? 'border-red-500' : 'border-gray-300'}`}
                                disabled={loading}
                            />
                            {error.funC_CODE && <p className="text-red-500 text-sm mt-1">{error.funC_CODE}</p>}
                        </div>
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Name <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="name"
                                value={form.name || ''}
                                onChange={handleChange}
                                // placeholder="e.g., User Management"
                                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#005496] focus:border-[#005496] ${error.name ? 'border-red-500' : 'border-gray-300'}`}
                                disabled={loading}
                            />
                            {error.name && <p className="text-red-500 text-sm mt-1">{error.name}</p>}
                        </div>
                        {/* Function URL */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Function URL</label>
                            <input
                                type="text"
                                name="funcUrl"
                                value={form.funC_URL || ''}
                                onChange={handleChange}
                                // placeholder="/api/users"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005496] focus:border-[#005496]"
                                disabled={loading}
                            />
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
                        {/* Created By */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Created By</label>
                            <input
                                type="text"
                                name="createdBy"
                                value={form.createdBy || ''}
                                onChange={handleChange}
                                // placeholder="system"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005496] focus:border-[#005496]"
                                disabled={loading}
                            />
                        </div>
                        {/* Description */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                            <textarea
                                name="desc"
                                value={form.desc || ''}
                                onChange={handleChange}
                                // placeholder="e.g., Function description"
                                rows={3}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005496] focus:border-[#005496] resize-none"
                                disabled={loading}
                            />
                        </div>
                    </div>
                    <div className="flex justify-end space-x-4 mt-8 pt-6 border-t">
                        <button type="button" onClick={onClose} className="cursor-pointer px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors" disabled={loading}>Cancel</button>
                        <button type="button" onClick={handleSubmit} className="cursor-pointer px-6 py-3 bg-[#005496] text-white rounded-lg hover:bg-[#004080] transition-colors disabled:bg-gray-400" disabled={loading}>{loading ? 'Saving...' : 'Create'} Function</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
