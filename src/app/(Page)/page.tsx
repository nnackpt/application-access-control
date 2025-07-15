// "use client"

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Home - Autoliv (Thailand) Co., Ltd.",
  description: "This is the layout for the application section.",
};

export default function Home() {
    return (
        <div id="Home" className="flex flex-col md:flex-row h-auto md:h-[calc(115vh-210px)] min-h-screen md:min-h-[calc(100vh-210px)] w-full overflow-hidden">
            {/* Left 2/3: background image section */}
            <div 
                className="flex-none md:flex-[2] h-full md:h-full min-h-[300px] md:min-h-auto w-full bg-center bg-no-repeat"
                style={{
                    backgroundImage: 'url("/HomeBG.png")',
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat"
                }}
            />

            {/* Right 1/3: text and content */}
            <div className="flex-none md:flex-1 p-6 md:p-8 lg:p-8 flex flex-col justify-center items-start min-h-[34vh] md:min-h-auto text-center md:text-left w-full">
                <h1 className="text-[#005496] font-black text-center md:text-left w-full text-[2rem] sm:text-[2.5rem] md:text-[3rem] lg:text-[3.5rem] leading-tight mb-4">
                    Autoliv
                </h1>
                
                <div className="w-full h-[15px] md:h-[20px] mb-4 animated-gradient-bar" />

                <p className="text-[#005496] font-bold text-center md:text-left w-full text-[0.9rem] sm:text-[1rem] md:text-[1.1rem] tracking-wide">
                    APPLICATION ACCESS CONTROL (RBAC)
                </p>
            </div>
        </div>
    )
}