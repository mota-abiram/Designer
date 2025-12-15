import { useTaskContext } from '../../context/TaskContext';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';
import type { Status } from '../../types';
import { format, parseISO, isPast, endOfDay } from 'date-fns';

export const TaskDrawer = () => {
    const {
        selectedTask,
        setSelectedTask,
        isDrawerOpen,
        role,
        updateTaskStatus,
        designers,
        activeDesignerId
    } = useTaskContext();

    const handleClose = () => setSelectedTask(null);

    // Permission Logic
    const canChangeStatus = (targetStatus: Status): boolean => {
        if (!selectedTask) return false;

        const isPastDate = isPast(endOfDay(parseISO(selectedTask.date)));

        // 1. Past dates: Read-only for designers
        if (role === 'Designer' && isPastDate) return false;

        // 2. Role based transitions
        if (role === 'Designer') {
            if (selectedTask.designerId !== activeDesignerId) return false;
            if (selectedTask.status === 'Pending' && targetStatus === 'Submitted') return true;
            return false;
        }

        if (role === 'Manager') {
            if (selectedTask.status === 'Submitted' && targetStatus === 'Approved') return true;
            if (selectedTask.status === 'Approved' && targetStatus === 'Pending') return true;
            if (selectedTask.status === 'Pending' && targetStatus === 'Submitted') return true;
            if (selectedTask.status === 'Approved' && targetStatus === 'Submitted') return true;
            return true;
        }

        return false;
    };

    const assignedDesigner = designers.find(d => d.id === selectedTask?.designerId);

    // Format helpers
    const formatDate = (isoString?: string) => {
        if (!isoString) return '';
        return format(parseISO(isoString), 'MMM d, h:mm a');
    };

    return (
        <AnimatePresence>
            {isDrawerOpen && selectedTask && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-background-dark border-l border-border-dark shadow-2xl overflow-y-auto"
                    >
                        <div className="flex flex-col h-full bg-background-dark">
                            <div className="flex items-center justify-between p-6 border-b border-border-dark bg-background-dark/95 backdrop-blur z-10 sticky top-0">
                                <h2 className="text-xl font-bold text-white">Task Details</h2>
                                <button
                                    onClick={handleClose}
                                    className="p-2 hover:bg-surface-dark rounded-full transition-colors text-[#92adc9] hover:text-white"
                                >
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>

                            <div className="flex-1 p-6 space-y-8">
                                {/* Title & Desc */}
                                <div className="space-y-4">
                                    <h3 className="text-2xl font-bold text-white leading-tight">{selectedTask.title}</h3>
                                    <p className="text-[#92adc9] leading-relaxed whitespace-pre-wrap">{selectedTask.description}</p>
                                </div>

                                {/* Status */}
                                <div className="space-y-3">
                                    <label className="text-xs uppercase font-bold text-[#92adc9] tracking-wider">Status</label>
                                    <div className="flex flex-wrap gap-2">
                                        {['Pending', 'Submitted', 'Approved'].map((s) => {
                                            const status = s as Status;
                                            const isActive = selectedTask.status === status;
                                            const canSelect = canChangeStatus(status);

                                            return (
                                                <button
                                                    key={status}
                                                    onClick={() => updateTaskStatus(selectedTask.id, status)}
                                                    disabled={!canSelect && !isActive}
                                                    className={cn(
                                                        "px-3 py-1.5 rounded text-sm font-bold border transition-all",
                                                        isActive
                                                            ? status === 'Pending' ? "bg-red-500/20 border-red-500 text-red-500"
                                                                : status === 'Submitted' ? "bg-yellow-500/20 border-yellow-500 text-yellow-500"
                                                                    : "bg-green-500/20 border-green-500 text-green-500"
                                                            : "bg-surface-dark border-border-dark text-[#92adc9]",
                                                        (!canSelect && !isActive) && "opacity-30 cursor-not-allowed",
                                                        (canSelect && !isActive) && "hover:bg-[#233648] hover:border-white/20"
                                                    )}
                                                >
                                                    {status}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    {role === 'Designer' && isPast(endOfDay(parseISO(selectedTask.date))) && (
                                        <p className="text-xs text-red-400 mt-2 flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[14px]">lock</span>
                                            Past dates are locked for Designers.
                                        </p>
                                    )}
                                </div>

                                {/* Links */}
                                <div className="space-y-3">
                                    <label className="text-xs uppercase font-bold text-[#92adc9] tracking-wider">Resources</label>
                                    <a
                                        href={selectedTask.link.startsWith('http') ? selectedTask.link : `https://${selectedTask.link}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center gap-3 p-3 rounded-lg bg-surface-dark border border-border-dark hover:border-primary/50 group transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-primary">link</span>
                                        <div className="flex flex-col">
                                            <span className="text-white text-sm font-medium group-hover:text-primary transition-colors">Project Link</span>
                                            <span className="text-xs text-[#92adc9] truncate max-w-[200px]">{selectedTask.link}</span>
                                        </div>
                                        <span className="material-symbols-outlined text-[#92adc9] ml-auto group-hover:text-white">open_in_new</span>
                                    </a>
                                </div>

                                {/* Meta */}
                                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-border-dark">
                                    <div>
                                        <label className="text-xs text-[#92adc9]">Assigned to</label>
                                        <div className="mt-1 flex items-center gap-2">
                                            {assignedDesigner?.avatar ? (
                                                <div
                                                    className="size-6 rounded-full bg-cover bg-center"
                                                    style={{ backgroundImage: `url("${assignedDesigner.avatar}")` }}
                                                ></div>
                                            ) : (
                                                <div className="size-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                                                    {assignedDesigner?.name?.[0] || 'D'}
                                                </div>
                                            )}
                                            <span className="text-white text-sm">{assignedDesigner?.name || 'Unknown'}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs text-[#92adc9]">Due Date</label>
                                        <div className="mt-1 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-[#92adc9] text-sm">calendar_today</span>
                                            <span className="text-white text-sm">{selectedTask.date}</span>
                                        </div>
                                    </div>
                                    {selectedTask.updatedAt && (
                                        <div className="col-span-2">
                                            <label className="text-xs text-[#92adc9]">Last updated</label>
                                            <p className="text-xs text-white mt-0.5">{formatDate(selectedTask.updatedAt)}</p>
                                        </div>
                                    )}
                                </div>

                            </div>

                            {/* Debug Info */}
                            <div className="p-4 border-t border-border-dark bg-background-dark/50 text-center text-xs text-[#546b82]">
                                Task ID: {selectedTask.id} | Mode: {role}
                            </div>

                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
