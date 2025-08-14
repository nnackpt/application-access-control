import { Application } from "@/types/Application"
import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDownIcon, ChevronRight } from "lucide-react";

interface CreateAppCodeSelectProps {
    value: string
    onChange: (value: string) => void
    applications: Application[]
    error?: string
    loading?: boolean
    loadingApps?: boolean
}

export default function CreateAppCodeSelect({
    value,
    onChange,
    applications,
    error,
    loading,
    loadingApps
}: CreateAppCodeSelectProps) {
    const [open, setOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const [hoverLabel, setHoverLabel] = useState<string>('')

    const sortedOptions = applications
        .map(app => ({
            value: app.apP_CODE?.toString() || '',
            label: app.title || `Unknown App ${app.apP_CODE}`
        }))
        .filter(option => option.value !== '')
        .sort((a, b) => Number(a.value) - Number(b.value))

    const options = [
        { value: '', label: 'Select APP Code' },
        ...sortedOptions
    ]

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    },[])

    const current = options.find(o => o.value === value) || options[0]

    return (
        <div className="w-full">
            {/* <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                APP Code <span className="text-red-500">*</span>
            </label> */}
            <div className="relative" ref={dropdownRef}>
                <button
                    type="button"
                    onClick={() => !loading && !loadingApps && setOpen(prev => !prev)}
                    className={`w-full cursor-default rounded-lg bg-white py-3.5 pl-3  pr-10 text-left
                                focus:outline-none border text-sm relative
                                ${error ? 'border-red-500' : 'border-gray-300'}
                                ${loading || loadingApps ? 'bg-gray-100 cursor-not-allowed text-gray-500' : 'hover:border-gray-400 text-gray-900'}`}
                    disabled={loading || loadingApps}
                >
                    <span className={hoverLabel ? "text-gray-400" : ""}>
                        {hoverLabel || current.label}
                    </span>
                    <span className="absolute inset-y-0 right-0 flex items-center pr-2">
                        <motion.div
                            animate={{ rotate: open ? 0 : -90}}
                            transition={{ duration: 0.2 }}
                        >
                            <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                        </motion.div>
                    </span>
                </button>

                <AnimatePresence>
                    {open && (
                        <motion.ul
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.25 }}
                            className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-md bg-white py-1 text-sm shadow-lg ring-1 ring-black/5 border border-gray-200"
                        >
                            {options.map(option => (
                                <li
                                    key={option.value}
                                    onClick={() => {
                                        onChange(option.value)
                                        setOpen(false)
                                        setHoverLabel("")
                                    }}
                                    onMouseEnter={() => setHoverLabel(option.label)}
                                    onMouseLeave={() => setHoverLabel("")}
                                    className={`cursor-pointer select-none px-4 py-2 flex items-center gap-2 ${
                                        value === option.value
                                            ? 'bg-[var(--primary-color)] text-white font-semibold'
                                            : 'text-gray-900 hover:bg-[#e6f0fa]'
                                    }`}
                                >
                                    {value === option.value && (
                                        <ChevronRight className="h-4 w-4 text-white" />
                                    )}
                                    {option.label}
                                </li>
                            ))}
                        </motion.ul>
                    )}
                </AnimatePresence>
            </div>

            {/* {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            {loadingApps && <p className="text-gray-500 text-sm mt-1">Loading Applications...</p>} */}
        </div>
    )
}