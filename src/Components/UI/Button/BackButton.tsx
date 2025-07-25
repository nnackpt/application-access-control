// import { motion } from 'framer-motion';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

interface BackButtonProps {
    router: AppRouterInstance
}

const BackButton = ({ router }: BackButtonProps) => {
    return (
        <button
            onClick={() => router.back()}
            className="bg-white text-center w-48 rounded-2xl h-14 relative text-black text-xl font-semibold group overflow-hidden"
            type="button"
            // whileTap={{ scale: 0.98 }}
            // transition={{ type: "spring", stiffness: 400, damping: 17 }} 
            // initial={{ opacity: 0, x: 20 }} 
            // animate={{ opacity: 1, x: 0 }}
        >
            {/* Green animated bg */}
            <div
                className="bg-green-400 rounded-xl h-12 w-1/4 flex items-center justify-center absolute left-1 top-[4px] group-hover:w-[184px] z-10 duration-500"
                // whileHover={{ width: "184px" }}
                // transition={{ type: "spring", stiffness: 500, damping: 20 }}
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" height="25px" width="25px" fill="#FFFFFF">
                    <path d="M224 480h640a32 32 0 1 1 0 64H224a32 32 0 0 1 0-64z" />
                    <path d="m237.248 512 265.408 265.344a32 32 0 0 1-45.312 45.312l-288-288a32 32 0 0 1 0-45.312l288-288a32 32 0 1 1 45.312 45.312L237.248 512z" />
                </svg>
            </div>
            {/* BTN Text */}
            <p
                className="translate-x-2"
            >
                Go Back
            </p>
        </button>
    )
}

export default BackButton