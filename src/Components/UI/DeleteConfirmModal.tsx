import { motion, AnimatePresence } from 'framer-motion'

interface DeleteConfirmModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    appName: string
    loading: boolean
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
    isOpen, onClose, onConfirm, appName, loading
}) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <motion.div
                        className="bg-white rounded-xl shadow-2xl p-8 max-w-sm w-full"
                        initial={{ scale: 0.9, y: 50 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 50 }} 
                        transition={{ duration: 0.2, ease: "easeOut" }}
                    >
                        <h3 className="text-2xl font-bold text-red-700 mb-4 text-center">Confirm Deletion</h3>
                        <p className="mb-6 text-gray-700 text-center leading-relaxed">
                            Are you absolutely sure you want to delete <span className="font-extrabold text-[#005496]">{appName}</span>?
                            <br />
                            This action is irreversible and all associated data will be lost.
                        </p>
                        <div className="flex flex-col sm:flex-row-reverse justify-center gap-3">
                            <button
                                className="w-full sm:w-auto px-6 py-3 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition ease-in-out duration-200 disabled:bg-red-300 disabled:cursor-not-allowed"
                                onClick={onConfirm}
                                disabled={loading}
                            >
                                {loading ? 'Deleting...' : 'Delete Permanently'}
                            </button>
                            <button
                                className="w-full sm:w-auto px-6 py-3 rounded-lg border border-gray-300 text-gray-800 font-semibold hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition ease-in-out duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                                onClick={onClose}
                                disabled={loading}
                            >
                                Cancel
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

export default DeleteConfirmModal