import useCurrentUser from "@/hooks/useCurrentUser";

import { applicationApi } from "@/services/ApplicationApi";
import { AppsRolesApi } from "@/services/AppsRolesApi";
import { AppsFunctionsApi } from "@/services/AppsFunctionsApi";
import { rbacApi } from "@/services/RbacApi";
import { Application } from "@/types/Application";
import { AppsRoles } from "@/types/AppsRoles";
import { AppsFunctions } from "@/types/AppsFunctions";
import { createRbac } from "@/types/Rbac";

import { ChevronDownIcon, X } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { AnimatePresence } from 'framer-motion';
import { motion } from 'framer-motion';

const initForm = {
  APP_CODE: "",
  ROLE_CODE: "",
  FUNC_CODES: [],
};

export default function RbacCreateModal({
  isOpen,
  onClose,
  onSuccess
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [form, setForm] = useState<createRbac>(initForm);
  const [error, setError] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [applications, setApplications] = useState<Application[]>([]);
  const [roles, setRoles] = useState<AppsRoles[]>([]);
  const [functions, setFunctions] = useState<AppsFunctions[]>([]);
  const [loadingApps, setLoadingApps] = useState(false);
  const [loadingRoles, setLoadingRoles] = useState(false);
  // const [loadingFuncs, setLoadingFuncs] = useState(false);
  const [loadingAssignedFuncs, setLoadingAssignedFuncs] = useState(false);
  const { userName } = useCurrentUser();
  const [showAppDropDown, setShowAppDropdown] = useState(false)
  const [showRoleDropDown, setShowRoleDropdown] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setLoadingApps(true);
      setLoadingRoles(true);
      // setLoadingFuncs(true);
      Promise.all([
        applicationApi.getApplications(),
        AppsRolesApi.getAppsRoles(),
        AppsFunctionsApi.getAppsFunctions()
      ])
        .then(([apps, roles, funcs]) => {
          setApplications(apps);
          setRoles(roles);
          setFunctions(funcs);
        })
        .catch(() => {
          toast.error("Error loading data");
        })
        .finally(() => {
          setLoadingApps(false);
          setLoadingRoles(false);
          // setLoadingFuncs(false);
        });
    }
  }, [isOpen]);

  useEffect(() => {
    setForm(initForm);
    setError({});
  }, [isOpen]);

  // const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
  //   const { name, value } = e.target;
  //   setForm((prev: any) => ({ ...prev, [name]: value }));
  //   if (error[name]) setError((prev) => ({ ...prev, [name]: "" }));
  // };

  const handleCheck = (funcCode: string, checked: boolean) => {
    setForm((prev) => ({
      ...prev,
      FUNC_CODES: checked
        ? [...prev.FUNC_CODES, funcCode]
        : prev.FUNC_CODES.filter((code) => code !== funcCode),
    }))
    if (error.FUNC_CODES) setError(prev => ({ ...prev, FUNC_CODES: "" }));
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!form.APP_CODE) newErrors.APP_CODE = "APP Code is required";
    if (!form.ROLE_CODE) newErrors.ROLE_CODE = "Role Code is required";
    if (!form.FUNC_CODES || form.FUNC_CODES.length === 0) newErrors.FUNC_CODES = "Select at least one function";
    setError(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      await rbacApi.createRbac({ ...form, createD_BY: userName });
      toast.success("Successfully created!");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error("Create failed!");
      console.error("RBAC create error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isCancelled = false;

    const fetchAssignedFuncs = async () => {
      if (!form.APP_CODE || !form.ROLE_CODE) {
        setForm((prev) => ({ ...prev, FUNC_CODES: [] }));
        return;
      }

      setLoadingAssignedFuncs(true);
      try {
        const assigned = await rbacApi.getAssignedFuncCodes(form.APP_CODE, form.ROLE_CODE);
        if (!isCancelled) {
          setForm((prev) => ({ ...prev, FUNC_CODES: assigned || [] }));
        }
      } catch (err) {
        if (!isCancelled) {
          console.error("Failed to load assigned functions", err);
          setForm((prev) => ({ ...prev, FUNC_CODES: [] }));
        }
      } finally {
        if (!isCancelled) {
          setLoadingAssignedFuncs(false);
        }
      }
    };

    fetchAssignedFuncs();
    return () => { isCancelled = true; };
  }, [form.APP_CODE, form.ROLE_CODE]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-visible" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-[var(--primary-color)] text-white p-6 rounded-t-xl flex justify-between items-center">
          <h2 className="text-xl font-semibold">Create New Application&apos;s RBAC</h2>
          <button onClick={onClose} className="text-white hover:text-blue-200 transition-colors cursor-pointer" disabled={loading}>
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
                <button
                  onClick={() => setShowAppDropdown(prev => !prev)}
                  className={`w-full p-3 border rounded-lg text-left flex justify-between items-center  
                              focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] ${error.APP_CODE ? 'border-red-500' : 'border-gray-300'}`}
                  disabled={loading || loadingApps}
                >
                  <span>
                    {applications.find(app => app.apP_CODE === form.APP_CODE)?.title || "Select APP Code"}
                  </span>
                  <span className="pointer-events-none">
                    <motion.div
                      animate={{ rotate: showAppDropDown ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                    </motion.div>
                  </span>
                </button>

                <AnimatePresence>
                  {showAppDropDown && (
                    <motion.ul
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="absolute z-10 w-full mt-1 max-h-60 overflow-y-auto bg-white border border-gray-300 rounded-lg shadow-lg"
                    >
                      {applications.map((app) => (
                        <li
                          key={app.apP_CODE}
                          onClick={() => {
                            setForm((prev) => ({ ...prev, APP_CODE: app.apP_CODE, ROLE_CODE: "", FUNC_CODES: [] }))
                            setShowAppDropdown(false)
                          }}
                          className="px-4 py-2 hover:bg-[var(--primary-color)] hover:text-white cursor-pointer text-sm"
                        >
                          {app.title}
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>
              {error.APP_CODE && <p className="text-red-500 text-sm mt-1">{error.APP_CODE}</p>}
            </div>

            {/* Role Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role Code <span className="text-red-500">*</span>
              </label>
                <div className="relative">
                  <button
                    onClick={() => setShowRoleDropdown(prev => !prev)}
                    className={`w-full p-3 border rounded-lg text-left flex justify-between items-center
                                focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] ${error.ROLE_CODE ? 'border-red-500' : 'border-gray-300'}`}
                    disabled={loading || loadingRoles}
                  >
                    <span>
                      {roles.find(role => role.rolE_CODE === form.ROLE_CODE)?.name || "Select Role Code"}
                    </span>
                    <span className="pointer-events-none">
                      <motion.div
                        animate={{ rotate: showRoleDropDown ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                      </motion.div>
                    </span>
                  </button>

                  <AnimatePresence>
                    {showRoleDropDown && (
                      <motion.ul
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="absolute z-10 w-full mt-1 max-h-60 overflow-y-auto bg-white border border-gray-300 rounded-lg shadow-lg"
                      >
                        {roles
                          .filter(r => r.apP_CODE === form.APP_CODE)
                          .map((role) => (
                            <li
                              key={role.rolE_CODE}
                              onClick={() => {
                                setForm((prev) => ({ ...prev, ROLE_CODE: role.rolE_CODE || "", FUNC_CODES: [] }))
                                setShowRoleDropdown(false)
                              }}
                              className="px-4 py-2 hover:bg-[var(--primary-color)] hover:text-white cursor-pointer text-sm"
                            >
                              {role.name}
                            </li>
                          ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </div>
              {error.ROLE_CODE && <p className="text-red-500 text-sm mt-1">{error.ROLE_CODE}</p>}
            </div>

            {/* Functions */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Functions <span className="text-red-500">*</span>
                {loadingAssignedFuncs && <span className="text-blue-500 text-xs ml-2">(Loading assigned functions...)</span>}
              </label>
              <div className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] min-h-[3rem] max-h-60 overflow-y-auto ${error.FUNC_CODES ? 'border-red-500' : 'border-gray-300'}`}>
                {functions
                  .filter(f => f.apP_CODE === form.APP_CODE)
                  .map((func, idx) => (
                    <label key={idx} className="flex items-center space-x-2 mb-2">
                      <input
                        type="checkbox"
                        value={func.funC_CODE}
                        checked={form.FUNC_CODES.includes(func.funC_CODE)}
                        onChange={e => handleCheck(func.funC_CODE, e.target.checked)}
                        disabled={loading || loadingAssignedFuncs}
                      />
                      <span className="text-sm">{func.funC_CODE} - {func.name}</span>
                    </label>
                  ))}
                {functions.filter(f => f.apP_CODE === form.APP_CODE).length === 0 && (
                  <p className="text-gray-400 text-sm">No functions found for this application.</p>
                )}
              </div>
              {error.FUNC_CODES && <p className="text-red-500 text-sm mt-1">{error.FUNC_CODES}</p>}
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-8 pt-6 border-t">
            <button type="button" onClick={onClose} className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors" disabled={loading}>Cancel</button>
            <button type="button" onClick={handleSubmit} className="px-6 py-3 bg-[var(--primary-color)] text-white rounded-lg hover:bg-[var(--primary-color-dark)] transition-colors disabled:bg-gray-400" disabled={loading || loadingAssignedFuncs}>
              {loading ? "Saving..." : "Create"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
