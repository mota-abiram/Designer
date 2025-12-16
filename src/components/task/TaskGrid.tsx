import { useEffect, useState } from 'react';
import { useTaskContext } from '../../context/TaskContext';
import { weekDates } from '../../services/mockData';
import { TaskCard } from './TaskCard';
import { format, parseISO, isSameDay, isWithinInterval, isPast, endOfDay } from 'date-fns';
import { cn } from '../../utils/cn';

export const TaskGrid = () => {
    const { tasks, activeDesignerId, registerScrollContainer, setAddTaskOpen, setNewTaskDefaults, filters, lastAddedTaskId, role, updateTask } = useTaskContext();

    // Default to today, or find today in weekDates if possible
    const today = new Date();
    const [selectedDateStr, setSelectedDateStr] = useState<string>(
        weekDates.find(d => isSameDay(parseISO(d), today)) || weekDates[0]
    );

    // Scroll to new task
    useEffect(() => {
        if (lastAddedTaskId) {
            const el = document.getElementById(`task-${lastAddedTaskId}`);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
            }
        }
    }, [lastAddedTaskId, tasks]);


    const filteredTasks = tasks.filter(t => {
        // Designer Filter
        if (t.designerId !== activeDesignerId) return false;

        // Status Filter
        if (filters.status.length > 0 && !filters.status.includes(t.status)) return false;

        // Date Range Filter
        if (filters.dateRange.start && filters.dateRange.end) {
            const taskDate = parseISO(t.date);
            const start = parseISO(filters.dateRange.start);
            const end = parseISO(filters.dateRange.end);
            if (!isWithinInterval(taskDate, { start, end })) return false;
        }

        return true;
    });

    const getTasksForDate = (dateStr: string) => {
        return filteredTasks.filter(t => t.date === dateStr);
    };

    const handleAddTask = (dateStr: string) => {
        setNewTaskDefaults({ date: dateStr });
        setAddTaskOpen(true);
    };

    return (
        <div className="flex-1 relative overflow-hidden bg-background-dark">
            <div
                ref={registerScrollContainer}
                className="absolute inset-0 overflow-auto custom-scrollbar"
            >
                <div className="min-w-max p-6">
                    <table className="border-collapse w-full">
                        <thead>
                            <tr>
                                {weekDates.map((dateStr, index) => {
                                    const date = parseISO(dateStr);
                                    const isToday = isSameDay(date, today);
                                    const isSelected = dateStr === selectedDateStr;

                                    return (
                                        <th
                                            key={dateStr}
                                            id={isToday ? 'column-today' : undefined}
                                            onClick={() => setSelectedDateStr(dateStr)}
                                            className={cn(
                                                "sticky top-0 z-10 text-left align-bottom pb-4 w-[320px] cursor-pointer transition-colors group/header",
                                                index === 0 ? "pr-4 pl-0" : "px-4",
                                                isSelected ? "bg-surface-dark/50 rounded-t-xl border-x border-t border-primary/20" : "bg-background-dark hover:bg-surface-dark/20"
                                            )}
                                        >
                                            <div className={cn(
                                                "flex flex-col border-l-4 pl-3 py-1 transition-colors",
                                                isSelected ? "border-primary" : "border-transparent group-hover/header:border-primary/30"
                                            )}>
                                                <span className={cn(
                                                    "text-xs uppercase font-semibold tracking-wider flex items-center gap-1",
                                                    isSelected ? "text-primary font-bold" : "text-text-muted"
                                                )}>
                                                    {format(date, 'EEEE')}
                                                    {isToday && <span className={cn("text-white text-[10px] px-1.5 rounded-sm ml-1 transition-colors", isSelected ? "bg-primary" : "bg-text-muted")}>Today</span>}
                                                </span>
                                                <span className={cn("text-lg font-bold transition-colors", isSelected ? "text-text-main" : "text-text-muted")}>{format(date, 'MMM d')}</span>
                                            </div>
                                        </th>
                                    );
                                })}
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="group/row">
                                {weekDates.map((dateStr) => {
                                    const tasksForDate = getTasksForDate(dateStr);
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
                                            // Optional: Check permissions before move if needed
                                            // const isPastDate = isPast(endOfDay(parseISO(task.date)));
                                            // if (role !== 'Manager' && isPastDate) return; 

                                            // Update date
                                            updateTask({
                                                ...task,
                                                date: targetDate
                                            });
                                        }
                                    };

                                    return (
                                        <td
                                            key={dateStr}
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
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleAddTask(dateStr);
                                                    }}
                                                    className="w-full border border-dashed border-border-dark rounded-lg p-2 flex items-center justify-center gap-2 text-text-muted hover:text-text-main hover:border-primary hover:bg-primary/5 transition-all group/add"
                                                >
                                                    <span className="material-symbols-outlined text-lg group-hover/add:scale-110 transition-transform">add</span>
                                                    <span className="text-xs font-medium">Add task</span>
                                                </button>
                                            )}
                                            <div className="h-16"></div>
                                        </td>
                                    );
                                })}
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-background-dark to-transparent z-20"></div>
        </div>
    );
};
