
import { useState } from 'react';
import { useTaskContext } from '../../context/TaskContext';
import { TaskFilterPanel } from './TaskFilterPanel';
import { format } from 'date-fns';

export const TaskToolbar = () => {
    const { setAddTaskOpen, setNewTaskDefaults, scrollByAmount, filters } = useTaskContext();
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const activeFilterCount = filters.status.length + (filters.dateRange.start ? 1 : 0);

    const handleNewTask = () => {
        setNewTaskDefaults({ date: format(new Date(), 'yyyy-MM-dd') });
        setAddTaskOpen(true);
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
