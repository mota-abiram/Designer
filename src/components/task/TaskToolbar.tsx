
import { useState } from 'react';
import { useTaskContext } from '../../context/TaskContext';
import { TaskFilterPanel } from './TaskFilterPanel';
import { format, addWeeks, startOfWeek, parseISO, addDays } from 'date-fns';

export const TaskToolbar = () => {
    const { scrollByAmount, filters, setFilters, viewMode, setViewMode } = useTaskContext();
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const activeFilterCount = filters.status.length + (filters.dateRange.start ? 1 : 0);

    const handleWeekChange = (direction: 'prev' | 'next') => {
        // Default to current week's Monday if no start date is set
        const currentStartStr = filters.dateRange.start || format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
        const currentStart = parseISO(currentStartStr);

        const newStart = direction === 'next' ? addWeeks(currentStart, 1) : addWeeks(currentStart, -1);
        const newEnd = addDays(newStart, 5); // Mon + 5 days = Saturday

        setFilters({
            ...filters,
            dateRange: {
                start: format(newStart, 'yyyy-MM-dd'),
                end: format(newEnd, 'yyyy-MM-dd')
            }
        });
    };

    return (
        <div className="flex-none flex justify-between items-center px-6 py-4 bg-background-light dark:bg-background-dark border-b border-border-light dark:border-border-dark relative transition-colors">
            <div className="flex items-center gap-3">
                <div className="relative">
                    <button
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-300 ${isFilterOpen ? 'bg-primary border-primary text-slate-900 shadow-md shadow-primary/20 hover:opacity-90' : activeFilterCount > 0 ? 'bg-primary/10 border-primary text-primary-dark hover:bg-slate-100 dark:hover:bg-slate-800' : 'bg-surface-light dark:bg-surface-dark border-border-light dark:border-border-dark hover:bg-gray-100 dark:hover:bg-slate-800 text-slate-950 dark:text-white'}`}
                    >
                        <span className="material-symbols-outlined text-[20px] font-bold">filter_list</span>
                        <span className="text-xs font-bold uppercase tracking-widest">Filter</span>
                        {activeFilterCount > 0 && (
                            <span className="bg-primary text-slate-900 text-[10px] font-bold px-1.5 rounded-full min-w-[1.25em] h-[1.25em] flex items-center justify-center">
                                {activeFilterCount}
                            </span>
                        )}
                    </button>
                    {isFilterOpen && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setIsFilterOpen(false)}></div>
                            <TaskFilterPanel />
                        </>
                    )}
                </div>

                <div className="relative group flex items-center">
                    <span className="material-symbols-outlined absolute left-3 text-[18px] text-slate-400 dark:text-slate-500 transition-colors group-focus-within:text-primary">search</span>
                    <input
                        type="text"
                        placeholder="SEARCH TASKS..."
                        value={filters.searchQuery}
                        onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                        className="h-10 pl-10 pr-4 w-48 lg:w-64 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl text-[11px] font-bold uppercase tracking-widest placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm text-slate-950 dark:text-white"
                    />
                    {filters.searchQuery && (
                        <button
                            onClick={() => setFilters({ ...filters, searchQuery: '' })}
                            className="absolute right-3 text-slate-400 hover:text-slate-950 transition-colors"
                        >
                            <span className="material-symbols-outlined text-[16px] font-bold">close</span>
                        </button>
                    )}
                </div>

                <div className="h-8 w-px bg-border-light dark:bg-border-dark mx-1"></div>

                {/* Week Navigation */}
                <div className="flex bg-surface-light dark:bg-surface-dark rounded-lg p-1 border border-border-light dark:border-border-dark transition-colors">
                    <button
                        onClick={() => handleWeekChange('prev')}
                        className="p-1 rounded transition-colors text-slate-900 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800"
                        title="Previous Week"
                    >
                        <span className="material-symbols-outlined text-[20px] font-bold">chevron_left</span>
                    </button>
                    <div className="px-3 flex items-center justify-center border-l border-r border-border-light dark:border-border-dark mx-1">
                        <span className="text-[10px] font-bold text-slate-900 dark:text-slate-200 uppercase tracking-widest">Week</span>
                    </div>
                    <button
                        onClick={() => handleWeekChange('next')}
                        className="p-1 rounded transition-colors text-slate-900 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800"
                        title="Next Week"
                    >
                        <span className="material-symbols-outlined text-[20px] font-bold">chevron_right</span>
                    </button>
                </div>

                <div className="h-8 w-px bg-border-light dark:bg-border-dark mx-1"></div>

                <div className="flex bg-surface-light dark:bg-surface-dark rounded-lg p-1 border border-border-light dark:border-border-dark transition-colors">
                    <button
                        onClick={() => setViewMode('comfortable')}
                        className={`p-1 rounded transition-all duration-300 ${viewMode === 'comfortable' ? 'bg-white dark:bg-slate-800 shadow-sm text-primary-dark dark:text-primary' : 'text-slate-900 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white'}`}
                        title="Comfortable View"
                    >
                        <span className="material-symbols-outlined text-[20px] font-bold">grid_view</span>
                    </button>
                    <button
                        onClick={() => setViewMode('compact')}
                        className={`p-1 rounded transition-all duration-300 ${viewMode === 'compact' ? 'bg-white dark:bg-slate-800 shadow-sm text-primary-dark dark:text-primary' : 'text-slate-900 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white'}`}
                        title="Compact View"
                    >
                        <span className="material-symbols-outlined text-[20px] font-bold">view_list</span>
                    </button>
                </div>


            </div>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => scrollByAmount(-320)}
                        className="p-1.5 rounded-lg text-slate-900 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                        title="Scroll Left"
                    >
                        <span className="material-symbols-outlined text-[20px] font-bold">chevron_left</span>
                    </button>
                    <button
                        onClick={() => scrollByAmount(320)}
                        className="p-1.5 rounded-lg text-slate-900 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                        title="Scroll Right"
                    >
                        <span className="material-symbols-outlined text-[20px] font-bold">chevron_right</span>
                    </button>
                </div>
                <p className="hidden lg:block text-slate-900 dark:text-slate-200 text-[10px] font-bold uppercase tracking-widest opacity-60">Scroll horizontally</p>
            </div>
        </div >
    );
};
