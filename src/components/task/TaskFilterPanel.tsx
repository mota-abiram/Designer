import { useTaskContext } from '../../context/TaskContext';


export const TaskFilterPanel = () => {
    const { filters, setFilters } = useTaskContext();

    const handleStatusToggle = (status: 'Pending' | 'Submitted') => {
        setFilters({
            ...filters,
            status: filters.status.includes(status)
                ? filters.status.filter(s => s !== status)
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
        <div className="absolute top-full left-0 mt-2 w-72 bg-surface-dark border border-border-dark rounded-xl shadow-2xl p-4 z-50">
            <div className="space-y-4">
                <div>
                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 block">Status</label>
                    <div className="flex flex-wrap gap-2">
                        {['Pending', 'Submitted'].map(status => {
                            const isSelected = filters.status.includes(status as any);
                            return (
                                <button
                                    key={status}
                                    onClick={() => handleStatusToggle(status as any)}
                                    className={`px-2 py-1 text-xs font-bold rounded border transition-colors ${isSelected ? 'bg-primary text-white border-primary' : 'border-border-dark text-text-muted hover:text-text-main hover:bg-gray-100'}`}
                                >
                                    {status}
                                </button>
                            );
                        })}
                    </div>
                </div>
                <div>
                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 block">Date Range</label>
                    <div className="flex gap-2">
                        <input
                            type="date"
                            value={filters.dateRange.start || ''}
                            onChange={(e) => handleDateChange('start', e.target.value)}
                            className="w-full bg-background-dark border border-border-dark rounded px-2 py-1 text-xs text-text-main [color-scheme:light]"
                            placeholder="Start"
                        />
                        <input
                            type="date"
                            value={filters.dateRange.end || ''}
                            onChange={(e) => handleDateChange('end', e.target.value)}
                            className="w-full bg-background-dark border border-border-dark rounded px-2 py-1 text-xs text-text-main [color-scheme:light]"
                            placeholder="End"
                        />
                    </div>
                </div>
                {(filters.status.length > 0 || filters.dateRange.start || filters.dateRange.end) && (
                    <button
                        onClick={() => setFilters({ status: [], dateRange: { start: null, end: null } })}
                        className="w-full py-1 text-xs font-medium text-red-500 hover:text-red-400"
                    >
                        Clear Filters
                    </button>
                )}
            </div>
        </div>
    );
};
