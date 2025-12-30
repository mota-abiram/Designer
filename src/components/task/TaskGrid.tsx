import { useEffect, useState, useMemo } from 'react';
import { useTaskContext } from '../../context/TaskContext';
import { getCurrentWeekDays } from '../../services/mockData';
import { format, parseISO, isSameDay, isWithinInterval, eachDayOfInterval, isValid } from 'date-fns';
import { cn } from '../../utils/cn';
import { TaskColumn } from './TaskColumn';

export const TaskGrid = () => {
    const { tasks, activeDesignerId, registerScrollContainer, filters, lastAddedTaskId } = useTaskContext();

    // Determine which dates to display based on filter
    const displayDates = useMemo(() => {
        if (filters.dateRange.start && filters.dateRange.end) {
            const start = parseISO(filters.dateRange.start);
            const end = parseISO(filters.dateRange.end);
            if (isValid(start) && isValid(end) && start <= end) {
                return eachDayOfInterval({ start, end }).map(d => format(d, 'yyyy-MM-dd'));
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


    const filteredTasks = tasks.filter(t => {
        // Designer Filter
        if (t.designerId !== activeDesignerId) return false;

        // Status Filter
        if (filters.status.length > 0 && !filters.status.includes(t.status)) return false;

        // Date Range Filter (Client-side redundant check but good for safety)
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

    return (
        <div className="flex-1 relative overflow-hidden bg-background-light dark:bg-background-dark transition-colors duration-300">
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
                                {displayDates.map((dateStr) => (
                                    <TaskColumn
                                        key={dateStr}
                                        dateStr={dateStr}
                                        today={today}
                                        selectedDateStr={selectedDateStr}
                                        setSelectedDateStr={setSelectedDateStr}
                                        tasksForDate={getTasksForDate(dateStr)}
                                        isAddingTo={isAddingTo}
                                        setIsAddingTo={setIsAddingTo}
                                    />
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
