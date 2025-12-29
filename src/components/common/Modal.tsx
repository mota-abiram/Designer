import type { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
}

export const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
                    />
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 10 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 10 }}
                            className="bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] w-full max-w-md pointer-events-auto flex flex-col max-h-[90vh] transition-colors overflow-hidden"
                        >
                            <div className="flex items-center justify-between px-6 py-5 border-b border-border-light dark:border-border-dark transition-colors bg-white dark:bg-surface-dark/50">
                                <h2 className="text-xl font-black text-text-main dark:text-text-main-dark tracking-tight uppercase tracking-widest">{title}</h2>
                                <button
                                    onClick={onClose}
                                    className="p-1 px-3 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-text-muted dark:text-text-muted-dark hover:text-text-main dark:hover:text-text-main-dark"
                                >
                                    <span className="material-symbols-outlined font-black">close</span>
                                </button>
                            </div>
                            <div className="p-8 overflow-y-auto custom-scrollbar">
                                {children}
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};
