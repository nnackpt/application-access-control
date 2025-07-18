"use client"

import { motion, Variants } from "framer-motion"

interface StatsCardProps {
    title: string
    value: string | number
    icon?: React.ReactNode
    bgColor?: string
    pulseColor?: string
    valueColor?: string
    delay?: number
}

const cardVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
}

const StatsCard: React.FC<StatsCardProps> = ({
    title,
    value,
    icon,
    bgColor = "bg-gray-100",
    pulseColor = "bg-gray-500",
    valueColor = "text-gray-900",
    // delay = 0
}) => {
    return (
        <motion.div
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.2 }}
            whileHover={{ scale: 1.05 }}
        >
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className={`text-2xl font-bold ${valueColor}`}>
                        {value}
                    </p>
                </div>
                <div className={`p-3 rounded-lg ${bgColor}`}>
                    {icon ? (
                        icon
                    ) : (
                        <div className={`w-5 h-5 ${pulseColor} rounded-full animate-pulse`}></div>
                    )}
                </div>
            </div>
        </motion.div>
    )
}

export default StatsCard