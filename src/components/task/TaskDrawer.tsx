import { useState, useEffect } from 'react';
import { useTaskContext } from '../../context/TaskContext';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';
import type { Status } from '../../types';
import { format, parseISO, isPast, endOfDay } from 'date-fns';
import { ASSIGNERS } from '../../constants/assigners';

export const TaskDrawer = () => {
    const {
        selectedTask,
        setSelectedTask,
        isDrawerOpen,
        role,
        updateTaskStatus,
        designers,
        activeDesignerId,
        brands,
        creativeTypes,
        scopes,
        addComment
    } = useTaskContext();

    const handleClose = () => setSelectedTask(null);

    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({ title: '', description: '', designerId: '', brand: '', creativeType: '', scope: '' });
    const [newComment, setNewComment] = useState('');
    const { updateTask, deleteTask } = useTaskContext();

    // Reset local state when selectedTask changes
    useEffect(() => {
        if (selectedTask) {
            setEditForm({
                title: selectedTask.title,
                description: selectedTask.description,
                designerId: selectedTask.designerId,
                brand: selectedTask.brand || '',
                creativeType: selectedTask.creativeType || '',
                scope: selectedTask.scope || ''
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

    const handleAddComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !selectedTask) return;
        await addComment(selectedTask.id, newComment);
        setNewComment('');
    };

    const canEdit = (): boolean => {
        if (!selectedTask) return false;
        const isPastDate = isPast(endOfDay(parseISO(selectedTask.date)));

        if (role === 'Manager') return true;

        if (role === 'Designer') {
            if (isPastDate) return false;
            if (selectedTask.designerId !== activeDesignerId) return false;
            if (selectedTask.status === 'Pending') return true;
        }
        return false;
    };

    const formatDate = (isoString?: string) => {
        if (!isoString) return '';
        return format(parseISO(isoString), 'MMM d, h:mm a');
    };

    return (
        <AnimatePresence>
            {isDrawerOpen && selectedTask && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-background-light dark:bg-background-dark border-l border-border-light dark:border-border-dark shadow-2xl overflow-y-auto"
                    >
                        <div className="flex flex-col h-full bg-background-light dark:bg-background-dark">
                            <div className="flex items-center justify-between p-6 border-b border-border-light dark:border-border-dark bg-surface-light/95 dark:bg-surface-dark/95 backdrop-blur z-10 sticky top-0 transition-colors">
                                <h2 className="text-2xl font-bold text-slate-950 dark:text-white">
                                    {isEditing ? 'EDIT TASK' : 'TASK DETAILS'}
                                </h2>
                                <div className="flex items-center gap-2">
                                    {!isEditing && canEdit() && (
                                        <>
                                            <button
                                                onClick={() => setIsEditing(true)}
                                                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-900 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white"
                                                title="Edit Task"
                                            >
                                                <span className="material-symbols-outlined font-bold">edit</span>
                                            </button>
                                            <button
                                                onClick={handleDelete}
                                                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-900 dark:text-slate-200 hover:text-red-500"
                                                title="Delete Task"
                                            >
                                                <span className="material-symbols-outlined font-bold">delete</span>
                                            </button>
                                        </>
                                    )}
                                    <button
                                        onClick={handleClose}
                                        className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-900 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white"
                                    >
                                        <span className="material-symbols-outlined font-bold">close</span>
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 p-6 space-y-8">
                                <div className="space-y-4">
                                    {isEditing ? (
                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-[11px] uppercase font-bold text-slate-900 dark:text-slate-200 tracking-wider mb-2 block">Title</label>
                                                <input
                                                    type="text"
                                                    value={editForm.title}
                                                    onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                                                    className="w-full bg-gray-50 dark:bg-slate-800/50 border border-border-light dark:border-border-dark rounded-xl px-4 py-3 text-slate-950 dark:text-white font-bold focus:outline-none focus:border-primary transition-all"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[11px] uppercase font-bold text-slate-900 dark:text-slate-200 tracking-wider mb-2 block">Description</label>
                                                <textarea
                                                    value={editForm.description}
                                                    onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                                                    rows={4}
                                                    className="w-full bg-gray-50 dark:bg-slate-800/50 border border-border-light dark:border-border-dark rounded-xl px-4 py-3 text-slate-950 dark:text-white font-semibold focus:outline-none focus:border-primary transition-all resize-none"
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-[11px] uppercase font-bold text-slate-900 dark:text-slate-200 tracking-wider mb-2 block">Brand</label>
                                                    <select
                                                        value={editForm.brand}
                                                        onChange={(e) => setEditForm(prev => ({ ...prev, brand: e.target.value }))}
                                                        className="w-full bg-gray-50 dark:bg-slate-800/50 border border-border-light dark:border-border-dark rounded-xl px-4 py-3 text-slate-950 dark:text-white font-bold focus:outline-none focus:border-primary transition-all appearance-none cursor-pointer"
                                                    >
                                                        <option value="">Select Brand</option>
                                                        {brands.map(b => (
                                                            <option key={b.id} value={b.name}>{b.name}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="text-[11px] uppercase font-bold text-slate-900 dark:text-slate-200 tracking-wider mb-2 block">Type</label>
                                                    <select
                                                        value={editForm.creativeType}
                                                        onChange={(e) => setEditForm(prev => ({ ...prev, creativeType: e.target.value }))}
                                                        className="w-full bg-gray-50 dark:bg-slate-800/50 border border-border-light dark:border-border-dark rounded-xl px-4 py-3 text-slate-950 dark:text-white font-bold focus:outline-none focus:border-primary transition-all appearance-none cursor-pointer"
                                                    >
                                                        <option value="">Select Type</option>
                                                        {creativeTypes.map(t => (
                                                            <option key={t.id} value={t.name}>{t.name}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="text-[11px] uppercase font-bold text-slate-900 dark:text-slate-200 tracking-wider mb-2 block">Scope</label>
                                                <select
                                                    value={editForm.scope}
                                                    onChange={(e) => setEditForm(prev => ({ ...prev, scope: e.target.value }))}
                                                    className="w-full bg-gray-50 dark:bg-slate-800/50 border border-border-light dark:border-border-dark rounded-xl px-4 py-3 text-slate-950 dark:text-white font-bold focus:outline-none focus:border-primary transition-all appearance-none cursor-pointer"
                                                >
                                                    <option value="">Select Scope</option>
                                                    {scopes.map(s => (
                                                        <option key={s.id} value={s.name}>{s.name}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="flex justify-end gap-3 pt-4 border-t border-border-light dark:border-border-dark">
                                                <button
                                                    onClick={() => setIsEditing(false)}
                                                    className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-slate-900 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={handleSave}
                                                    className="px-6 py-2 text-xs font-bold uppercase tracking-widest bg-primary text-slate-900 rounded-xl hover:opacity-90 shadow-lg shadow-primary/20 transition-all active:scale-95"
                                                >
                                                    Save Changes
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <h3 className="text-3xl font-bold text-slate-950 dark:text-white leading-tight">{selectedTask.title}</h3>
                                            <div className="text-lg font-semibold text-slate-900 dark:text-slate-200 leading-relaxed whitespace-pre-wrap opacity-90">
                                                {selectedTask.description.split(/(https?:\/\/[^\s]+)/g).map((part, i) => (
                                                    part.match(/(https?:\/\/[^\s]+)/g) ? (
                                                        <a
                                                            key={i}
                                                            href={part}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="text-slate-950 dark:text-white underline font-bold"
                                                        >
                                                            {part}
                                                        </a>
                                                    ) : part
                                                ))}
                                            </div>
                                            {(selectedTask.brand || selectedTask.creativeType || selectedTask.scope) && (
                                                <div className="flex flex-wrap gap-2 pt-4">
                                                    {selectedTask.brand && (
                                                        <span className="px-3 py-1.5 bg-primary/10 text-slate-950 dark:text-primary-dark border border-primary/20 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-colors">
                                                            {selectedTask.brand}
                                                        </span>
                                                    )}
                                                    {selectedTask.creativeType && (
                                                        <span className="px-3 py-1.5 bg-gray-100 dark:bg-slate-800 text-slate-900 dark:text-slate-200 border border-border-light dark:border-border-dark rounded-xl text-[10px] font-bold uppercase tracking-widest transition-colors">
                                                            {selectedTask.creativeType}
                                                        </span>
                                                    )}
                                                    {selectedTask.scope && (
                                                        <span className="px-3 py-1.5 bg-green-500/10 text-green-500 border border-green-500/20 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-colors">
                                                            {selectedTask.scope}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>

                                <div className="space-y-4 pt-4">
                                    <div className="flex flex-wrap gap-2">
                                        {(['Pending', 'Pending Approval', 'Rework', 'Approved'] as Status[]).map((status) => {
                                            const isActive = selectedTask.status === status;

                                            // Determine if button should be disabled
                                            let isStatusDisabled = isEditing;

                                            // Permission Logic:
                                            // Designers can move to Pending or Pending Approval
                                            // Managers can do everything
                                            if (role === 'Designer') {
                                                if (status === 'Rework' || status === 'Approved') isStatusDisabled = true;
                                            }

                                            return (
                                                <button
                                                    key={status}
                                                    onClick={() => updateTaskStatus(selectedTask.id, status)}
                                                    disabled={isStatusDisabled}
                                                    className={cn(
                                                        "flex-1 px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all duration-300 flex items-center justify-center gap-2",
                                                        isActive
                                                            ? status === 'Pending'
                                                                ? "bg-red-500 text-white border-red-500 shadow-lg shadow-red-500/20"
                                                                : status === 'Pending Approval'
                                                                    ? "bg-blue-500 text-white border-blue-500 shadow-lg shadow-blue-500/20"
                                                                    : status === 'Approved'
                                                                        ? "bg-green-500 text-white border-green-500 shadow-lg shadow-green-500/20"
                                                                        : "bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-500/20"
                                                            : "bg-gray-50 dark:bg-slate-800/50 border-border-light dark:border-border-dark text-slate-900 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 transition-colors",
                                                        isStatusDisabled && "opacity-30 cursor-not-allowed"
                                                    )}
                                                >
                                                    {status === 'Pending Approval' ? 'SUBMIT' : status}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Comments Section */}
                                <div className="pt-8 border-t border-border-light dark:border-border-dark space-y-6">
                                    <h4 className="text-[11px] font-bold uppercase tracking-widest text-slate-900 dark:text-slate-200">Notes & Feedback</h4>

                                    <form onSubmit={handleAddComment} className="relative">
                                        <textarea
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            placeholder="Add a note or feedback..."
                                            className="w-full bg-gray-50 dark:bg-slate-800/50 border border-border-light dark:border-border-dark rounded-xl px-4 py-3 text-sm text-slate-950 dark:text-white font-medium focus:outline-none focus:border-primary transition-all resize-none min-h-[80px]"
                                        />
                                        <button
                                            type="submit"
                                            disabled={!newComment.trim()}
                                            className="absolute bottom-3 right-3 p-2 bg-primary text-slate-900 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-all active:scale-95"
                                        >
                                            <span className="material-symbols-outlined font-bold text-sm">send</span>
                                        </button>
                                    </form>

                                    <div className="space-y-4">
                                        {selectedTask.comments && selectedTask.comments.length > 0 ? (
                                            [...selectedTask.comments].reverse().map((comment) => (
                                                <div key={comment.id} className="bg-gray-50 dark:bg-slate-800/30 rounded-xl p-4 border border-border-light/50 dark:border-border-dark/30">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center gap-2">
                                                            {comment.authorAvatar ? (
                                                                <img src={comment.authorAvatar} alt={comment.author} className="size-5 rounded-full object-cover" />
                                                            ) : (
                                                                <div className="size-5 rounded-full bg-primary/20 flex items-center justify-center text-[8px] font-bold text-slate-900 dark:text-primary">
                                                                    {comment.author[0]}
                                                                </div>
                                                            )}
                                                            <span className="text-xs font-bold text-slate-950 dark:text-white">{comment.author}</span>
                                                        </div>
                                                        <span className="text-[10px] text-slate-500 font-medium">
                                                            {format(parseISO(comment.timestamp), 'MMM d, h:mm a')}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                                                        {comment.text}
                                                    </p>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-4 opacity-40">
                                                <p className="text-xs font-medium italic">No notes yet</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6 pt-8 border-t border-border-light dark:border-border-dark">
                                    <div>
                                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">Assigned to</label>
                                        <div className="mt-2 text-slate-950 dark:text-white transition-colors">
                                            <div className="relative">
                                                <select
                                                    value={selectedTask.designerId}
                                                    disabled={role === 'Designer'}
                                                    onChange={(e) => {
                                                        const newDesignerId = e.target.value;
                                                        updateTask({ ...selectedTask, designerId: newDesignerId });
                                                        setEditForm(prev => ({ ...prev, designerId: newDesignerId }));
                                                    }}
                                                    className={cn(
                                                        "w-full pl-10 pr-8 py-2.5 bg-gray-50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 border border-border-light dark:border-border-dark rounded-xl text-slate-950 dark:text-white text-sm font-bold focus:outline-none transition-all appearance-none cursor-pointer",
                                                        role === 'Designer' && "opacity-50 cursor-not-allowed"
                                                    )}
                                                >
                                                    {designers.map(d => (
                                                        <option key={d.id} value={d.id}>{d.name}</option>
                                                    ))}
                                                </select>
                                                <div className="absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none">
                                                    {(() => {
                                                        const d = designers.find(des => des.id === selectedTask.designerId);
                                                        return d?.avatar ? (
                                                            <div className="size-5 rounded-full bg-cover bg-center" style={{ backgroundImage: `url("${d.avatar}")` }}></div>
                                                        ) : (
                                                            <div className="size-5 rounded-full bg-primary/20 flex items-center justify-center text-slate-950 dark:text-primary text-[10px] font-bold">
                                                                {d?.name?.[0] || 'D'}
                                                            </div>
                                                        );
                                                    })()}
                                                </div>
                                                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-900">
                                                    <span className="material-symbols-outlined text-sm">expand_more</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">Assigned By</label>
                                        <div className="mt-2">
                                            <div className="relative">
                                                <select
                                                    value={selectedTask.assignedBy || ''}
                                                    disabled={role === 'Designer'}
                                                    onChange={(e) => {
                                                        const newAssignedBy = e.target.value;
                                                        updateTask({
                                                            ...selectedTask,
                                                            assignedBy: newAssignedBy,
                                                            assignedByAvatar: null
                                                        });
                                                    }}
                                                    className={cn(
                                                        "w-full pl-10 pr-8 py-2.5 bg-gray-50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 border border-border-light dark:border-border-dark rounded-xl text-slate-950 dark:text-white text-sm font-bold focus:outline-none transition-all appearance-none cursor-pointer",
                                                        role === 'Designer' && "opacity-50 cursor-not-allowed"
                                                    )}
                                                >
                                                    <option value="" disabled>Select...</option>
                                                    {ASSIGNERS.map(name => (
                                                        <option key={name} value={name}>{name}</option>
                                                    ))}
                                                </select>
                                                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                                    {selectedTask.assignedByAvatar ? (
                                                        <div className="size-5 rounded-full bg-cover bg-center" style={{ backgroundImage: `url("${selectedTask.assignedByAvatar}")` }}></div>
                                                    ) : (
                                                        <div className="size-5 rounded-full bg-gray-200 dark:bg-slate-700 border border-border-light dark:border-border-dark flex items-center justify-center text-[10px] font-bold text-slate-900 dark:text-slate-200">
                                                            {selectedTask.assignedBy?.[0] || '?'}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-900">
                                                    <span className="material-symbols-outlined text-sm">expand_more</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-1 block">Brand</label>
                                        <div className="mt-1">
                                            <div className="relative">
                                                <select
                                                    value={selectedTask.brand || ''}
                                                    onChange={(e) => {
                                                        const newBrand = e.target.value;
                                                        updateTask({ ...selectedTask, brand: newBrand });
                                                        setEditForm(prev => ({ ...prev, brand: newBrand }));
                                                    }}
                                                    className="w-full pl-3 pr-8 py-2.5 bg-gray-50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 border border-border-light dark:border-border-dark rounded-xl text-slate-950 dark:text-white text-sm font-bold focus:outline-none transition-all appearance-none cursor-pointer"
                                                >
                                                    <option value="">None</option>
                                                    {brands.map(b => (
                                                        <option key={b.id} value={b.name}>{b.name}</option>
                                                    ))}
                                                </select>
                                                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-900 dark:text-slate-200">
                                                    <span className="material-symbols-outlined text-sm">expand_more</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-1 block">Type</label>
                                        <div className="mt-1">
                                            <div className="relative">
                                                <select
                                                    value={selectedTask.creativeType || ''}
                                                    onChange={(e) => {
                                                        const newType = e.target.value;
                                                        updateTask({ ...selectedTask, creativeType: newType });
                                                        setEditForm(prev => ({ ...prev, creativeType: newType }));
                                                    }}
                                                    className="w-full pl-3 pr-8 py-2.5 bg-gray-50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 border border-border-light dark:border-border-dark rounded-xl text-slate-950 dark:text-white text-sm font-bold focus:outline-none transition-all appearance-none cursor-pointer"
                                                >
                                                    <option value="">None</option>
                                                    {creativeTypes.map(t => (
                                                        <option key={t.id} value={t.name}>{t.name}</option>
                                                    ))}
                                                </select>
                                                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-900 dark:text-slate-200">
                                                    <span className="material-symbols-outlined text-sm">expand_more</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-1 block">Scope</label>
                                        <div className="mt-1">
                                            <div className="relative">
                                                <select
                                                    value={selectedTask.scope || ''}
                                                    onChange={(e) => {
                                                        const newScope = e.target.value;
                                                        updateTask({ ...selectedTask, scope: newScope });
                                                        setEditForm(prev => ({ ...prev, scope: newScope }));
                                                    }}
                                                    className="w-full pl-3 pr-8 py-2.5 bg-gray-50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 border border-border-light dark:border-border-dark rounded-xl text-slate-950 dark:text-white text-sm font-bold focus:outline-none transition-all appearance-none cursor-pointer"
                                                >
                                                    <option value="">None</option>
                                                    {scopes.map(s => (
                                                        <option key={s.id} value={s.name}>{s.name}</option>
                                                    ))}
                                                </select>
                                                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-900 dark:text-slate-200">
                                                    <span className="material-symbols-outlined text-sm">expand_more</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-1 block">Due Date</label>
                                        <div className="mt-1 flex items-center gap-2 px-3 py-2.5 bg-gray-50 dark:bg-slate-800/50 border border-border-light dark:border-border-dark rounded-xl">
                                            <span className="material-symbols-outlined text-slate-900 dark:text-slate-200 text-sm">calendar_today</span>
                                            <span className="text-slate-950 dark:text-white text-sm font-bold uppercase tracking-widest">{selectedTask.date}</span>
                                        </div>
                                    </div>
                                    {selectedTask.updatedAt && (
                                        <div className="col-span-2">
                                            <label className="text-xs text-slate-900">Last updated</label>
                                            <p className="text-xs text-slate-950 mt-0.5">{formatDate(selectedTask.updatedAt)}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="p-4 border-t border-border-light dark:border-border-dark bg-gray-50/50 dark:bg-background-dark/50 text-center text-xs text-slate-900 dark:text-slate-200 opacity-60">
                                Task ID: {selectedTask.id} | Mode: {role}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
