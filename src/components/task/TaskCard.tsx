import type { Task } from '../../types';
import { cn } from '../../utils/cn';
import { useTaskContext } from '../../context/TaskContext';

import { ASSIGNERS } from '../../constants/assigners';

export const TaskCard = ({ task }: { task: Task }) => {
    const { setSelectedTask, viewMode, updateTask } = useTaskContext();

    const statusColors = {
        Pending: {
            border: 'border-red-500',
            badge: 'bg-red-500/10 text-red-500 border-red-500/20',
            dot: 'bg-red-500',
            icon: null
        },
        'Pending Approval': {
            border: 'border-blue-500',
            badge: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
            dot: 'bg-blue-500',
            icon: 'hourglass_empty'
        },
        Approved: {
            border: 'border-green-500',
            badge: 'bg-green-500/10 text-green-500 border-green-500/20',
            dot: 'bg-green-500',
            icon: 'check_circle'
        },
        Rework: {
            border: 'border-amber-500',
            badge: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
            dot: 'bg-amber-500',
            icon: 'refresh'
        }
    };

    const currentStyle = statusColors[task.status];
    const isCompact = viewMode === 'compact';

    const handleAssignByChange = (newValue: string) => {
        updateTask({
            ...task,
            assignedBy: newValue,
            assignedByAvatar: null // Clear avatar when manually changing name
        });
    };

    return (
        <div
            onClick={() => setSelectedTask(task)}
            className={cn(
                "group relative flex flex-col rounded-xl bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark border-l-4 hover:shadow-lg transition-all cursor-pointer mb-2",
                currentStyle.border,
                isCompact ? "p-2 gap-1" : "p-4 gap-2 mb-3"
            )}
        >
            <div className="flex flex-col gap-1">
                <div className="flex justify-between items-start gap-2">
                    <h3 className={cn("font-bold text-slate-950 dark:text-white leading-snug break-words", isCompact ? "text-xs" : "text-sm pr-2")}>{task.title}</h3>
                </div>
                {!isCompact && (
                    <p className="text-xs text-slate-900 dark:text-slate-200 leading-relaxed line-clamp-3">
                        {task.description.split(/(https?:\/\/[^\s]+)/g).map((part, i) => (
                            part.match(/(https?:\/\/[^\s]+)/g) ? (
                                <a
                                    key={i}
                                    href={part}
                                    target="_blank"
                                    rel="noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="text-slate-950 dark:text-white underline relative z-10 font-bold"
                                >
                                    {part}
                                </a>
                            ) : part
                        ))}
                    </p>
                )}
                {!isCompact && (task.brand || task.creativeType || task.scope) && (
                    <div className="flex flex-wrap gap-1 mt-1">
                        {task.brand && (
                            <span className="px-2 py-0.5 bg-primary text-slate-900 border border-primary/20 rounded text-[11px] font-bold uppercase tracking-wide shadow-sm">
                                {task.brand}
                            </span>
                        )}
                        {task.creativeType && (
                            <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 border border-border-light dark:border-border-dark rounded text-[11px] font-bold uppercase tracking-wide">
                                {task.creativeType}
                            </span>
                        )}
                        {task.scope && (
                            <span className="px-1.5 py-0.5 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800 rounded text-[11px] font-bold uppercase tracking-wide">
                                {task.scope}
                            </span>
                        )}
                        {(task.reworkCount || 0) > 0 && (
                            <span className="px-1.5 py-0.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 rounded text-[11px] font-bold uppercase tracking-wide flex items-center gap-1">
                                <span className="material-symbols-outlined text-[11px]">refresh</span>
                                {task.reworkCount} Rework{task.reworkCount! > 1 ? 's' : ''}
                            </span>
                        )}
                    </div>
                )}
            </div>

            <div className={cn("flex items-center justify-between transition-colors", !isCompact && "mt-2 pt-2 border-t border-border-light dark:border-border-dark")}>
                {isCompact ? (
                    <div className="flex items-center gap-2 w-full justify-between mt-1">
                        <span className={cn("inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold border", currentStyle.badge)}>
                            {task.status}
                        </span>
                        {task.assignedBy && (
                            <div className="relative size-4 rounded-full bg-cover bg-center border border-border-light dark:border-border-dark"
                                style={task.assignedByAvatar ? { backgroundImage: `url("${task.assignedByAvatar}")` } : { backgroundColor: '#e2e8f0' }}
                                title={`Assigned by: ${task.assignedBy}`}
                            >
                                {!task.assignedByAvatar && <span className="flex items-center justify-center w-full h-full text-[8px] font-bold text-slate-900">{task.assignedBy[0]}</span>}
                                <select
                                    value={task.assignedBy || ''}
                                    onChange={(e) => handleAssignByChange(e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    title={`Assigned by: ${task.assignedBy || 'Unknown'} (Click to change)`}
                                >
                                    <option value="" disabled>Select</option>
                                    {ASSIGNERS.map(name => (
                                        <option key={name} value={name}>{name}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                ) : (
                    <>
                        <span className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wide border", currentStyle.badge)}>
                            {currentStyle.dot && <span className={cn("size-1.5 rounded-full", currentStyle.dot)}></span>}
                            {currentStyle.icon && <span className="material-symbols-outlined text-[14px]">{currentStyle.icon}</span>}
                            {task.status}
                        </span>
                        {task.assignedBy && (
                            <div className="relative size-6 rounded-full bg-cover bg-center border border-border-light dark:border-border-dark transition-colors"
                                style={task.assignedByAvatar ? { backgroundImage: `url("${task.assignedByAvatar}")` } : { backgroundColor: '#e2e8f0' }}
                                title={`Assigned by: ${task.assignedBy}`}
                            >
                                {!task.assignedByAvatar && <span className="flex items-center justify-center w-full h-full text-[10px] font-bold text-slate-900">{task.assignedBy[0]}</span>}
                                <select
                                    value={task.assignedBy || ''}
                                    onChange={(e) => handleAssignByChange(e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    title={`Assigned by: ${task.assignedBy || 'Unknown'} (Click to change)`}
                                >
                                    <option value="" disabled>Select</option>
                                    {ASSIGNERS.map(name => (
                                        <option key={name} value={name}>{name}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};
