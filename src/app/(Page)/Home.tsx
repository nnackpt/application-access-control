"use client"

import { motion } from "framer-motion";

export default function Home() {
    return (
        <div id="Home" className="flex flex-col md:flex-row h-auto md:h-[calc(115vh-210px)] min-h-screen md:min-h-[calc(100vh-210px)] w-full overflow-hidden">
            
            {/* Left 2/3: background image section with fade-in */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.5 }}
                className="flex-none md:flex-[2] h-full min-h-[300px] w-full bg-center bg-no-repeat"
                style={{
                    backgroundImage: 'url("/HomeBG.png")',
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat"
                }}
            />

            {/* Right 1/3: text and content */}
            <div className="flex-none md:flex-1 p-6 md:p-8 lg:p-8 flex flex-col justify-center items-start min-h-[34vh] md:min-h-auto text-center md:text-left w-full">

                <motion.h1
                    initial={{ y: 40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 1, delay: 0.3 }}
                    className="text-[#005496] font-black text-center md:text-left w-full text-[2rem] sm:text-[2.5rem] md:text-[3rem] lg:text-[3.5rem] leading-tight mb-4"
                >
                    Autoliv
                </motion.h1>

                {/* Animated Gradient Bar */}
                <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 1, delay: 0.6 }}
                    className="w-full h-[15px] md:h-[20px] mb-4 bg-gradient-to-r from-[#005496] via-[#66a3d2] to-[#003d73] origin-left rounded animated-gradient-bar"
                />

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 1 }}
                    className="text-[#005496] font-bold text-center md:text-left w-full text-[0.9rem] sm:text-[1rem] md:text-[1.1rem] tracking-wide"
                >
                    APPLICATION ACCESS CONTROL (RBAC)
                </motion.p>
            </div>
        </div>
    );
}
