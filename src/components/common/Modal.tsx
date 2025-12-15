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
                            className="bg-background-dark border border-border-dark rounded-xl shadow-2xl w-full max-w-md pointer-events-auto flex flex-col max-h-[90vh]"
                        >
                            <div className="flex items-center justify-between p-4 border-b border-border-dark">
                                <h2 className="text-lg font-bold text-text-main">{title}</h2>
                                <button
                                    onClick={onClose}
                                    className="p-1 hover:bg-surface-dark rounded-full transition-colors text-text-muted hover:text-text-main"
                                >
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                            <div className="p-4 overflow-y-auto custom-scrollbar">
                                {children}
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};
