import { Listbox, Transition } from "@headlessui/react"
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { motion } from 'framer-motion';
import { CheckIcon, ChevronRight, ArrowRightCircleIcon } from "lucide-react";
import { Fragment, useEffect, useRef, useState } from "react";
import { AnimatePresence } from 'framer-motion';

interface RowsPerPageSelectProps {
    rowsPerPage: number
    setRowsPerPage: (value: number) => void
}

export default function RowsPerPageSelect({
    rowsPerPage,
    setRowsPerPage,
}: RowsPerPageSelectProps) {
    const options = [
        { value: 10, label: "10" },
        { value: 25, label: "25" },
        { value: 50, label: "50" },
        { value: 100, label: "100" },
        { value: 0, label: "ALL" },
    ]

    const [open, setOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const current = options.find(o => o.value === rowsPerPage) || options[0]

    return (
        <div className="relative w-20" ref={dropdownRef}>
            <button
                onClick={() => setOpen(prev => !prev)}
                className="w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-8 text-left shadow-md
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
                        transition={{ duration: 0.2 }}
                        className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto overflow-x-hidden rounded-md bg-white py-1 text-sm shadow-lg ring-1 ring-black/5 border border-gray-200"
                    >
                        {options.map(option => (
                            <li
                                key={option.value}
                                onClick={() => {
                                    setRowsPerPage(option.value)
                                    setOpen(false)
                                }}
                                className={`cursor-pointer select-none px-4 py-2 flex items-center gap-2 ${
                                    rowsPerPage === option.value
                                        ? 'bg-[#005496] text-white font-semibold'
                                        : 'text-gray-900 hover:bg-[#e6f0fa]'
                                    }`
                                }
                            >
                                {rowsPerPage === option.value && (
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