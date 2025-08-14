// import useCurrentUser from "@/hooks/useCurrentUser";
// import getBangkokISOString from "@/Utils/getBangkokISOString";

import { applicationApi } from "@/services/ApplicationApi";
import { AppsFunctionsApi } from "@/services/AppsFunctionsApi";
import { Application } from "@/types/Application";
import { AppsFunctions } from "@/types/AppsFunctions";


import { 
    CheckCircle, 
    Code, 
    FileText, 
    Link, 
    SquareFunction, 
    Trash2, 
    User, 
    X 
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import StatusToggleButton from "../UI/Button/StatusToggleButton";
import CreateAppCodeSelect from "../UI/Select/CreateAppCodeSelect";

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
    // const { userName } = useCurrentUser();

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

    type CustomChangeEvent = {
        target: {
            name: string;
            value: string;
            type?: string;
            checked?: boolean;
        };
    };

    type FormInputEvent =
        | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
        | CustomChangeEvent

    const handleChange = (e: FormInputEvent) => {
        const { name, value } = e.target
        const isCheckbox =
            "type" in e.target && e.target.type === "checkbox" && "checked" in e.target

        setForm(prev => ({
            ...prev,
            [name]: isCheckbox ? (e.target as HTMLInputElement).checked : value
        }))

        if (error[name]) {
            setErrors(prev => ({ ...prev, [name]: "" }))
        }
    }

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
                funC_URL: form.funC_URL,
                active: form.active,
                createD_BY: form.createdBy || 'system',
                createD_DATETIME: new Date().toISOString().slice(0, 19),
                updateD_BY: ''
            };
            await AppsFunctionsApi.createAppsFunctions(submitData);
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

    const handleStatusToggle = () => {
        // setLoading(true)
        setForm(prev => ({ ...prev, active: !prev.active }))
        // setTimeout(() => setLoading(false), 500)
    }

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-xs flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="sticky top-0 p-6 rounded-t-xl flex justify-between items-center bg-gradient-to-r from-[var(--primary-color-dark)] to-[var(--primary-color)] animate-gradient-xy text-white">
                    <h2 className="text-xl font-semibold">CREATE NEW APPLICATION FUNCTION</h2>
                    <button onClick={onClose} className="text-white hover:text-blue-200 transition-colors cursor-pointer" disabled={loading}>
                        <X size={24} />
                    </button>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* LEFT Column */}
                        <div className="flex flex-col gap-6">
                            {/* App Code */}
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                    <Code size={16} />
                                    APP Code <span className="text-red-500">*</span>
                                </label>
                                {/* <select
                                    name="apP_CODE"
                                    value={form.apP_CODE || ''}
                                    onChange={handleChange}
                                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] ${error.apP_CODE ? 'border-red-500' : 'border-gray-300'}`}
                                    disabled={loading || loadingApps}
                                >
                                    <option value="">Select APP Code</option>
                                    {applications.map((app, index) => (
                                        <option key={`${app.apP_CODE || app.title}-${index}`} value={app.apP_CODE}>
                                            {app.title}
                                        </option>
                                    ))}
                                </select> */}
                                <CreateAppCodeSelect 
                                    value={form.apP_CODE || ''}
                                    onChange={(val) => 
                                        handleChange({ target: { name: "apP_CODE", value: val } })
                                    }
                                    applications={applications}
                                    error={error.apP_CODE}
                                    loading={loading}
                                    loadingApps={loadingApps}
                                />
                                {error.apP_CODE && <p className="text-red-500 text-sm mt-1">{error.apP_CODE}</p>}
                                {loadingApps && <p className="text-gray-500 text-sm mt-1">Loading Applications...</p>}
                            </div>

                            {/* Name */}
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                    <User size={16} />
                                    Name <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="name"
                                        value={form.name || ''}
                                        onChange={handleChange}
                                        // placeholder="e.g., User Management"
                                        className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] ${error.name ? 'border-red-500' : 'border-gray-300'}`}
                                        disabled={loading}
                                    />
                                    {!!form.name?.length && (
                                        <button
                                            type="button"
                                            onClick={() => handleChange({ target: { name: "name", value: "" } })}
                                            className="cursor-pointer absolute right-2 top-1/2 -translate-y-1/2 z-10 text-red-400 hover:text-red-600"
                                            disabled={loading}
                                            aria-label="Clear Name"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                    {error.name && <p className="text-red-500 text-sm mt-1">{error.name}</p>}
                                </div>
                            </div>

                            {/* Function Code */}
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                    <SquareFunction size={16} />
                                    Function Code <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="funC_CODE"
                                        value={form.funC_CODE || ''}
                                        onChange={handleChange}
                                        // placeholder="e.g., FUNC001"
                                        className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] ${error.appCode ? 'border-red-500' : 'border-gray-300'}`}
                                        disabled={loading}
                                    />
                                    {!!form.funC_CODE?.length && (
                                        <button
                                            type="button"
                                            onClick={() => handleChange({ target: { name: "funC_CODE", value: "" } })}
                                            className="cursor-pointer absolute right-2 top-1/2 -translate-y-1/2 z-10 text-red-400 hover:text-red-600"
                                            disabled={loading}
                                            aria-label="Clear Function Code"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                    {error.funC_CODE && <p className="text-red-500 text-sm mt-1">{error.funC_CODE}</p>}
                                </div>
                            </div>

                            {/* Active Status */}
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                    <CheckCircle size={16} />
                                    Status
                                </label>
                                <StatusToggleButton
                                    active={form.active ?? true}
                                    onClick={handleStatusToggle}
                                    disabled={loading}
                                />
                            </div>

                        </div>

                        {/* RIGHT Column */}
                        <div className="flex flex-col gap-6">
                            {/* Function URL */}
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                    <Link size={16} />
                                    Function URL
                                </label>
                                <div className="relative">
                                <input
                                    type="text"
                                    name="funC_URL"
                                    value={form.funC_URL || ''}
                                    onChange={handleChange}
                                    // placeholder="/api/users"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]"
                                    disabled={loading}
                                />
                                {!!form.funC_URL?.length && (
                                    <button
                                        type="button"
                                        onClick={() => handleChange({ target: { name: "funC_URL", value: "" } })}
                                        className="cursor-pointer absolute right-2 top-1/2 -translate-y-1/2 z-10 text-red-400 hover:text-red-600"
                                        disabled={loading}
                                        aria-label="Clear Function URL"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                                </div>
                            </div>

                            {/* Description */}
                            <div className="md:col-span-2">
                                <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                    <FileText size={16} />
                                    Description
                                </label>
                                <div className="relative">
                                    <textarea
                                        name="desc"
                                        value={form.desc || ''}
                                        onChange={handleChange}
                                        // placeholder="e.g., Function description"
                                        rows={9}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] resize-none"
                                        disabled={loading}
                                    />
                                    {!!form.desc?.length && (
                                        <button
                                            type="button"
                                            onClick={() => handleChange({ target: { name: "desc", value: "" } })}
                                            className="cursor-pointer absolute right-4 bottom-4 -translate-y-1/2 z-10 text-red-400 hover:text-red-600"
                                            disabled={loading}
                                            aria-label="Clear Description"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>
                    <div className="flex justify-end space-x-4 mt-6 pt-2">
                        <button type="button" onClick={onClose} className="cursor-pointer px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors" disabled={loading}>CANCEL</button>
                        <button type="button" onClick={handleSubmit} className="cursor-pointer px-6 py-3 bg-[var(--primary-color)] text-white rounded-lg hover:bg-[var(--primary-color-dark)] transition-colors disabled:bg-gray-400 font-semibold" disabled={loading}>{loading ? 'SAVING...' : 'CREATE'} FUNCTION</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
