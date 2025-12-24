import { useState, useEffect } from 'react';
import { useTaskContext } from '../../context/TaskContext';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../common/Modal';
import type { Task } from '../../types';
import { format } from 'date-fns';
import { ASSIGNERS } from '../../constants/assigners';

export const AddTaskModal = () => {
    const { isAddTaskOpen, setAddTaskOpen, newTaskDefaults, addTask, activeDesignerId, brands, creativeTypes, scopes } = useTaskContext();
    const { user } = useAuth();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState('');
    const [assignedBy, setAssignedBy] = useState(ASSIGNERS[0]);
    const [brand, setBrand] = useState('');
    const [creativeType, setCreativeType] = useState('');
    const [scope, setScope] = useState('');

    useEffect(() => {
        if (isAddTaskOpen) {
            // Reset and apply defaults
            setTitle('');
            setDescription('');
            setDate(newTaskDefaults?.date || format(new Date(), 'yyyy-MM-dd'));
            setAssignedBy(ASSIGNERS[0]);
            setBrand('');
            setCreativeType('');
            setScope('');
        }
    }, [isAddTaskOpen, newTaskDefaults]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newTask: Task = {
            id: `t${Date.now()}`,
            title,
            description,
            link: '', // Explicit empty string as we removed the field
            status: 'Pending',
            date,
            designerId: activeDesignerId,
            brand,
            creativeType,
            scope,
            assignedBy: assignedBy,
            assignedByAvatar: user?.displayName === assignedBy ? user?.photoURL || undefined : undefined,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        addTask(newTask);
        setAddTaskOpen(false);
    };

    return (
        <Modal
            isOpen={isAddTaskOpen}
            onClose={() => setAddTaskOpen(false)}
            title="Create New Task"
        >
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                    <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">Task Title</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Homepage Redesign"
                        required
                        className="w-full bg-surface-dark border border-border-dark rounded-lg px-3 py-2 text-text-main placeholder-gray-400 focus:outline-none focus:border-primary transition-colors"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">Due Date</label>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                        className="w-full bg-surface-dark border border-border-dark rounded-lg px-3 py-2 text-text-main placeholder-gray-400 focus:outline-none focus:border-primary transition-colors [color-scheme:light]"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">Assigned By</label>
                    <div className="relative">
                        <select
                            value={assignedBy}
                            onChange={(e) => setAssignedBy(e.target.value)}
                            className="w-full bg-surface-dark border border-border-dark rounded-lg px-3 py-2 pr-8 text-text-main focus:outline-none focus:border-primary transition-colors appearance-none cursor-pointer"
                        >
                            {ASSIGNERS.map((name) => (
                                <option key={name} value={name}>{name}</option>
                            ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
                            <span className="material-symbols-outlined text-sm">expand_more</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">Brand</label>
                        <div className="relative">
                            <select
                                value={brand}
                                onChange={(e) => setBrand(e.target.value)}
                                className="w-full bg-surface-dark border border-border-dark rounded-lg px-3 py-2 pr-8 text-text-main focus:outline-none focus:border-primary transition-colors appearance-none cursor-pointer"
                            >
                                <option value="">Select Brand</option>
                                {brands.map((b) => (
                                    <option key={b.id} value={b.name}>{b.name}</option>
                                ))}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
                                <span className="material-symbols-outlined text-sm">expand_more</span>
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">Type</label>
                        <div className="relative">
                            <select
                                value={creativeType}
                                onChange={(e) => setCreativeType(e.target.value)}
                                className="w-full bg-surface-dark border border-border-dark rounded-lg px-3 py-2 pr-8 text-text-main focus:outline-none focus:border-primary transition-colors appearance-none cursor-pointer"
                            >
                                <option value="">Select Type</option>
                                {creativeTypes.map((t) => (
                                    <option key={t.id} value={t.name}>{t.name}</option>
                                ))}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
                                <span className="material-symbols-outlined text-sm">expand_more</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">Scope</label>
                    <div className="relative">
                        <select
                            value={scope}
                            onChange={(e) => setScope(e.target.value)}
                            className="w-full bg-surface-dark border border-border-dark rounded-lg px-3 py-2 pr-8 text-text-main focus:outline-none focus:border-primary transition-colors appearance-none cursor-pointer"
                        >
                            <option value="">Select Scope</option>
                            {scopes.map((s) => (
                                <option key={s.id} value={s.name}>{s.name}</option>
                            ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
                            <span className="material-symbols-outlined text-sm">expand_more</span>
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">Description</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Brief details..."
                        rows={3}
                        className="w-full bg-surface-dark border border-border-dark rounded-lg px-3 py-2 text-text-main placeholder-gray-400 focus:outline-none focus:border-primary transition-colors resize-none"
                    />
                </div>
                <div className="flex justify-end gap-3 mt-2">
                    <button
                        type="button"
                        onClick={() => setAddTaskOpen(false)}
                        className="px-4 py-2 text-sm font-bold text-text-muted hover:text-text-main transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={!title || !date}
                        className="px-4 py-2 text-sm font-bold bg-primary text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Create Task
                    </button>
                </div>
            </form>
        </Modal>
    );
};
