import { ChevronDownIcon } from "@heroicons/react/20/solid"
import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ChevronRight } from 'lucide-react';

interface AppRoleSelectProps {
    selectedRole: string
    setSelectedRole: (role: string) => void
    roles: string[]
}

export default function AppRoleSelect({
    selectedRole,
    setSelectedRole,
    roles
}: AppRoleSelectProps) {
    const [open, setOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)
    
    const sortedRoleOptions = roles
        .filter(role => role !== '')
        .sort((a, b) => a.localeCompare(b))

    const options = [
        { value: 'all', label: 'All Roles' },
        ...sortedRoleOptions.map(role => ({
            value: role,
            label: role
        }))
    ]
    
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])
    
    const current = options.find(o => o.value === selectedRole) || options[0]
    
    return (
        <div className="relative w-72" ref={dropdownRef}>
            <button
                onClick={() => setOpen(prev => !prev)}
                className="w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md
                            focus:outline-none border border-gray-300 hover:border-gray-400 transition-colors duration-200 text-sm relative"
            >
                <span>{current.label}</span>
                <span className="absolute inset-y-0 right-0 flex items-center pr-2">
                    <motion.div animate={{ rotate: open ? 0 : -90 }} transition={{ duration: 0.2 }}>
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
                        className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto overflow-x-hidden rounded-md bg-white py-1 text-sm shadow-lg ring-1 ring-black/5 border border-gray-200"
                    >
                        {options.map(option => (
                            <li
                                key={option.value}
                                onClick={() => {
                                    setSelectedRole(option.value)
                                    setOpen(false)
                                }}
                                className={`cursor-pointer select-none px-4 py-2 flex items-center gap-2 ${
                                    selectedRole === option.value
                                        ? 'bg-[var(--primary-color)] text-white font-semibold'
                                        : 'text-gray-900 hover:bg-[#e6f0fa]'
                                    }`
                                }
                            >
                                {selectedRole === option.value && (
                                    <ChevronRight className="h-4 w-4 text-white" />
                                )}
                                {option.label}
                            </li>
                        ))}
                    </motion.ul>
                )}
            </AnimatePresence>
        </div>
    )
}