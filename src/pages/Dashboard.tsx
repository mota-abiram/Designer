import { useEffect, useMemo, useState } from 'react';
import { useTaskContext } from '../context/TaskContext';
import { Layout } from '../components/layout/Layout';
import { useLocation } from 'react-router-dom';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { cn } from '../utils/cn';
import type { Task, Designer } from '../types';
import { ASSIGNERS } from '../constants/assigners';
import { ScopeTrackingTab } from '../components/dashboard/ScopeTrackingTab';
import { ResourceHeatmap } from '../components/dashboard/ResourceHeatmap';
import { motion } from 'framer-motion';

// Circular Progress Component for Scope Tracking
const CircularProgress = ({ value, total, label, color }: { value: number, total: number, label: string, color: string }) => {
    const percentage = total > 0 ? Math.min(Math.round((value / total) * 100), 100) : 0;
    const radius = 36;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div className="flex flex-col items-center justify-center">
            <div className="relative size-24">
                <svg className="size-full -rotate-90">
                    <circle cx="48" cy="48" r={radius} fill="transparent" stroke="currentColor" strokeWidth="8" className="text-slate-100" />
                    <motion.circle
                        cx="48"
                        cy="48"
                        r={radius}
                        fill="transparent"
                        stroke="currentColor"
                        strokeWidth="8"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        strokeLinecap="round"
                        style={{ color }}
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-bold text-slate-900 dark:text-text-main-dark">{percentage}%</span>
                </div>
            </div>
            <div className="mt-2 text-center">
                <span className="text-[11px] font-bold text-slate-400 dark:text-text-muted-dark uppercase tracking-wider">{label}</span>
                <div className="flex items-center justify-center gap-1 mt-0.5">
                    <span className="text-base font-bold text-slate-900 dark:text-text-main-dark">{value}</span>
                    <span className="text-slate-400 dark:text-text-muted-dark font-bold text-xs">/</span>
                    <span className="text-sm font-bold text-slate-500 dark:text-slate-400">{total}</span>
                </div>
            </div>
        </div>
    );
};

