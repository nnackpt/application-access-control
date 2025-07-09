import { Application } from "@/types/Application"
import { Listbox, Transition } from "@headlessui/react"
import { ChevronDownIcon, CheckIcon } from "@heroicons/react/20/solid"
import { Fragment } from "react"
import { motion } from "framer-motion"

interface AppTitleSelectProps {
    selectedTitle: string
    setSelectedTitle: (title: string) => void
    applications: Application[]
}

export default function AppTitleSelect({
    selectedTitle,
    setSelectedTitle,
    applications,
}: AppTitleSelectProps) {
    const options = [
        { value: 'all', label: 'All Applications' },
        ...applications
            .map((app) => ({
                value: app.apP_CODE?.toString() || '',
                label: app.title || `Unknown App (${app.apP_CODE})`,
            }))
            .filter((option) => option.value !== '')
            .sort((a, b) => {
                const numA = parseFloat(String(a.value))
                const numB = parseFloat(String(b.value))

                if (!isNaN(numA) && !isNaN(numB)) {
                    return numA - numB
                } else {
                    return a.label.localeCompare(b.label)
                }
            }),
    ]

    const currentSelectedOption = options.findLast((option) => option.value === selectedTitle)

    return (
        <Listbox value={selectedTitle} onChange={setSelectedTitle}>
            {({ open }) => (
                <div className="relative">
                    <Listbox.Button className="relative w-72 cursor-default rounded-lg bg-white py-2 pl-3 pr-12 text-left shadow-md
                                               focus:outline-none focus-visible:border-[#005496] focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-[#005496] sm:text-sm
                                               border border-gray-300 hover:border-gray-400 transition-colors duration-200"
                    >
                        <span className="block">
                            {currentSelectedOption ? currentSelectedOption.label : 'All Application'}
                        </span>
                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                            <motion.div
                                animate={{ rotate: open ? 180 : 0 }} // Rotate 180 degrees when open, back to 0 when closed
                                transition={{ duration: 0.2 }} // Smooth transition for the rotation
                            >
                                <ChevronDownIcon
                                    className="h-5 w-5 text-gray-400"
                                    aria-hidden="true"
                                />
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
                                                    className={`block ${
                                                        selected ? 'font-semibold' : 'font-normal'
                                                    }`}
                                                >
                                                    {option.label}
                                                </span>
                                                {selected ? (
                                                    <span
                                                        className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                                            active ? 'text-white' : 'text-[#005496]'
                                                        }`}
                                                    >
                                                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
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