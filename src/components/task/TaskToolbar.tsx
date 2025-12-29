
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
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-300 ${isFilterOpen ? 'bg-primary border-primary text-white' : activeFilterCount > 0 ? 'bg-primary/10 border-primary text-primary hover:bg-primary/20' : 'bg-surface-light dark:bg-surface-dark border-border-light dark:border-border-dark hover:bg-gray-100 dark:hover:bg-slate-800 text-text-main dark:text-text-main-dark'}`}
                    >
                        <span className="material-symbols-outlined text-[20px] font-black">filter_list</span>
                        <span className="text-xs font-black uppercase tracking-widest">Filter</span>
                        {activeFilterCount > 0 && (
                            <span className="bg-primary text-white text-[10px] font-black px-1.5 rounded-full min-w-[1.25em] h-[1.25em] flex items-center justify-center">
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
                    <span className="material-symbols-outlined absolute left-3 text-[18px] text-text-muted transition-colors group-focus-within:text-primary">search</span>
                    <input
                        type="text"
                        placeholder="SEARCH TASKS..."
                        value={filters.searchQuery}
                        onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                        className="h-10 pl-10 pr-4 w-48 lg:w-64 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl text-[11px] font-black uppercase tracking-widest placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                    />
                    {filters.searchQuery && (
                        <button
                            onClick={() => setFilters({ ...filters, searchQuery: '' })}
                            className="absolute right-3 text-text-muted hover:text-text-main transition-colors"
                        >
                            <span className="material-symbols-outlined text-[16px] font-black">close</span>
                        </button>
                    )}
                </div>

                <div className="h-8 w-px bg-border-light dark:bg-border-dark mx-1"></div>

                {/* Week Navigation */}
                <div className="flex bg-surface-light dark:bg-surface-dark rounded-lg p-1 border border-border-light dark:border-border-dark transition-colors">
                    <button
                        onClick={() => handleWeekChange('prev')}
                        className="p-1 rounded transition-colors text-text-muted dark:text-text-muted-dark hover:text-text-main dark:hover:text-text-main-dark hover:bg-gray-100 dark:hover:bg-slate-800"
                        title="Previous Week"
                    >
                        <span className="material-symbols-outlined text-[20px] font-black">chevron_left</span>
                    </button>
                    <div className="px-3 flex items-center justify-center border-l border-r border-border-light dark:border-border-dark mx-1">
                        <span className="text-[10px] font-black text-text-muted dark:text-text-muted-dark uppercase tracking-widest">Week</span>
                    </div>
                    <button
                        onClick={() => handleWeekChange('next')}
                        className="p-1 rounded transition-colors text-text-muted dark:text-text-muted-dark hover:text-text-main dark:hover:text-text-main-dark hover:bg-gray-100 dark:hover:bg-slate-800"
                        title="Next Week"
                    >
                        <span className="material-symbols-outlined text-[20px] font-black">chevron_right</span>
                    </button>
                </div>

                <div className="h-8 w-px bg-border-light dark:bg-border-dark mx-1"></div>

                <div className="flex bg-surface-light dark:bg-surface-dark rounded-lg p-1 border border-border-light dark:border-border-dark transition-colors">
                    <button
                        onClick={() => setViewMode('comfortable')}
                        className={`p-1 rounded transition-all duration-300 ${viewMode === 'comfortable' ? 'bg-white dark:bg-slate-800 shadow-sm text-primary' : 'text-text-muted dark:text-text-muted-dark hover:text-text-main dark:hover:text-text-main-dark'}`}
                        title="Comfortable View"
                    >
                        <span className="material-symbols-outlined text-[20px] font-black">grid_view</span>
                    </button>
                    <button
                        onClick={() => setViewMode('compact')}
                        className={`p-1 rounded transition-all duration-300 ${viewMode === 'compact' ? 'bg-white dark:bg-slate-800 shadow-sm text-primary' : 'text-text-muted dark:text-text-muted-dark hover:text-text-main dark:hover:text-text-main-dark'}`}
                        title="Compact View"
                    >
                        <span className="material-symbols-outlined text-[20px] font-black">view_list</span>
                    </button>
                </div>


            </div>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => scrollByAmount(-320)}
                        className="p-1.5 rounded-lg text-text-muted dark:text-text-muted-dark hover:text-text-main dark:hover:text-text-main-dark hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                        title="Scroll Left"
                    >
                        <span className="material-symbols-outlined text-[20px] font-black">chevron_left</span>
                    </button>
                    <button
                        onClick={() => scrollByAmount(320)}
                        className="p-1.5 rounded-lg text-text-muted dark:text-text-muted-dark hover:text-text-main dark:hover:text-text-main-dark hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                        title="Scroll Right"
                    >
                        <span className="material-symbols-outlined text-[20px] font-black">chevron_right</span>
                    </button>
                </div>
                <p className="hidden lg:block text-text-muted dark:text-text-muted-dark text-[10px] font-black uppercase tracking-widest opacity-60">Scroll horizontally</p>
            </div>
        </div >
    );
};
