import { useEffect, useState, useMemo } from 'react';
import { useTaskContext } from '../../context/TaskContext';
import { getCurrentWeekDays } from '../../services/mockData';
import { format, parseISO, isSameDay, isValid } from 'date-fns';
import { cn } from '../../utils/cn';
import { TaskColumn } from './TaskColumn';
import type { Task } from '../../types';

export const TaskGrid = () => {
    const { tasks, activeDesignerId, registerScrollContainer, filters, lastAddedTaskId, isLoading, isSyncing } = useTaskContext();

    // Determine which dates to display based on filter
    const displayDates = useMemo(() => {
        if (filters.dateRange.start && filters.dateRange.end) {
            const startStr = filters.dateRange.start;
            const endStr = filters.dateRange.end;

            // Simple string comparison for standard YYYY-MM-DD format is often faster than parsing
            // Check if we need to fall back to week
            if (startStr && endStr) {
                // Return all dates in interval using simple day increment loop
                const dates: string[] = [];
                let curr = parseISO(startStr);
                const last = parseISO(endStr);

                if (isValid(curr) && isValid(last) && curr <= last) {
                    while (curr <= last) {
                        dates.push(format(curr, 'yyyy-MM-dd'));
                        curr.setDate(curr.getDate() + 1);
                    }
                    return dates;
                }
            }
        }
        return getCurrentWeekDays();
    }, [filters.dateRange]);

    // Default to today, or find today in displayed dates if possible
    const today = new Date();
    const [selectedDateStr, setSelectedDateStr] = useState<string>(
        displayDates.find(d => isSameDay(parseISO(d), today)) || displayDates[0]
    );

    // Update selected date if display dates change significantly (e.g. filter change)
    useEffect(() => {
        if (!displayDates.includes(selectedDateStr)) {
            setSelectedDateStr(displayDates[0]);
        }
    }, [displayDates, selectedDateStr]);


    const [isAddingTo, setIsAddingTo] = useState<string | null>(null);

    // Scroll to new task
    useEffect(() => {
        if (lastAddedTaskId) {
            const el = document.getElementById(`task-${lastAddedTaskId}`);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
            }
        }
    }, [lastAddedTaskId, tasks]);


    const groupedTasks = useMemo(() => {
        const result: Record<string, Task[]> = {};

        tasks.forEach(t => {
            // Designer Filter
            if (t.designerId !== activeDesignerId) return;

            // Status Filter
            if (filters.status.length > 0 && !filters.status.includes(t.status)) return;

            // Date Range Filter
            if (filters.dateRange.start && filters.dateRange.end) {
                const taskDate = t.date;
                if (taskDate < filters.dateRange.start || taskDate > filters.dateRange.end) return;
            }

            if (!result[t.date]) result[t.date] = [];
            result[t.date].push(t);
        });

        return result;
    }, [tasks, activeDesignerId, filters.status, filters.dateRange]);

    const getTasksForDate = (dateStr: string) => {
        return groupedTasks[dateStr] || [];
    };

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center bg-background-light dark:bg-background-dark">
                <div className="flex flex-col items-center gap-4">
                    <div className="size-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-500 animate-pulse">Syncing Task Board...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 relative overflow-hidden bg-background-light dark:bg-background-dark transition-colors duration-300">
            {isSyncing && (
                <div className="absolute top-4 right-8 z-50 flex items-center gap-2 px-3 py-1.5 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md rounded-full shadow-lg border border-border-light dark:border-border-dark animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="size-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">Syncing</span>
                </div>
            )}
            <div
                ref={registerScrollContainer}
                className="absolute inset-0 overflow-auto custom-scrollbar"
            >
                <div className="min-w-max p-6">
                    <table className="border-collapse w-full">
                        <thead>
                            <tr>
                                {displayDates.map((dateStr, index) => {
                                    const date = parseISO(dateStr);
                                    const isToday = isSameDay(date, today);
                                    const isSelected = dateStr === selectedDateStr;

                                    return (
                                        <th
                                            key={dateStr}
                                            scope="col"
                                            id={isToday ? 'column-today' : undefined}
                                            onClick={() => setSelectedDateStr(dateStr)}
                                            className="sticky top-0 z-10 text-left align-bottom p-0 w-[320px] cursor-pointer bg-background-light dark:bg-background-dark group/header transition-colors"
                                        >
                                            <div className={cn(
                                                "w-full h-full pb-4 transition-colors",
                                                index === 0 ? "pr-4 pl-0" : "px-4",
                                                isSelected ? "bg-background-light dark:bg-background-dark" : "bg-background-light dark:bg-background-dark"
                                            )}>
                                                <div className={cn(
                                                    "h-full rounded-t-xl border-x border-t transition-colors",
                                                    isSelected ? "bg-surface-light dark:bg-surface-dark border-primary/20" : "border-transparent hover:bg-surface-light/20 dark:hover:bg-surface-dark/20"
                                                )}>
                                                    <div className={cn(
                                                        "flex flex-col border-l-4 pl-3 py-1 transition-colors",
                                                        isSelected ? "border-primary" : "border-transparent group-hover/header:border-primary/30"
                                                    )}>
                                                        <span className={cn(
                                                            "text-xs uppercase font-bold tracking-widest flex items-center gap-1",
                                                            isSelected ? "text-slate-950 dark:text-white" : "text-slate-500 dark:text-slate-400"
                                                        )}>
                                                            {format(date, 'EEEE')}
                                                            {isToday && <span className={cn("text-slate-950 text-[10px] px-1.5 rounded-sm ml-1 transition-colors font-bold", isSelected ? "bg-primary" : "bg-slate-200 dark:bg-slate-700 text-slate-500")}>Today</span>}
                                                        </span>
                                                        <span className={cn("text-lg font-bold transition-colors", isSelected ? "text-slate-950 dark:text-white" : "text-slate-500 dark:text-slate-400")}>{format(date, 'MMM d')}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </th>
                                    );
                                })}
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="group/row">
                                {displayDates.map((dateStr, index) => (
                                    <td
                                        key={dateStr}
                                        className={cn(
                                            "p-0 align-top transition-colors border-x border-b border-border-light/40 dark:border-border-dark/40",
                                            index === 0 ? "pr-4" : "px-4",
                                            dateStr === selectedDateStr ? "bg-surface-light/20 dark:bg-surface-dark/10" : "bg-transparent"
                                        )}
                                    >
                                        <TaskColumn
                                            dateStr={dateStr}
                                            today={today}
                                            selectedDateStr={selectedDateStr}
                                            setSelectedDateStr={setSelectedDateStr}
                                            tasksForDate={getTasksForDate(dateStr)}
                                            isAddingTo={isAddingTo}
                                            setIsAddingTo={setIsAddingTo}
                                        />
                                    </td>
                                ))}
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-background-light dark:from-background-dark to-transparent z-20"></div>
        </div>
    );
};
