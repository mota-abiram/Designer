import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTaskContext } from '../../context/TaskContext';
import { TaskCard } from './TaskCard';
import { cn } from '../../utils/cn';
import { isPast, endOfDay, parseISO } from 'date-fns';
import type { Task } from '../../types';
import { ASSIGNERS } from '../../constants/assigners';

interface TaskColumnProps {
    dateStr: string;
    today: Date;
    selectedDateStr: string;
    setSelectedDateStr: (d: string) => void;
    tasksForDate: Task[];
    isAddingTo: string | null;
    setIsAddingTo: (d: string | null) => void;
}

export const TaskColumn = ({
    dateStr,
    selectedDateStr,
    setSelectedDateStr,
    tasksForDate,
    isAddingTo,
    setIsAddingTo,
}: TaskColumnProps) => {
    const { tasks, role, updateTask, addTask, activeDesignerId, brands, creativeTypes, scopes } = useTaskContext();
    const { user } = useAuth();
    const [inlineAssignedBy, setInlineAssignedBy] = useState(ASSIGNERS[0]);
    const [inlineTitle, setInlineTitle] = useState('');
    const [inlineDesc, setInlineDesc] = useState('');
    const [inlineBrand, setInlineBrand] = useState('');
    const [inlineCreativeType, setInlineCreativeType] = useState('');
    const [inlineScope, setInlineScope] = useState('');

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
                id: taskId,
                date: targetDate
            });
        }
    };

    const handleInlineSubmit = () => {
        if (!inlineTitle.trim()) return;

        const newTask: Task = {
            id: `t${Date.now()}`,
            title: inlineTitle.trim(),
            description: inlineDesc.trim(),
            link: '',
            status: 'Pending',
            date: dateStr,
            designerId: activeDesignerId,
            brand: inlineBrand,
            creativeType: inlineCreativeType,
            scope: inlineScope,
            assignedBy: inlineAssignedBy,
            assignedByAvatar: user?.displayName === inlineAssignedBy ? (user?.photoURL || null) : null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        addTask(newTask);
        resetInlineForm();
    };

    const resetInlineForm = () => {
        setIsAddingTo(null);
        setInlineTitle('');
        setInlineDesc('');
        setInlineAssignedBy(ASSIGNERS[0]);
        setInlineBrand('');
        setInlineCreativeType('');
        setInlineScope('');
    };

    const onTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            document.getElementById(`inline-desc-${dateStr}`)?.focus();
        } else if (e.key === 'Escape') {
            resetInlineForm();
        }
    };

    const onDescKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleInlineSubmit();
        } else if (e.key === 'Escape') {
            resetInlineForm();
        }
    };

    return (
        <div
            onClick={() => setSelectedDateStr(dateStr)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, dateStr)}
            className={cn(
                "min-h-[500px] transition-colors",
                isSelected ? "bg-surface-dark/5 dark:bg-surface-light/5" : "hover:bg-surface-dark/5 dark:hover:bg-surface-light/5"
            )}
        >
            <div className="p-2 space-y-3">
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
                    <div className="flex flex-col items-center justify-center p-8 text-center opacity-30 pointer-events-none">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">No tasks</span>
                    </div>
                )}
                {canAdd && (
                    <div className="mt-2 group/add">
                        {isAddingTo === dateStr ? (
                            <div className="bg-surface-light dark:bg-surface-dark border border-primary/50 rounded-xl p-4 shadow-2xl space-y-3 animate-in fade-in zoom-in-95 duration-200 transition-colors">
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="Task Title"
                                    className="w-full text-sm font-bold text-slate-950 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none bg-transparent"
                                    id={`inline-title-${dateStr}`}
                                    value={inlineTitle}
                                    onChange={(e) => setInlineTitle(e.target.value)}
                                    onKeyDown={onTitleKeyDown}
                                />
                                <textarea
                                    rows={2}
                                    placeholder="Add description..."
                                    className="w-full text-xs text-slate-950 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none resize-none bg-gray-50 dark:bg-slate-800/50 rounded-lg p-2.5 transition-colors"
                                    id={`inline-desc-${dateStr}`}
                                    value={inlineDesc}
                                    onChange={(e) => setInlineDesc(e.target.value)}
                                    onKeyDown={onDescKeyDown}
                                ></textarea>

                                <div className="space-y-3 pt-1 border-t border-border-light dark:border-border-dark">
                                    <div className="flex items-center gap-3">
                                        <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-tighter w-20">Assigner</label>
                                        <select
                                            value={inlineAssignedBy}
                                            onChange={(e) => setInlineAssignedBy(e.target.value)}
                                            className="flex-1 text-[11px] font-bold text-slate-950 dark:text-white bg-gray-50 dark:bg-slate-800 border border-border-light dark:border-border-dark rounded-md px-2 py-1.5 outline-none focus:border-primary cursor-pointer transition-colors"
                                        >
                                            {ASSIGNERS.map(name => (
                                                <option key={name} value={name}>{name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-tighter">Brand</label>
                                            <select
                                                value={inlineBrand}
                                                onChange={(e) => setInlineBrand(e.target.value)}
                                                className="w-full text-[11px] font-bold text-slate-950 dark:text-white bg-gray-50 dark:bg-slate-800 border border-border-light dark:border-border-dark rounded-md px-2 py-1.5 outline-none focus:border-primary cursor-pointer transition-colors"
                                            >
                                                <option value="">None</option>
                                                {brands.map(b => (
                                                    <option key={b.id} value={b.name}>{b.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-tighter">Type</label>
                                            <select
                                                value={inlineCreativeType}
                                                onChange={(e) => setInlineCreativeType(e.target.value)}
                                                className="w-full text-[11px] font-bold text-slate-950 dark:text-white bg-gray-50 dark:bg-slate-800 border border-border-light dark:border-border-dark rounded-md px-2 py-1.5 outline-none focus:border-primary cursor-pointer transition-colors"
                                            >
                                                <option value="">None</option>
                                                {creativeTypes.map(t => (
                                                    <option key={t.id} value={t.name}>{t.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-tighter">Scope</label>
                                        <select
                                            value={inlineScope}
                                            onChange={(e) => setInlineScope(e.target.value)}
                                            className="w-full text-[11px] font-bold text-slate-950 dark:text-white bg-gray-50 dark:bg-slate-800 border border-border-light dark:border-border-dark rounded-md px-2 py-1.5 outline-none focus:border-primary cursor-pointer transition-colors"
                                        >
                                            <option value="">None</option>
                                            {scopes.map(s => (
                                                <option key={s.id} value={s.name}>{s.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-2">
                                    <button
                                        onClick={handleInlineSubmit}
                                        className="flex-1 bg-primary hover:bg-primary-hover text-slate-950 text-xs font-black uppercase tracking-widest py-2.5 rounded-lg transition-all shadow-lg active:scale-95"
                                    >
                                        Create Task
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setIsAddingTo(null);
                                        }}
                                        className="px-4 text-slate-500 hover:text-red-500 text-[10px] font-bold uppercase tracking-widest transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsAddingTo(dateStr);
                                }}
                                className="w-full py-3 border-2 border-dashed border-border-light dark:border-border-dark/30 rounded-xl text-slate-400 hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all text-[11px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 group/btn"
                            >
                                <span className="text-xl transition-transform group-hover/btn:scale-125">+</span>
                                Add Task
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
