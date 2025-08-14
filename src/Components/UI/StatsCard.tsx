"use client"

import { animate, motion, useMotionValue, useTransform, Variants } from "framer-motion"
import { useEffect } from "react"

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
    const isNumber = typeof value === "number" && Number.isFinite(value as number)
    const mv = useMotionValue(0)
    const displayed = useTransform(mv, (v) =>
        Math.round(v).toLocaleString(undefined, { maximumFractionDigits: 0 })
    )

    useEffect(() => {
        if (!isNumber) return
        const controls = animate(mv, value as number, { duration: 0.6, ease: "easeOut" })
        return () => controls.stop()
    }, [isNumber, value, mv])

    return (
        <motion.div
            className={[
                "relative overflow-hidden rounded-2xl p-5",
                "bg-white/70 supports-[backdrop-filter]:bg-white/55 backdrop-blur",
                "ring-1 ring-black/5 shadow-sm",
                "hover:shadow-md",
                "group"
            ].join(" ")}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.2 }}
            whileHover={{ scale: 1.05 }}
        >
            {/* BG Glow */}
            <div 
                aria-hidden
                className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full blur-2xl opacity-40"
                style={{
                    backgroundImage:
                        "radial-gradient(120px 120px at 85% -20%, rgba(0,0,0,0.06) 0%, transparent 60%)"
                }}
            />

            {/* Card Content */}
            <div className="flex items-center justify-between">
                <div className="min-w-0">
                    <div className="text-xs font-medium text-slate-500 tracking-wide uppercase">
                        {title}
                    </div>

                    <div className="mt-1 flex items-baseline gap-2">
                        <p className={`text-2xl font-semibold ${valueColor}`}>
                            {isNumber ? <motion.span className="tabular-nums">{displayed}</motion.span> : String(value)}
                        </p>
                    </div>
                </div>

                <div
                    className={[
                        "relative grid h-11 w-11 place-items-center shrink-0 rounded-xl text-white shadow-md",
                        bgColor,
                    ].join(" ")}
                    aria-hidden
                >
                    <div className="absolute inset-0 rounded-xl bg-white/10 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                    {icon ? (
                        icon
                    ) : (
                        <div className={`w-5 h-5 ${pulseColor} rounded-full animate-pulse`}></div>
                    )}
                </div>
            </div>

            <div className="mt-4 h-px bg-gradient-to-r from-transparent via-slate-200/70 to-transparent" />
        </motion.div>
    )
}

export default StatsCard