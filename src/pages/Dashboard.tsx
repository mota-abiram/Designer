import { useEffect, useMemo, useState } from 'react';
import { useTaskContext } from '../context/TaskContext';
import { Layout } from '../components/layout/Layout';
import { useLocation } from 'react-router-dom';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { cn } from '../utils/cn';
import type { Task, Designer } from '../types';
import { ASSIGNERS } from '../constants/assigners';
import { ScopeTrackingTab } from '../components/dashboard/ScopeTrackingTab';

export const Dashboard = () => {
    const { tasks, designers, setFilters, filters } = useTaskContext();
    const location = useLocation();

    // Tab State
    const [activeTab, setActiveTab] = useState<'designers' | 'managers' | 'scope'>('designers');

    // Handle tab switching from location state
    useEffect(() => {
        const state = location.state as { tab?: 'designers' | 'managers' | 'scope' };
        if (state?.tab) {
            setActiveTab(state.tab);
        }
    }, [location.state]);

    // Cleanup filters on unmount to prevent persisting Dashboard filters to other views
    useEffect(() => {
        return () => {
            setFilters({
                status: [],
                dateRange: { start: null, end: null }
            });
        };
    }, [setFilters]);

    // Date Helpers
    const setRange = (type: 'today' | 'week' | 'month') => {
        const now = new Date();
        let start, end;

        if (type === 'today') {
            start = end = now;
        } else if (type === 'week') {
            start = startOfWeek(now, { weekStartsOn: 1 }); // Monday start
            end = endOfWeek(now, { weekStartsOn: 1 });
        } else {
            start = startOfMonth(now);
            end = endOfMonth(now);
        }

        setFilters({
            ...filters,
            dateRange: {
                start: format(start, 'yyyy-MM-dd'),
                end: format(end, 'yyyy-MM-dd')
            }
        });
    };

    const handleCustomDateChange = (type: 'start' | 'end', value: string) => {
        setFilters({
            ...filters,
            dateRange: {
                ...filters.dateRange,
                [type]: value || null
            }
        });
    };

    // Aggregation Logic
    const stats = useMemo(() => {
        return designers.map((designer: Designer) => {
            const designerTasks = tasks.filter((t: Task) => t.designerId === designer.id);
            const total = designerTasks.length;
            const completed = designerTasks.filter((t: Task) => t.status === 'Submitted').length;
            const pending = designerTasks.filter((t: Task) => t.status === 'Pending').length;
            const efficiency = total > 0 ? Math.round((completed / total) * 100) : 0;

            return {
                ...designer,
                total,
                completed,
                pending,
                efficiency
            };
        });
    }, [tasks, designers]);

    const assignerStats = useMemo(() => {
        return ASSIGNERS.map((name: string) => {
            // Find tasks assigned by this person. Match by exact name.
            // Note: task.assignedBy might be null or mismatch if not standardized earlier, but we standardized it.
            const assignerTasks = tasks.filter((t: Task) => t.assignedBy === name);
            const total = assignerTasks.length;
            const completed = assignerTasks.filter((t: Task) => t.status === 'Submitted').length;
            const pending = assignerTasks.filter((t: Task) => t.status === 'Pending').length;
            const efficiency = total > 0 ? Math.round((completed / total) * 100) : 0;

            // Try to find an avatar from one of the tasks to display, or just use initials
            const avatarTask = assignerTasks.find(t => t.assignedByAvatar);
            const avatar = avatarTask?.assignedByAvatar;

            return {
                name,
                avatar,
                total,
                completed,
                pending,
                efficiency
            };
        });
    }, [tasks]);

    // Determine active filter button
    const isToday = filters.dateRange.start === format(new Date(), 'yyyy-MM-dd') && filters.dateRange.end === format(new Date(), 'yyyy-MM-dd');


    return (
        <Layout>
            <div className="flex flex-col h-full bg-background-light overflow-hidden">
                {/* Dashboard Header */}
                <div className="flex-none px-8 py-6 border-b border-border-dark bg-white shadow-sm z-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-text-main">Performance Dashboard</h1>
                            <p className="text-sm text-text-muted mt-1">Overview of team performance and workload</p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex bg-surface-dark rounded-lg p-1 border border-border-dark">
                                <button onClick={() => setRange('today')} className={cn("px-3 py-1.5 text-sm font-semibold rounded-md transition-colors", isToday ? "bg-white text-primary shadow-sm" : "text-text-muted hover:text-text-main")}>
                                    Today
                                </button>
                                <button onClick={() => setRange('week')} className={cn("px-3 py-1.5 text-sm font-semibold rounded-md transition-colors", !isToday && filters.dateRange.start ? "bg-white text-primary shadow-sm" : "text-text-muted hover:text-text-main")}>
                                    This Week
                                </button>
                                <button onClick={() => setRange('month')} className={cn("px-3 py-1.5 text-sm font-semibold rounded-md transition-colors", "text-text-muted hover:text-text-main")}>
                                    {/* Logic for month highlight is tricky without full check, keeping simple for now */}
                                    This Month
                                </button>
                            </div>
                            <div className="h-8 w-px bg-border-dark mx-1 hidden md:block"></div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="date"
                                    value={filters.dateRange.start || ''}
                                    onChange={(e) => handleCustomDateChange('start', e.target.value)}
                                    className="bg-white border border-border-dark rounded-lg px-2 py-1.5 text-sm text-text-main focus:border-primary outline-none"
                                />
                                <span className="text-text-muted text-xs">to</span>
                                <input
                                    type="date"
                                    value={filters.dateRange.end || ''}
                                    onChange={(e) => handleCustomDateChange('end', e.target.value)}
                                    className="bg-white border border-border-dark rounded-lg px-2 py-1.5 text-sm text-text-main focus:border-primary outline-none"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 overflow-auto p-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Summary Cards */}
                        <div className="bg-white p-6 rounded-xl border border-border-dark shadow-sm">
                            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Total Tasks</span>
                            <div className="text-3xl font-bold text-text-main mt-2">{tasks.length}</div>
                        </div>
                        <div className="bg-white p-6 rounded-xl border border-green-200 bg-green-50/50 shadow-sm">
                            <span className="text-xs font-bold text-green-600 uppercase tracking-wider">Completed</span>
                            <div className="text-3xl font-bold text-green-700 mt-2">
                                {tasks.filter((t: Task) => t.status === 'Submitted').length}
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-xl border border-red-200 bg-red-50/50 shadow-sm">
                            <span className="text-xs font-bold text-red-600 uppercase tracking-wider">Pending</span>
                            <div className="text-3xl font-bold text-red-700 mt-2">
                                {tasks.filter((t: Task) => t.status === 'Pending').length}
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-xl border border-blue-200 bg-blue-50/50 shadow-sm">
                            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Efficiency</span>
                            <div className="text-3xl font-bold text-blue-700 mt-2">
                                {tasks.length > 0 ? Math.round((tasks.filter((t: Task) => t.status === 'Submitted').length / tasks.length) * 100) : 0}%
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="border-b border-border-dark">
                        <div className="flex space-x-8">
                            <button
                                onClick={() => setActiveTab('designers')}
                                className={cn(
                                    "pb-4 text-sm font-medium transition-all relative",
                                    activeTab === 'designers'
                                        ? "text-primary font-bold"
                                        : "text-text-muted hover:text-text-main"
                                )}
                            >
                                Designers
                                {activeTab === 'designers' && (
                                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full"></span>
                                )}
                            </button>
                            <button
                                onClick={() => setActiveTab('managers')}
                                className={cn(
                                    "pb-4 text-sm font-medium transition-all relative",
                                    activeTab === 'managers'
                                        ? "text-primary font-bold"
                                        : "text-text-muted hover:text-text-main"
                                )}
                            >
                                Account Managers
                                {activeTab === 'managers' && (
                                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full"></span>
                                )}
                            </button>
                            <button
                                onClick={() => setActiveTab('scope')}
                                className={cn(
                                    "pb-4 text-sm font-medium transition-all relative",
                                    activeTab === 'scope'
                                        ? "text-primary font-bold"
                                        : "text-text-muted hover:text-text-main"
                                )}
                            >
                                Scope Tracking
                                {activeTab === 'scope' && (
                                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full"></span>
                                )}
                            </button>
                        </div>
                    </div>

                    {activeTab === 'designers' && (
                        <div className="bg-white rounded-xl border border-border-dark shadow-sm overflow-hidden animate-in fade-in duration-300">
                            {/* ... existing designer content ... */}
                            <div className="px-6 py-4 border-b border-border-dark bg-gray-50 flex items-center justify-between">
                                <h3 className="font-bold text-text-main">Designer Performance</h3>
                                <div className="text-xs text-text-muted">
                                    Range: {filters.dateRange.start || 'All time'} - {filters.dateRange.end || 'Present'}
                                </div>
                            </div>
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-border-dark">
                                        <th className="px-6 py-3 text-xs font-bold text-text-muted uppercase tracking-wider">Designer</th>
                                        <th className="px-6 py-3 text-xs font-bold text-text-muted uppercase tracking-wider text-right">Total</th>
                                        <th className="px-6 py-3 text-xs font-bold text-text-muted uppercase tracking-wider text-right">Completed</th>
                                        <th className="px-6 py-3 text-xs font-bold text-text-muted uppercase tracking-wider text-right">Pending</th>
                                        <th className="px-6 py-3 text-xs font-bold text-text-muted uppercase tracking-wider text-right">Efficiency</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-dark">
                                    {stats.map((designer: any) => (
                                        <tr key={designer.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    {designer.avatar ? (
                                                        <img src={designer.avatar} alt={designer.name} className="size-8 rounded-full bg-gray-200 object-cover" />
                                                    ) : (
                                                        <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs uppercase">
                                                            {designer.name[0]}
                                                        </div>
                                                    )}
                                                    <span className="font-medium text-text-main">{designer.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right font-medium text-text-main">{designer.total}</td>
                                            <td className="px-6 py-4 text-right">
                                                <span className={cn("inline-block px-2 py-0.5 rounded text-xs font-bold", designer.completed > 0 ? "bg-green-100 text-green-700" : "text-gray-400")}>
                                                    {designer.completed}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className={cn("inline-block px-2 py-0.5 rounded text-xs font-bold", designer.pending > 0 ? "bg-red-100 text-red-700" : "text-gray-400")}>
                                                    {designer.pending}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                        <div className={cn("h-full rounded-full transition-all duration-500",
                                                            designer.efficiency >= 50 ? "bg-green-500" : "bg-red-500")}
                                                            style={{ width: `${designer.efficiency}%` }}>
                                                        </div>
                                                    </div>
                                                    <span className="text-sm font-medium text-text-muted w-8">{designer.efficiency}%</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'managers' && (
                        <div className="bg-white rounded-xl border border-border-dark shadow-sm overflow-hidden animate-in fade-in duration-300">
                            <div className="px-6 py-4 border-b border-border-dark bg-gray-50 flex items-center justify-between">
                                <h3 className="font-bold text-text-main">Account Manager Performance</h3>
                                <div className="text-xs text-text-muted">
                                    Range: {filters.dateRange.start || 'All time'} - {filters.dateRange.end || 'Present'}
                                </div>
                            </div>
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-border-dark">
                                        <th className="px-6 py-3 text-xs font-bold text-text-muted uppercase tracking-wider">Manager</th>
                                        <th className="px-6 py-3 text-xs font-bold text-text-muted uppercase tracking-wider text-right">Tasks Assigned</th>
                                        <th className="px-6 py-3 text-xs font-bold text-text-muted uppercase tracking-wider text-right">Completed</th>
                                        <th className="px-6 py-3 text-xs font-bold text-text-muted uppercase tracking-wider text-right">Pending</th>
                                        <th className="px-6 py-3 text-xs font-bold text-text-muted uppercase tracking-wider text-right">Completion Rate</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-dark">
                                    {assignerStats.map((manager: any) => (
                                        <tr key={manager.name} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    {manager.avatar ? (
                                                        <img src={manager.avatar} alt={manager.name} className="size-8 rounded-full bg-gray-200 object-cover" />
                                                    ) : (
                                                        <div className="size-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs uppercase">
                                                            {manager.name[0]}
                                                        </div>
                                                    )}
                                                    <span className="font-medium text-text-main">{manager.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right font-medium text-text-main">{manager.total}</td>
                                            <td className="px-6 py-4 text-right">
                                                <span className={cn("inline-block px-2 py-0.5 rounded text-xs font-bold", manager.completed > 0 ? "bg-green-100 text-green-700" : "text-gray-400")}>
                                                    {manager.completed}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className={cn("inline-block px-2 py-0.5 rounded text-xs font-bold", manager.pending > 0 ? "bg-red-100 text-red-700" : "text-gray-400")}>
                                                    {manager.pending}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                        <div className={cn("h-full rounded-full transition-all duration-500",
                                                            manager.efficiency >= 50 ? "bg-green-500" : "bg-red-500")}
                                                            style={{ width: `${manager.efficiency}%` }}>
                                                        </div>
                                                    </div>
                                                    <span className="text-sm font-medium text-text-muted w-8">{manager.efficiency}%</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'scope' && (
                        <ScopeTrackingTab />
                    )}
                </div>
            </div>
        </Layout>
    );
};
