import { useTaskContext } from '../../context/TaskContext';
import type { Status } from '../../types';


export const TaskFilterPanel = () => {
    const { filters, setFilters } = useTaskContext();

    const handleStatusToggle = (status: Status) => {
        setFilters({
            ...filters,
            status: filters.status.includes(status)
                ? filters.status.filter((s: Status) => s !== status)
                : [...filters.status, status]
        });
    };

    const handleDateChange = (type: 'start' | 'end', value: string) => {
        setFilters({
            ...filters,
            dateRange: {
                ...filters.dateRange,
                [type]: value || null
            }
        });
    };

    // Simple inline display for now inside the toolbar, or popover. 
    // Requirement says "Opens a dropdown or side panel". 
    // Let's make it a small absolute panel toggled by logic in Toolbar.

    return (
        <div className="absolute top-full left-0 mt-2 w-72 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] p-6 z-50 transition-colors">
            <div className="space-y-4">
                <div>
                    <label className="text-[10px] font-bold text-slate-900 dark:text-slate-200 uppercase tracking-widest mb-3 block">Status</label>
                    <div className="flex flex-wrap gap-2">
                        {['Pending', 'Pending Approval', 'Rework', 'Approved'].map(status => {
                            const isSelected = filters.status.includes(status as any);
                            return (
                                <button
                                    key={status}
                                    onClick={() => handleStatusToggle(status as any)}
                                    className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg border transition-all duration-300 ${isSelected ? 'bg-primary text-slate-900 border-primary shadow-md shadow-primary/20' : 'border-border-light dark:border-border-dark text-slate-900 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800'}`}
                                >
                                    {status === 'Pending Approval' ? 'SUBMITTED' : status}
                                </button>
                            );
                        })}
                    </div>
                </div>
                <div>
                    <label className="text-[10px] font-bold text-slate-900 dark:text-slate-200 uppercase tracking-widest mb-3 block">Date Range</label>
                    <div className="flex gap-2">
                        <input
                            type="date"
                            value={filters.dateRange.start || ''}
                            onChange={(e) => handleDateChange('start', e.target.value)}
                            className="w-full bg-gray-50 dark:bg-slate-800 border border-border-light dark:border-border-dark rounded-lg px-2 py-2 text-xs text-slate-950 dark:text-white font-bold [color-scheme:light] dark:[color-scheme:dark] transition-colors"
                            placeholder="Start"
                        />
                        <input
                            type="date"
                            value={filters.dateRange.end || ''}
                            onChange={(e) => handleDateChange('end', e.target.value)}
                            className="w-full bg-gray-50 dark:bg-slate-800 border border-border-light dark:border-border-dark rounded-lg px-2 py-2 text-xs text-slate-950 dark:text-white font-bold [color-scheme:light] dark:[color-scheme:dark] transition-colors"
                            placeholder="End"
                        />
                    </div>
                </div>
                <button
                    onClick={() => setFilters({ status: [], dateRange: { start: null, end: null }, searchQuery: '' })}
                    className="w-full py-2 text-[10px] font-bold uppercase tracking-widest text-red-500 hover:text-red-400 hover:bg-red-500/5 rounded-lg transition-all"
                >
                    Clear Filters
                </button>
            </div>
        </div>
    );
};
