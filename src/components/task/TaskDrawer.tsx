import { useState, useEffect } from 'react';
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

    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({ title: '', description: '', link: '' });
    const { updateTask, deleteTask } = useTaskContext();

    // Reset local state when selectedTask changes
    useEffect(() => {
        if (selectedTask) {
            setEditForm({
                title: selectedTask.title,
                description: selectedTask.description,
                link: selectedTask.link
            });
            setIsEditing(false);
        }
    }, [selectedTask]);

    const handleSave = () => {
        if (selectedTask) {
            updateTask({
                ...selectedTask,
                ...editForm
            });
            setIsEditing(false);
        }
    };

    const handleDelete = () => {
        if (selectedTask && confirm('Are you sure you want to delete this task?')) {
            deleteTask(selectedTask.id);
        }
    };



    const canEdit = (): boolean => {
        if (!selectedTask) return false;
        const isPastDate = isPast(endOfDay(parseISO(selectedTask.date)));

        if (role === 'Manager') return true;

        // Designer: Can edit pending tasks on current/future dates if they own it
        if (role === 'Designer') {
            if (isPastDate) return false;
            if (selectedTask.designerId !== activeDesignerId) return false;
            if (selectedTask.status === 'Pending') return true;
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
                                <h2 className="text-xl font-bold text-text-main">
                                    {isEditing ? 'Edit Task' : 'Task Details'}
                                </h2>
                                <div className="flex items-center gap-2">
                                    {!isEditing && canEdit() && (
                                        <>
                                            <button
                                                onClick={() => setIsEditing(true)}
                                                className="p-2 hover:bg-surface-dark rounded-full transition-colors text-text-muted hover:text-primary"
                                                title="Edit Task"
                                            >
                                                <span className="material-symbols-outlined">edit</span>
                                            </button>
                                            <button
                                                onClick={handleDelete}
                                                className="p-2 hover:bg-surface-dark rounded-full transition-colors text-text-muted hover:text-red-500"
                                                title="Delete Task"
                                            >
                                                <span className="material-symbols-outlined">delete</span>
                                            </button>
                                        </>
                                    )}
                                    <button
                                        onClick={handleClose}
                                        className="p-2 hover:bg-surface-dark rounded-full transition-colors text-text-muted hover:text-text-main"
                                    >
                                        <span className="material-symbols-outlined">close</span>
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 p-6 space-y-8">
                                {/* Title & Desc */}
                                <div className="space-y-4">
                                    {isEditing ? (
                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-xs uppercase font-bold text-text-muted tracking-wider mb-1 block">Title</label>
                                                <input
                                                    type="text"
                                                    value={editForm.title}
                                                    onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                                                    className="w-full bg-surface-dark border border-border-dark rounded-lg px-3 py-2 text-text-main focus:outline-none focus:border-primary"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs uppercase font-bold text-text-muted tracking-wider mb-1 block">Description</label>
                                                <textarea
                                                    value={editForm.description}
                                                    onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                                                    rows={3}
                                                    className="w-full bg-surface-dark border border-border-dark rounded-lg px-3 py-2 text-text-main focus:outline-none focus:border-primary resize-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs uppercase font-bold text-text-muted tracking-wider mb-1 block">Link</label>
                                                <input
                                                    type="text"
                                                    value={editForm.link}
                                                    onChange={(e) => setEditForm(prev => ({ ...prev, link: e.target.value }))}
                                                    className="w-full bg-surface-dark border border-border-dark rounded-lg px-3 py-2 text-text-main focus:outline-none focus:border-primary"
                                                />
                                            </div>
                                            <div className="flex justify-end gap-2 pt-2">
                                                <button
                                                    onClick={() => setIsEditing(false)}
                                                    className="px-3 py-1.5 text-sm font-bold text-text-muted hover:text-text-main"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={handleSave}
                                                    className="px-3 py-1.5 text-sm font-bold bg-primary text-white rounded hover:bg-blue-600"
                                                >
                                                    Save Changes
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <h3 className="text-2xl font-bold text-text-main leading-tight">{selectedTask.title}</h3>
                                            <p className="text-text-muted leading-relaxed whitespace-pre-wrap">{selectedTask.description}</p>
                                        </>
                                    )}
                                </div>

                                {/* Status */}
                                <div className="space-y-3">
                                    <label className="text-xs uppercase font-bold text-text-muted tracking-wider">Status</label>
                                    <div className="flex flex-wrap gap-2">
                                        {['Pending', 'Submitted'].map((s) => {
                                            const status = s as Status;
                                            const isActive = selectedTask.status === status;

                                            // Allow free movement between statuses
                                            return (
                                                <button
                                                    key={status}
                                                    onClick={() => updateTaskStatus(selectedTask.id, status)}
                                                    disabled={isEditing}
                                                    className={cn(
                                                        "px-3 py-1.5 rounded text-sm font-bold border transition-all",
                                                        isActive
                                                            ? status === 'Pending' ? "bg-red-500/20 border-red-500 text-red-500"
                                                                : "bg-green-500/20 border-green-500 text-green-500"
                                                            : "bg-surface-dark border-border-dark text-text-muted",
                                                        isEditing && "opacity-30 cursor-not-allowed",
                                                        !isActive && !isEditing && "hover:bg-gray-100 hover:border-text-main/20"
                                                    )}
                                                >
                                                    {status}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    {/* Removed lock message as transition is now free */}
                                </div>

                                {/* Links */}
                                {!isEditing && (
                                    <div className="space-y-3">
                                        <label className="text-xs uppercase font-bold text-text-muted tracking-wider">Resources</label>
                                        <a
                                            href={selectedTask.link.startsWith('http') ? selectedTask.link : `https://${selectedTask.link}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex items-center gap-3 p-3 rounded-lg bg-surface-dark border border-border-dark hover:border-primary/50 group transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-primary">link</span>
                                            <div className="flex flex-col">
                                                <span className="text-text-main text-sm font-medium group-hover:text-primary transition-colors">Project Link</span>
                                                <span className="text-xs text-text-muted truncate max-w-[200px]">{selectedTask.link}</span>
                                            </div>
                                            <span className="material-symbols-outlined text-text-muted ml-auto group-hover:text-text-main">open_in_new</span>
                                        </a>
                                    </div>
                                )}

                                {/* Meta */}
                                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-border-dark">
                                    <div>
                                        <label className="text-xs text-text-muted">Assigned to</label>
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
                                            <span className="text-text-main text-sm">{assignedDesigner?.name || 'Unknown'}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs text-text-muted">Due Date</label>
                                        <div className="mt-1 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-text-muted text-sm">calendar_today</span>
                                            <span className="text-text-main text-sm">{selectedTask.date}</span>
                                        </div>
                                    </div>
                                    {selectedTask.updatedAt && (
                                        <div className="col-span-2">
                                            <label className="text-xs text-text-muted">Last updated</label>
                                            <p className="text-xs text-text-main mt-0.5">{formatDate(selectedTask.updatedAt)}</p>
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
