import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTaskContext } from '../../context/TaskContext';
import { TaskCard } from './TaskCard';
import { cn } from '../../utils/cn';
import { isPast, endOfDay, parseISO } from 'date-fns';
import type { Task } from '../../types';

interface TaskColumnProps {
    dateStr: string;
    today: Date;
    selectedDateStr: string;
    setSelectedDateStr: (d: string) => void;
    tasksForDate: Task[];
    isAddingTo: string | null;
    setIsAddingTo: (d: string | null) => void;

    // Global context stuff passed down or used from context?
    // Let's use context hooks inside here to avoid prop drilling if possible, 
    // BUT we need 'tasks' to be filtered. Parent does filtering. So props for data.
    // updateTask and addTask are from context.
}

export const TaskColumn = ({
    dateStr,
    selectedDateStr,
    setSelectedDateStr,
    tasksForDate,
    isAddingTo,
    setIsAddingTo,
}: TaskColumnProps) => {
    const { tasks, role, updateTask, addTask, activeDesignerId } = useTaskContext();
    const { user } = useAuth();

    const date = parseISO(dateStr);
    const isPastDate = isPast(endOfDay(date));
    const canAdd = role === 'Manager' || !isPastDate;
    const isSelected = dateStr === selectedDateStr;

    const handleDragStart = (e: React.DragEvent, taskId: string) => {
        e.dataTransfer.setData('taskId', taskId);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = async (e: React.DragEvent, targetDate: string) => {
        e.preventDefault();
        const taskId = e.dataTransfer.getData('taskId');
        const task = tasks.find(t => t.id === taskId);

        if (task && task.date !== targetDate) {
            updateTask({
                ...task,
                date: targetDate
            });
        }
    };

    const handleInlineSubmit = (title: string, description: string) => {
        const newTask: any = {
            id: `t${Date.now()}`,
            title,
            description,
            link: '',
            status: 'Pending',
            date: dateStr,
            designerId: activeDesignerId,
            assignedBy: user?.displayName || 'Unknown',
            assignedByAvatar: user?.photoURL || undefined,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        addTask(newTask);
        setIsAddingTo(null);
    };

    // Derived logic for inline inputs
    const onTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            document.getElementById(`inline-desc-${dateStr}`)?.focus();
        } else if (e.key === 'Escape') {
            setIsAddingTo(null);
        }
    };

    const onDescKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            const titleEl = document.getElementById(`inline-title-${dateStr}`) as HTMLInputElement;
            const descEl = document.getElementById(`inline-desc-${dateStr}`) as HTMLTextAreaElement;
            if (titleEl?.value.trim()) {
                handleInlineSubmit(titleEl.value.trim(), descEl?.value.trim() || '');
            }
        } else if (e.key === 'Escape') {
            setIsAddingTo(null);
        }
    };

    const onAddClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        const titleEl = document.getElementById(`inline-title-${dateStr}`) as HTMLInputElement;
        const descEl = document.getElementById(`inline-desc-${dateStr}`) as HTMLTextAreaElement;
        if (titleEl?.value.trim()) {
            handleInlineSubmit(titleEl.value.trim(), descEl?.value.trim() || '');
        }
    };

    const onCancelClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsAddingTo(null);
    };

    return (
        <td
            onClick={() => setSelectedDateStr(dateStr)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, dateStr)}
            className={cn(
                "align-top p-2 transition-colors",
                isSelected ? "bg-surface-dark/30 border-x border-primary/20" : "border-r border-dashed border-border-dark/50 hover:bg-surface-dark/10"
            )}
        >
            {tasksForDate.length > 0 ? (
                tasksForDate.map(task => (
                    <div
                        id={`task-${task.id}`}
                        key={task.id}
                        draggable={true}
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        className="cursor-grab active:cursor-grabbing"
                    >
                        <TaskCard task={task} />
                    </div>
                ))
            ) : (
                <div className="flex flex-col items-center justify-center p-6 text-center opacity-40 pointer-events-none">
                    <span className="text-xs font-medium text-text-muted">No tasks</span>
                </div>
            )}
            {canAdd && (
                <div className="mt-2">
                    {isAddingTo === dateStr ? (
                        <div className="bg-white border border-primary rounded-lg p-3 shadow-lg space-y-2 animate-in fade-in zoom-in-95 duration-200">
                            <input
                                autoFocus
                                type="text"
                                placeholder="Task Title"
                                className="w-full text-sm font-bold text-text-main placeholder-gray-400 outline-none"
                                id={`inline-title-${dateStr}`}
                                onKeyDown={onTitleKeyDown}
                            />
                            <textarea
                                rows={2}
                                placeholder="Description (optional)"
                                className="w-full text-xs text-text-main placeholder-gray-400 outline-none resize-none bg-gray-50 rounded p-1.5"
                                id={`inline-desc-${dateStr}`}
                                onKeyDown={onDescKeyDown}
                            ></textarea>
                            <div className="flex justify-end gap-2 pt-1">
                                <button
                                    onClick={onCancelClick}
                                    className="px-2 py-1 text-xs font-bold text-text-muted hover:text-text-main hover:bg-gray-100 rounded"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={onAddClick}
                                    className="px-2 py-1 text-xs font-bold bg-primary text-white rounded hover:bg-blue-600 shadow-sm"
                                >
                                    Add
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsAddingTo(dateStr);
                            }}
                            className="w-full border border-dashed border-border-dark rounded-lg p-2 flex items-center justify-center gap-2 text-text-muted hover:text-text-main hover:border-primary hover:bg-primary/5 transition-all group/add"
                        >
                            <span className="material-symbols-outlined text-lg group-hover/add:scale-110 transition-transform">add</span>
                            <span className="text-xs font-medium">Add task</span>
                        </button>
                    )}
                </div>
            )}
            <div className="h-16"></div>
        </td>
    );
};
