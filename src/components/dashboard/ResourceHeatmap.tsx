import { useMemo } from 'react';
import { useTaskContext } from '../../context/TaskContext';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { cn } from '../../utils/cn';

export const ResourceHeatmap = () => {
    const { tasks, designers } = useTaskContext();
    const today = new Date();

    const days = useMemo(() => {
        const start = startOfMonth(today);
        const end = endOfMonth(today);
        return eachDayOfInterval({ start, end });
    }, []);

    const data = useMemo(() => {
        return designers.map(designer => {
            const designerTasks = tasks.filter(t => t.designerId === designer.id);
            const dailyCounts = days.map(day => {
                const dayStr = format(day, 'yyyy-MM-dd');
                const count = designerTasks.filter(t => t.date === dayStr).length;
                return { day, count };
            });
            return { designer, dailyCounts };
        });
    }, [tasks, designers, days]);

    const getIntensity = (count: number) => {
        if (count === 0) return 'bg-gray-100 dark:bg-slate-800/40 text-transparent';
        if (count <= 2) return 'bg-green-200 dark:bg-green-900/30 text-green-800 dark:text-green-300';
        if (count <= 4) return 'bg-amber-200 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300';
        return 'bg-red-200 dark:bg-red-900/40 text-red-800 dark:text-red-300';
    };

    return (
        <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm overflow-hidden transition-colors">
            <div className="px-6 py-4 border-b border-border-light dark:border-border-dark bg-gray-50 dark:bg-slate-800/50 flex items-center justify-between">
                <h3 className="text-lg font-bold text-text-main dark:text-text-main-dark">Resource Heatmap</h3>
                <div className="text-xs font-bold text-text-muted uppercase tracking-widest">
                    {format(today, 'MMMM yyyy')}
                </div>
            </div>
            <div className="p-6 overflow-x-auto">
                <div className="min-w-[800px]">
                    <div className="flex mb-4">
                        <div className="w-40 flex-none" />
                        <div className="flex-1 flex gap-1">
                            {days.map(day => (
                                <div key={day.toString()} className="flex-1 text-center">
                                    <span className={cn(
                                        "text-[10px] font-bold uppercase tracking-tighter",
                                        isSameDay(day, today) ? "text-primary-dark dark:text-primary" : "text-text-muted"
                                    )}>
                                        {format(day, 'd')}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-2">
                        {data.map(({ designer, dailyCounts }) => (
                            <div key={designer.id} className="flex items-center">
                                <div className="w-40 flex-none flex items-center gap-2">
                                    {designer.avatar ? (
                                        <img src={designer.avatar} alt={designer.name} className="size-6 rounded-full object-cover" />
                                    ) : (
                                        <div className="size-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary-dark dark:text-primary">
                                            {designer.name[0]}
                                        </div>
                                    )}
                                    <span className="text-xs font-bold text-text-main dark:text-text-main-dark truncate">{designer.name}</span>
                                </div>
                                <div className="flex-1 flex gap-1">
                                    {dailyCounts.map(({ day, count }) => (
                                        <div
                                            key={day.toString()}
                                            className={cn(
                                                "flex-1 aspect-square rounded-sm flex items-center justify-center text-[10px] font-bold transition-all hover:scale-110 cursor-default",
                                                getIntensity(count)
                                            )}
                                            title={`${designer.name} - ${format(day, 'MMM d')}: ${count} tasks`}
                                        >
                                            {count > 0 ? count : ''}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-8 flex items-center justify-end gap-6 text-[10px] font-bold uppercase tracking-widest text-text-muted">
                        <div className="flex items-center gap-2">
                            <div className="size-3 rounded-sm bg-gray-100 dark:bg-slate-800/40" />
                            <span>Empty</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="size-3 rounded-sm bg-green-200 dark:bg-green-900/30" />
                            <span>Low (1-2)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="size-3 rounded-sm bg-amber-200 dark:bg-amber-900/30" />
                            <span>Medium (3-4)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="size-3 rounded-sm bg-red-200 dark:bg-red-900/40" />
                            <span>High (5+)</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
