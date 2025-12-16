import { useState, useEffect } from 'react';
import { useTaskContext } from '../../context/TaskContext';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../common/Modal';
import type { Task } from '../../types';
import { format } from 'date-fns';

export const AddTaskModal = () => {
    const { isAddTaskOpen, setAddTaskOpen, newTaskDefaults, addTask, activeDesignerId } = useTaskContext();
    const { user } = useAuth();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [link, setLink] = useState('');
    const [date, setDate] = useState('');

    useEffect(() => {
        if (isAddTaskOpen) {
            // Reset and apply defaults
            setTitle('');
            setDescription('');
            setLink('');
            setDate(newTaskDefaults?.date || format(new Date(), 'yyyy-MM-dd'));
        }
    }, [isAddTaskOpen, newTaskDefaults]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newTask: Task = {
            id: `t${Date.now()}`,
            title,
            description,
            link,
            status: 'Pending',
            date,
            designerId: activeDesignerId,
            requestorAvatar: user?.photoURL || undefined,
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
                    <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">External Link</label>
                    <input
                        type="text"
                        value={link}
                        onChange={(e) => setLink(e.target.value)}
                        placeholder="e.g. figma.com/..."
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
                        disabled={!title || !link || !date}
                        className="px-4 py-2 text-sm font-bold bg-primary text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Create Task
                    </button>
                </div>
            </form>
        </Modal>
    );
};
