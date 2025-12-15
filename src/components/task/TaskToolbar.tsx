
import { useState } from 'react';
import { useTaskContext } from '../../context/TaskContext';
import { TaskFilterPanel } from './TaskFilterPanel';
import { format } from 'date-fns';

export const TaskToolbar = () => {
    const { scrollToToday, setAddTaskOpen, setNewTaskDefaults } = useTaskContext();
    const [isFilterOpen, setIsFilterOpen] = useState(false);

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
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${isFilterOpen ? 'bg-primary border-primary text-white' : 'bg-surface-dark border-border-dark hover:bg-[#233648] text-white'}`}
                    >
                        <span className="material-symbols-outlined text-[20px]">filter_list</span>
                        <span className="text-sm font-medium">Filter</span>
                    </button>
                    {isFilterOpen && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setIsFilterOpen(false)}></div>
                            <TaskFilterPanel />
                        </>
                    )}
                </div>

                <button
                    onClick={scrollToToday}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-dark border border-border-dark hover:bg-[#233648] text-white transition-colors"
                >
                    <span className="material-symbols-outlined text-[20px]">calendar_month</span>
                    <span className="text-sm font-medium">Jump to Today</span>
                </button>
            </div>
            <div className="flex items-center gap-4">
                <p className="hidden lg:block text-[#92adc9] text-xs font-normal">Scroll horizontally to view timeline</p>
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
