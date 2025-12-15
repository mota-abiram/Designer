import { useEffect } from 'react';
import { useTaskContext } from '../../context/TaskContext';
import { weekDates } from '../../services/mockData';
import { TaskCard } from './TaskCard';
import { format, parseISO, isSameDay, isWithinInterval, isPast, endOfDay } from 'date-fns';
import { cn } from '../../utils/cn';

export const TaskGrid = () => {
    const { tasks, activeDesignerId, registerScrollContainer, setAddTaskOpen, setNewTaskDefaults, filters, lastAddedTaskId, role } = useTaskContext();

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

    const today = new Date();

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

                                    return (
                                        <th
                                            key={dateStr}
                                            id={isToday ? 'column-today' : undefined}
                                            className={cn(
                                                "sticky top-0 z-10 text-left align-bottom pb-4 w-[320px]",
                                                index === 0 ? "pr-4 pl-0" : "px-4",
                                                isToday ? "bg-surface-dark/50 rounded-t-xl border-x border-t border-primary/20" : "bg-background-dark"
                                            )}
                                        >
                                            <div className={cn(
                                                "flex flex-col border-l-4 pl-3 py-1",
                                                isToday ? "border-primary" : "border-transparent"
                                            )}>
                                                <span className={cn(
                                                    "text-xs uppercase font-semibold tracking-wider flex items-center gap-1",
                                                    isToday ? "text-primary font-bold" : "text-[#92adc9]"
                                                )}>
                                                    {format(date, 'EEEE')}
                                                    {isToday && <span className="bg-primary text-white text-[10px] px-1.5 rounded-sm ml-1">Today</span>}
                                                </span>
                                                <span className="text-white text-lg font-bold">{format(date, 'MMM d')}</span>
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
                                    const isToday = isSameDay(date, today);
                                    const isPastDate = isPast(endOfDay(date));
                                    const canAdd = role === 'Manager' || !isPastDate;

                                    return (
                                        <td
                                            key={dateStr}
                                            className={cn(
                                                "align-top p-2",
                                                isToday ? "bg-surface-dark/30 border-x border-primary/20" : "border-r border-dashed border-border-dark/50"
                                            )}
                                        >
                                            {tasksForDate.map(task => (
                                                <div id={`task-${task.id}`} key={task.id}>
                                                    <TaskCard task={task} />
                                                </div>
                                            ))}
                                            {canAdd && (
                                                <button
                                                    onClick={() => handleAddTask(dateStr)}
                                                    className="w-full border border-dashed border-border-dark rounded-lg p-2 flex items-center justify-center gap-2 text-[#92adc9] hover:text-white hover:border-primary hover:bg-primary/5 transition-all group/add"
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
