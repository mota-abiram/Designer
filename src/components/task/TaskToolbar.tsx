
import { useState } from 'react';
import { useTaskContext } from '../../context/TaskContext';
import { TaskFilterPanel } from './TaskFilterPanel';
import { format, addWeeks, startOfWeek, parseISO, addDays } from 'date-fns';

export const TaskToolbar = () => {
    const { setAddTaskOpen, setNewTaskDefaults, scrollByAmount, filters, setFilters, viewMode, setViewMode } = useTaskContext();
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const activeFilterCount = filters.status.length + (filters.dateRange.start ? 1 : 0);

    const handleNewTask = () => {
        setNewTaskDefaults({ date: format(new Date(), 'yyyy-MM-dd') });
        setAddTaskOpen(true);
    };

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
        <div className="flex-none flex justify-between items-center px-6 py-4 bg-background-dark border-b border-border-dark relative">
            <div className="flex items-center gap-3">
                <div className="relative">
                    <button
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${isFilterOpen ? 'bg-primary border-primary text-white' : activeFilterCount > 0 ? 'bg-primary/10 border-primary text-primary hover:bg-primary/20' : 'bg-surface-dark border-border-dark hover:bg-gray-200 text-text-main'}`}
                    >
                        <span className="material-symbols-outlined text-[20px]">filter_list</span>
                        <span className="text-sm font-medium">Filter</span>
                        {activeFilterCount > 0 && (
                            <span className="bg-primary text-white text-[10px] font-bold px-1.5 rounded-full min-w-[1.25em] h-[1.25em] flex items-center justify-center">
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

                <div className="h-8 w-px bg-border-dark mx-1"></div>

                {/* Week Navigation */}
                <div className="flex bg-surface-dark rounded-lg p-1 border border-border-dark">
                    <button
                        onClick={() => handleWeekChange('prev')}
                        className="p-1 rounded transition-colors text-text-muted hover:text-text-main hover:bg-white hover:shadow-sm"
                        title="Previous Week"
                    >
                        <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                    </button>
                    <div className="px-2 flex items-center justify-center border-l border-r border-border-dark/50 mx-1">
                        <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Week</span>
                    </div>
                    <button
                        onClick={() => handleWeekChange('next')}
                        className="p-1 rounded transition-colors text-text-muted hover:text-text-main hover:bg-white hover:shadow-sm"
                        title="Next Week"
                    >
                        <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                    </button>
                </div>

                <div className="h-8 w-px bg-border-dark mx-1"></div>

                <div className="flex bg-surface-dark rounded-lg p-1 border border-border-dark">
                    <button
                        onClick={() => setViewMode('comfortable')}
                        className={`p-1 rounded transition-colors ${viewMode === 'comfortable' ? 'bg-white shadow-sm text-primary' : 'text-text-muted hover:text-text-main'}`}
                        title="Comfortable View"
                    >
                        <span className="material-symbols-outlined text-[20px]">grid_view</span>
                    </button>
                    <button
                        onClick={() => setViewMode('compact')}
                        className={`p-1 rounded transition-colors ${viewMode === 'compact' ? 'bg-white shadow-sm text-primary' : 'text-text-muted hover:text-text-main'}`}
                        title="Compact View"
                    >
                        <span className="material-symbols-outlined text-[20px]">view_list</span>
                    </button>
                </div>


            </div>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => scrollByAmount(-320)}
                        className="p-1.5 rounded-lg text-text-muted hover:text-text-main hover:bg-surface-dark transition-colors"
                        title="Scroll Left"
                    >
                        <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                    </button>
                    <button
                        onClick={() => scrollByAmount(320)}
                        className="p-1.5 rounded-lg text-text-muted hover:text-text-main hover:bg-surface-dark transition-colors"
                        title="Scroll Right"
                    >
                        <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                    </button>
                </div>
                <p className="hidden lg:block text-text-muted text-xs font-normal">Scroll horizontally to view timeline</p>
                <button
                    onClick={handleNewTask}
                    className="flex items-center justify-center rounded-lg h-9 bg-primary hover:bg-blue-600 text-white gap-2 text-sm font-bold px-4 shadow-lg shadow-primary/20 transition-all"
                >
                    <span className="material-symbols-outlined text-[20px]">add</span>
                    <span>New Task</span>
                </button>
            </div>
        </div>
    );
};