export const Dashboard = () => {
    const { tasks, designers, setFilters, filters, quotas } = useTaskContext();
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
                dateRange: { start: null, end: null },
                searchQuery: ''
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
            const reworkOffset = designerTasks.reduce((acc, t) => acc + (t.reworkCount || 0), 0);
            const total = designerTasks.length + reworkOffset;
            const completed = designerTasks.filter((t: Task) => t.status === 'Approved').length;
            const pending = designerTasks.filter((t: Task) => t.status !== 'Approved').length;
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
            const assignerTasks = tasks.filter((t: Task) => t.assignedBy === name);
            const reworkOffset = assignerTasks.reduce((acc, t) => acc + (t.reworkCount || 0), 0);
            const total = assignerTasks.length + reworkOffset;
            const completed = assignerTasks.filter((t: Task) => t.status === 'Approved').length;
            const pending = assignerTasks.filter((t: Task) => t.status !== 'Approved').length;
            const efficiency = total > 0 ? Math.round((completed / total) * 100) : 0;

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

    // Social Media Scope Totals
    const scopeTotals = useMemo(() => {
        const socialMediaQuotas = quotas.filter(q => q.scopeId === "Social Media");
        return socialMediaQuotas.reduce((acc, quota) => ({
            statics: {
                target: acc.statics.target + (quota.targets?.Statics || 0),
                delivered: acc.statics.delivered + (quota.delivered?.Statics || 0)
            },
            reels: {
                target: acc.reels.target + (quota.targets?.Reels || 0),
                delivered: acc.reels.delivered + (quota.delivered?.Reels || 0)
            }
        }), {
            statics: { target: 0, delivered: 0 },
            reels: { target: 0, delivered: 0 }
        });
    }, [quotas]);

    // Determine active filter button
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const startOfWeekStr = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
    const endOfWeekStr = format(endOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
    const startOfMonthStr = format(startOfMonth(new Date()), 'yyyy-MM-dd');
    const endOfMonthStr = format(endOfMonth(new Date()), 'yyyy-MM-dd');

    const isToday = filters.dateRange.start === todayStr && filters.dateRange.end === todayStr;
    const isThisWeek = filters.dateRange.start === startOfWeekStr && filters.dateRange.end === endOfWeekStr;
    const isThisMonth = filters.dateRange.start === startOfMonthStr && filters.dateRange.end === endOfMonthStr;


    return (
        <Layout>
            <div className="flex flex-col h-full bg-background-light dark:bg-background-dark overflow-hidden transition-colors duration-300">
                {/* Dashboard Header */}
                <div className="flex-none px-8 py-6 border-b border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark shadow-sm z-10 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-text-main dark:text-text-main-dark tracking-wide word-spacing-wide">Performance Dashboard</h1>
                            <p className="text-base font-semibold text-text-muted dark:text-text-muted-dark mt-1 tracking-wide word-spacing-wide">Overview of team performance and workload</p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex bg-background-light dark:bg-background-dark rounded-lg p-1 border border-border-light dark:border-border-dark">
                                <button onClick={() => setRange('today')} className={cn("px-3 py-1.5 text-sm font-bold rounded-md transition-colors", isToday ? "bg-primary text-slate-900 shadow-sm" : "text-text-muted dark:text-text-muted-dark hover:text-text-main dark:hover:text-text-main-dark")}>
                                    Today
                                </button>
                                <button onClick={() => setRange('week')} className={cn("px-3 py-1.5 text-sm font-bold rounded-md transition-colors", isThisWeek ? "bg-primary text-slate-900 shadow-sm" : "text-text-muted dark:text-text-muted-dark hover:text-text-main dark:hover:text-text-main-dark")}>
                                    This Week
                                </button>
                                <button onClick={() => setRange('month')} className={cn("px-3 py-1.5 text-sm font-bold rounded-md transition-colors", isThisMonth ? "bg-primary text-slate-900 shadow-sm" : "text-text-muted dark:text-text-muted-dark hover:text-text-main dark:hover:text-text-main-dark")}>
                                    This Month
                                </button>
                            </div>
                            <div className="h-8 w-px bg-border-dark mx-1 hidden md:block"></div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="date"
                                    value={filters.dateRange.start || ''}
                                    onChange={(e) => handleCustomDateChange('start', e.target.value)}
                                    className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg px-2 py-1.5 text-sm text-text-main dark:text-text-main-dark focus:border-primary outline-none transition-colors"
                                />
                                <span className="text-text-muted text-xs">to</span>
                                <input
                                    type="date"
                                    value={filters.dateRange.end || ''}
                                    onChange={(e) => handleCustomDateChange('end', e.target.value)}
                                    className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg px-2 py-1.5 text-sm text-text-main dark:text-text-main-dark focus:border-primary outline-none transition-colors"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 overflow-auto p-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
                        {/* Summary Cards */}
                        <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl border border-border-light dark:border-border-dark shadow-sm transition-colors">
                            <span className="text-[11px] font-bold text-text-muted dark:text-text-muted-dark uppercase tracking-wider">Total Tasks</span>
                            <div className="text-4xl font-bold text-text-main dark:text-text-main-dark mt-2 tracking-tight">
                                {tasks.length + tasks.reduce((acc, t) => acc + (t.reworkCount || 0), 0)}
                            </div>
                        </div>
                        <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl border border-green-200 dark:border-green-900 bg-green-50/50 dark:bg-green-900/10 shadow-sm transition-colors">
                            <span className="text-[11px] font-bold text-green-600 dark:text-green-400 uppercase tracking-wider">Approved</span>
                            <div className="text-4xl font-bold text-green-700 dark:text-green-400 mt-2 tracking-tight">
                                {tasks.filter((t: Task) => t.status === 'Approved').length}
                            </div>
                        </div>
                        <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl border border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-900/10 shadow-sm transition-colors">
                            <span className="text-[11px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">Pending/Rework</span>
                            <div className="text-4xl font-bold text-red-700 dark:text-red-400 mt-2 tracking-tight">
                                {tasks.filter((t: Task) => t.status !== 'Approved').length}
                            </div>
                        </div>
                        <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl border border-primary/30 bg-primary/5 dark:bg-primary/10 shadow-sm transition-colors">
                            <span className="text-[11px] font-bold text-primary-dark dark:text-primary uppercase tracking-wider">Efficiency</span>
                            <div className="text-4xl font-bold text-slate-900 dark:text-primary mt-2 tracking-tight">
                                {(() => {
                                    const total = tasks.length + tasks.reduce((acc, t) => acc + (t.reworkCount || 0), 0);
                                    const completed = tasks.filter((t: Task) => t.status === 'Approved').length;
                                    return total > 0 ? Math.round((completed / total) * 100) : 0;
                                })()}%
                            </div>
                        </div>

                        {/* Social Media Scope Progress */}
                        <div className="bg-surface-light dark:bg-surface-dark p-4 rounded-xl border border-primary/30 dark:border-blue-900 shadow-sm flex items-center justify-center transition-colors">
                            <CircularProgress
                                value={scopeTotals.statics.delivered}
                                total={scopeTotals.statics.target}
                                label="Statics"
                                color="#137fec"
                            />
                        </div>
                        <div className="bg-surface-light dark:bg-surface-dark p-4 rounded-xl border border-green-200 dark:border-green-900 shadow-sm flex items-center justify-center transition-colors">
                            <CircularProgress
                                value={scopeTotals.reels.delivered}
                                total={scopeTotals.reels.target}
                                label="Reels"
                                color="#10b981"
                            />
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="border-b border-border-light dark:border-border-dark">
                        <div className="flex space-x-12">
                            <button
                                onClick={() => setActiveTab('designers')}
                                className={cn(
                                    "pb-4 text-base font-bold transition-all relative",
                                    activeTab === 'designers'
                                        ? "text-primary-dark dark:text-primary"
                                        : "text-text-muted dark:text-text-muted-dark hover:text-text-main dark:hover:text-text-main-dark"
                                )}
                            >
                                Designers
                                {activeTab === 'designers' && (
                                    <span className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-full"></span>
                                )}
                            </button>
                            <button
                                onClick={() => setActiveTab('managers')}
                                className={cn(
                                    "pb-4 text-base font-bold transition-all relative",
                                    activeTab === 'managers'
                                        ? "text-primary-dark dark:text-primary"
                                        : "text-text-muted dark:text-text-muted-dark hover:text-text-main dark:hover:text-text-main-dark"
                                )}
                            >
                                Account Managers
                                {activeTab === 'managers' && (
                                    <span className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-full"></span>
                                )}
                            </button>
                            <button
                                onClick={() => setActiveTab('scope')}
                                className={cn(
                                    "pb-4 text-base font-bold transition-all relative",
                                    activeTab === 'scope'
                                        ? "text-primary-dark dark:text-primary"
                                        : "text-text-muted dark:text-text-muted-dark hover:text-text-main dark:hover:text-text-main-dark"
                                )}
                            >
                                Scope Tracking
                                {activeTab === 'scope' && (
                                    <span className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-full"></span>
                                )}
                            </button>
                        </div>
                    </div>

                    {activeTab === 'designers' && (
                        <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm overflow-hidden animate-in fade-in duration-300 transition-colors">
                            {/* ... existing designer content ... */}
                            <div className="px-6 py-4 border-b border-border-light dark:border-border-dark bg-gray-50 dark:bg-slate-800/50 flex items-center justify-between">
                                <h3 className="text-lg font-bold text-text-main dark:text-text-main-dark">Designer Performance</h3>
                                <div className="text-xs text-text-muted">
                                    Range: {filters.dateRange.start || 'All time'} - {filters.dateRange.end || 'Present'}
                                </div>
                            </div>
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-border-light dark:border-border-dark">
                                        <th className="px-6 py-4 text-xs font-bold text-text-muted dark:text-text-muted-dark uppercase tracking-wider">Designer</th>
                                        <th className="px-6 py-4 text-xs font-bold text-text-muted dark:text-text-muted-dark uppercase tracking-wider text-right">Total</th>
                                        <th className="px-6 py-4 text-xs font-bold text-text-muted dark:text-text-muted-dark uppercase tracking-wider text-right">Completed</th>
                                        <th className="px-6 py-4 text-xs font-bold text-text-muted dark:text-text-muted-dark uppercase tracking-wider text-right">Pending</th>
                                        <th className="px-6 py-4 text-xs font-bold text-text-muted dark:text-text-muted-dark uppercase tracking-wider text-right">Efficiency</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-dark">
                                    {stats.map((designer: any) => (
                                        <tr key={designer.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    {designer.avatar ? (
                                                        <img src={designer.avatar} alt={designer.name} className="size-8 rounded-full bg-gray-200 object-cover" />
                                                    ) : (
                                                        <div className="size-8 rounded-full bg-primary/10 dark:bg-primary-dark/10 text-primary dark:text-primary-dark flex items-center justify-center font-bold text-xs uppercase">
                                                            {designer.name[0]}
                                                        </div>
                                                    )}
                                                    <span className="font-bold text-text-main dark:text-text-main-dark tracking-wide">{designer.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right font-bold text-text-main dark:text-text-main-dark text-base">{designer.total}</td>
                                            <td className="px-6 py-4 text-right">
                                                <span className={cn("inline-block px-2.5 py-1 rounded text-xs font-bold", designer.completed > 0 ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" : "text-gray-400")}>
                                                    {designer.completed}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className={cn("inline-block px-2.5 py-1 rounded text-xs font-bold", designer.pending > 0 ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400" : "text-gray-400")}>
                                                    {designer.pending}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <div className="w-16 h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                                        <div className={cn("h-full rounded-full transition-all duration-500",
                                                            designer.efficiency >= 50 ? "bg-green-500" : "bg-red-500")}
                                                            style={{ width: `${designer.efficiency}%` }}>
                                                        </div>
                                                    </div>
                                                    <span className="text-sm font-bold text-text-main dark:text-text-main-dark w-10 text-right">{designer.efficiency}%</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Heatmap Section */}
                            <div className="p-8 border-t border-border-light dark:border-border-dark">
                                <ResourceHeatmap />
                            </div>
                        </div>
                    )}

                    {activeTab === 'managers' && (
                        <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm overflow-hidden animate-in fade-in duration-300 transition-colors">
                            <div className="px-6 py-4 border-b border-border-light dark:border-border-dark bg-gray-50 dark:bg-slate-800/50 flex items-center justify-between">
                                <h3 className="text-lg font-bold text-text-main dark:text-text-main-dark">Account Manager Performance</h3>
                                <div className="text-xs text-text-muted dark:text-text-muted-dark">
                                    Range: {filters.dateRange.start || 'All time'} - {filters.dateRange.end || 'Present'}
                                </div>
                            </div>
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-border-light dark:border-border-dark">
                                        <th className="px-6 py-4 text-xs font-bold text-text-muted dark:text-text-muted-dark uppercase tracking-wider">Manager</th>
                                        <th className="px-6 py-4 text-xs font-bold text-text-muted dark:text-text-muted-dark uppercase tracking-wider text-right">Tasks Assigned</th>
                                        <th className="px-6 py-4 text-xs font-bold text-text-muted dark:text-text-muted-dark uppercase tracking-wider text-right">Completed</th>
                                        <th className="px-6 py-4 text-xs font-bold text-text-muted dark:text-text-muted-dark uppercase tracking-wider text-right">Pending</th>
                                        <th className="px-6 py-4 text-xs font-bold text-text-muted dark:text-text-muted-dark uppercase tracking-wider text-right">Completion Rate</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-dark">
                                    {assignerStats.map((manager: any) => (
                                        <tr key={manager.name} className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    {manager.avatar ? (
                                                        <img src={manager.avatar} alt={manager.name} className="size-8 rounded-full bg-gray-200 object-cover" />
                                                    ) : (
                                                        <div className="size-8 rounded-full bg-primary/20 dark:bg-primary/10 text-primary-dark dark:text-primary flex items-center justify-center font-bold text-xs uppercase">
                                                            {manager.name[0]}
                                                        </div>
                                                    )}
                                                    <span className="font-bold text-text-main dark:text-text-main-dark tracking-wide">{manager.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right font-bold text-text-main dark:text-text-main-dark text-base">{manager.total}</td>
                                            <td className="px-6 py-4 text-right">
                                                <span className={cn("inline-block px-2.5 py-1 rounded text-xs font-bold", manager.completed > 0 ? "bg-green-100 text-green-700" : "text-gray-400")}>
                                                    {manager.completed}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className={cn("inline-block px-2.5 py-1 rounded text-xs font-bold", manager.pending > 0 ? "bg-red-100 text-red-700" : "text-gray-400")}>
                                                    {manager.pending}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <div className="w-16 h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                                        <div className={cn("h-full rounded-full transition-all duration-500",
                                                            manager.efficiency >= 50 ? "bg-green-500" : "bg-red-500")}
                                                            style={{ width: `${manager.efficiency}%` }}>
                                                        </div>
                                                    </div>
                                                    <span className="text-sm font-bold text-text-main dark:text-text-main-dark w-10 text-right">{manager.efficiency}%</span>
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
