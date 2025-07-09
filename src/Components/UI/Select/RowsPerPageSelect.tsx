import { Listbox, Transition } from "@headlessui/react"
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { motion } from 'framer-motion';
import { CheckIcon, ChevronRight } from "lucide-react";
import { Fragment } from "react";

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

    const currentSelectedOption = options.find((option) => option.value === rowsPerPage)

    return (
        <Listbox value={rowsPerPage} onChange={setRowsPerPage}>
            {({ open }) => (
                <div className="relative w-20">
                    <Listbox.Button
                        className="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-8 text-left shadow-md
                                    focus:outline-none focus-visible:border-[#005496] focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2
                                    focus-visible:ring-offset-[#005496] sm:text-sm border border-gray-300 hover:border-gray-400 transition-colors duration-200"
                    >
                        <span className="block truncate">
                            {currentSelectedOption ? currentSelectedOption.label : "10"}
                        </span>
                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                            <motion.div
                                animate={{ rotate: open ? 180 : 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <ChevronDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                            </motion.div>
                        </span>
                    </Listbox.Button>
                    <Transition
                        show={open}
                        as={Fragment}
                        leave="transition ease-in duration-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.25 }}
                            className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm"
                        >
                            <Listbox.Options static className="focus:outline-none">
                                {options.map((option) => (
                                    <Listbox.Option
                                        key={option.value}
                                        className={({ active }) =>
                                            `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                                active ? 'bg-[#005496] text-white' : 'text-gray-900'
                                            }`
                                        }
                                        value={option.value}
                                    >
                                        {({ selected, active }) => (
                                            <>
                                                <span
                                                    className={`bloack ${
                                                        selected ? "font-semibold" : "font-normal"
                                                    }`}
                                                >
                                                    {option.label}
                                                </span>
                                                {selected ? (
                                                    <span
                                                        className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                                            active ? "text-white" : "text-[#005496]"
                                                        }`}
                                                    >
                                                        <ChevronRight className="h-5 w-5" aria-hidden="true" />
                                                    </span>
                                                ) : null}
                                            </>
                                        )}
                                    </Listbox.Option>
                                ))}
                            </Listbox.Options>
                        </motion.div>
                    </Transition>
                </div>
            )}
        </Listbox>
    )
}