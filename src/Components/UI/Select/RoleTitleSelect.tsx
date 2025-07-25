"use client"

import { AppsRoles } from "@/types/AppsRoles"
import { useEffect, useRef, useState } from "react"
import { motion } from 'framer-motion';
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

interface RoleTitleSelectProps {
    selectedRole: string
    setSelectedRole: (roleCode: string) => void
    roles: AppsRoles[]
    selectedAppCode: string
}

export default function RoleTitleSelect({
    selectedRole,
    setSelectedRole,
    roles,
    selectedAppCode
}: RoleTitleSelectProps) {
    const [open, setOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    const filterRoles = roles.filter(role => 
        selectedAppCode === 'all' ? true : role.apP_CODE === selectedAppCode
    )

    // const options = [
    //     { value: 'all', label: 'All Roles' },
    //     ...filterRoles.map(role => ({
    //         value: role.rolE_CODE?.toString() || '',
    //         label: `${role.rolE_CODE || 'Unknown'} - ${role.name || 'Unnamed'}`
    //     }))
    // ].filter(option => option.value !== '').sort((a, b) => a.label.localeCompare(b.label))

    const sortedRoleOptions = filterRoles
        .map(role => ({
            value: role.rolE_CODE?.toString() || '',
            label: `${role.rolE_CODE || 'Unknown'} - ${role.name || 'Unnamed'}`
        }))
        .filter(option => option.value !== '')
        .sort((a, b) => a.label.localeCompare(b.label))

    const options = [
        { value: 'all', label: 'All Roles' },
        ...sortedRoleOptions
    ]

    const current = options.find(o => o.value === selectedRole) || options[0]
    useEffect(() => {
        const availableRoleCodes = roles
            .filter(role => selectedAppCode === 'all' || role.apP_CODE === selectedAppCode)
            .map(role => role.rolE_CODE?.toString())

        if (selectedRole !== 'all' && !availableRoleCodes.includes(selectedRole)) {
            setSelectedRole('all')
        }
    }, [selectedAppCode, roles, selectedRole, setSelectedRole])

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

    return (
        <div className="relative w-72" ref={dropdownRef}>
            <button
                onClick={() => setOpen(prev => !prev)}
                className="w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md
                            focus:outline-none border border-gray-300 hover:border-gray-400 transition-colors duration-200 text-sm relative"
            >
                <span>{current.label}</span>
                <span className="absolute inset-y-0 right-0 flex items-center pr-2">
                    <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
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