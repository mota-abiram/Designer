import { useMemo, useState } from 'react';
import { useTaskContext } from '../../context/TaskContext';
import { cn } from '../../utils/cn';
import { motion, AnimatePresence } from 'framer-motion';
import type { BrandQuota } from '../../types';
import { ASSIGNERS } from '../../constants/assigners';
import toast from 'react-hot-toast';



export const ScopeTrackingTab = () => {
    const { tasks, quotas, updateQuota } = useTaskContext();

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<BrandQuota>>({});

    const activeScope = "Social Media";

    const brandStats = useMemo(() => {
        const scopeQuotas = quotas.filter(q => q.scopeId === activeScope);

        return scopeQuotas.map(quota => {
            const liveStatics = tasks.filter(t =>
                t.brand === quota.brandId &&
                t.scope === quota.scopeId &&
                t.creativeType === "Statics" &&
                t.status === "Approved"
            );

            const liveReels = tasks.filter(t =>
                t.brand === quota.brandId &&
                t.scope === quota.scopeId &&
                t.creativeType === "Reels" &&
                t.status === "Approved"
            );

            const targetStatics = quota.targets?.Statics || 0;
            const targetReels = quota.targets?.Reels || 0;

            // Use actual delivered counts from database
            const deliveredStatics = quota.delivered?.Statics || 0;
            const deliveredReels = quota.delivered?.Reels || 0;

            const totalTarget = targetStatics + targetReels;
            const totalDelivered = deliveredStatics + deliveredReels;
            const efficiency = totalTarget ? Math.round((totalDelivered / totalTarget) * 100) : 0;

            return {
                id: quota.id,
                brand: quota.brandId,
                designer: quota.assignedDesigner || "Unassigned",
                statics: {
                    target: targetStatics,
                    delivered: deliveredStatics,
                    live: liveStatics
                },
                reels: {
                    target: targetReels,
                    delivered: deliveredReels,
                    live: liveReels
                },
                total: { target: totalTarget, delivered: totalDelivered },
                efficiency
            };
        }).sort((a, b) => b.efficiency - a.efficiency);
    }, [tasks, quotas]);



    const handleStartEdit = (item: typeof brandStats[0]) => {
        setEditingId(item.id);
        setEditForm({
            brandId: item.brand,
            assignedDesigner: item.designer,
            scopeId: activeScope,
            targets: { Statics: item.statics.target, Reels: item.reels.target }
        });
    };

    const handleSaveEdit = async () => {
        if (!editingId) return;

        try {
            await updateQuota({
                id: editingId,
                brandId: editForm.brandId,
                scopeId: activeScope,
                assignedDesigner: editForm.assignedDesigner,
                targets: {
                    Statics: editForm.targets?.Statics || 0,
                    Reels: editForm.targets?.Reels || 0
                }
            });
            toast.success('Quota updated successfully');
            setEditingId(null);
        } catch (e) {
            toast.error('Failed to update quota');
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-2xl font-bold text-text-main dark:text-text-main-dark tracking-tight transition-colors word-spacing-wide">Social Media Scope</h3>
                    <p className="text-base font-semibold text-text-muted dark:text-text-muted-dark transition-colors word-spacing-wide">Target vs Delivered metrics</p>
                </div>
                <div className="flex gap-2">

                </div>
            </div>



            {/* Brand Stats Table */}
            <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-2xl shadow-sm overflow-hidden mb-8 transition-colors">
                <table className="w-full text-left border-collapse">
                    <thead>
                        {/* Main header row */}
                        <tr className="bg-gray-50 dark:bg-slate-800/50 border-b border-border-light dark:border-border-dark">
                            <th rowSpan={2} className="px-6 py-4 text-xs font-bold text-text-muted dark:text-text-muted-dark uppercase tracking-wider border-r border-border-light dark:border-border-dark align-middle">Brand</th>
                            <th rowSpan={2} className="px-6 py-4 text-xs font-bold text-text-muted dark:text-text-muted-dark uppercase tracking-wider border-r border-border-light dark:border-border-dark align-middle">Manager</th>
                            <th colSpan={2} className="px-4 py-3 text-xs font-bold text-primary-dark dark:text-primary uppercase tracking-wider text-center border-r border-border-light dark:border-border-dark bg-primary/20 transition-colors">Targets</th>
                            <th colSpan={2} className="px-4 py-3 text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-wider text-center border-r border-border-light dark:border-border-dark bg-green-50/50 dark:bg-green-900/10 transition-colors">Delivered</th>
                            <th rowSpan={2} className="px-4 py-4 text-xs font-bold text-text-muted dark:text-text-muted-dark uppercase tracking-wider text-center align-middle border-r border-border-light dark:border-border-dark">Status</th>
                            <th rowSpan={2} className="px-4 py-4 text-xs font-bold text-text-muted dark:text-text-muted-dark uppercase tracking-wider text-center align-middle">Actions</th>
                        </tr>
                        {/* Sub-header row */}
                        <tr className="bg-gray-50/70 dark:bg-slate-800/30 border-b border-border-light dark:border-border-dark">
                            <th className="px-4 py-2.5 text-[11px] font-bold text-text-muted dark:text-text-muted-dark uppercase tracking-wider text-center border-r border-border-light dark:border-border-dark bg-primary/5 dark:bg-primary/5">Statics</th>
                            <th className="px-4 py-2.5 text-[11px] font-bold text-text-muted dark:text-text-muted-dark uppercase tracking-wider text-center border-r border-border-light dark:border-border-dark bg-primary/5 dark:bg-primary/5">Reels</th>
                            <th className="px-4 py-2.5 text-[11px] font-bold text-text-muted dark:text-text-muted-dark uppercase tracking-wider text-center border-r border-border-light dark:border-border-dark bg-green-50/30 dark:bg-green-900/5">Statics</th>
                            <th className="px-4 py-2.5 text-[11px] font-bold text-text-muted dark:text-text-muted-dark uppercase tracking-wider text-center border-r border-border-light dark:border-border-dark bg-green-50/30 dark:bg-green-900/5">Reels</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border-light dark:divide-border-dark">
                        <AnimatePresence mode='popLayout'>
                            {brandStats.map((item) => (
                                <motion.tr
                                    layout
                                    key={item.id}
                                    className={cn("hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group", editingId === item.id && "bg-primary/10 dark:bg-primary/20")}
                                >
                                    {editingId === item.id ? (
                                        <>
                                            {/* Edit Mode */}
                                            <td className="px-6 py-4 border-r border-border-light dark:border-border-dark">
                                                <span className="font-bold text-text-main dark:text-text-main-dark text-base">{item.brand}</span>
                                            </td>
                                            <td className="px-3 py-3 border-r border-border-light dark:border-border-dark">
                                                <select
                                                    value={editForm.assignedDesigner || ''}
                                                    onChange={e => setEditForm(prev => ({ ...prev, assignedDesigner: e.target.value }))}
                                                    className="w-full bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark text-text-main dark:text-text-main-dark rounded px-2 py-1 text-xs outline-none transition-colors"
                                                >
                                                    <option value="">Unassigned</option>
                                                    {ASSIGNERS.map(name => <option key={name} value={name}>{name}</option>)}
                                                </select>
                                            </td>
                                            <td className="px-3 py-3 text-center border-r border-border-light dark:border-border-dark bg-primary/5 dark:bg-primary/10">
                                                <input
                                                    type="number"
                                                    value={editForm.targets?.Statics || 0}
                                                    onChange={e => setEditForm(prev => ({ ...prev, targets: { ...prev.targets, Statics: parseInt(e.target.value) || 0 } }))}
                                                    className="w-14 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark text-text-main dark:text-text-main-dark rounded px-2 py-1 text-xs text-center outline-none transition-colors"
                                                />
                                            </td>
                                            <td className="px-3 py-3 text-center border-r border-border-light dark:border-border-dark bg-primary/5 dark:bg-primary/10">
                                                <input
                                                    type="number"
                                                    value={editForm.targets?.Reels || 0}
                                                    onChange={e => setEditForm(prev => ({ ...prev, targets: { ...prev.targets, Reels: parseInt(e.target.value) || 0 } }))}
                                                    className="w-14 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark text-text-main dark:text-text-main-dark rounded px-2 py-1 text-xs text-center outline-none transition-colors"
                                                />
                                            </td>
                                            <td className="px-6 py-4 text-center border-r border-border-light dark:border-border-dark bg-green-50/5 dark:bg-green-900/5">
                                                <span className="text-sm font-bold text-text-muted dark:text-text-muted-dark">{item.statics.delivered}</span>
                                            </td>
                                            <td className="px-6 py-4 text-center border-r border-border-light dark:border-border-dark bg-green-50/5 dark:bg-green-900/5">
                                                <span className="text-sm font-bold text-text-muted dark:text-text-muted-dark">{item.reels.delivered}</span>
                                            </td>
                                            <td className="px-4 py-3 text-center border-r border-border-light dark:border-border-dark">
                                                <span className="text-[11px] font-bold text-text-muted dark:text-text-muted-dark italic tracking-wide">Editing</span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <button onClick={handleSaveEdit} className="p-1.5 bg-green-500 text-white rounded hover:bg-green-600 transition-colors shadow-sm shadow-green-500/10">
                                                        <span className="material-symbols-outlined text-[14px]">check</span>
                                                    </button>
                                                    <button onClick={() => setEditingId(null)} className="p-1.5 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
                                                        <span className="material-symbols-outlined text-[14px]">close</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            {/* View Mode */}
                                            <td className="px-6 py-5 border-r border-border-light dark:border-border-dark">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-text-main dark:text-text-main-dark transition-colors text-base">{item.brand}</span>
                                                    {new Date().getDate() > 15 && item.efficiency < 50 && (
                                                        <span className="material-symbols-outlined text-red-500 text-[20px] animate-pulse drop-shadow-[0_0_4px_rgba(239,68,68,0.6)]" title="Behind Schedule - Less than 50% delivered after 15th">error</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 border-r border-border-light dark:border-border-dark">
                                                <span className="text-text-main dark:text-text-main-dark text-sm font-bold tracking-wide">{item.designer}</span>
                                            </td>
                                            <td className="px-6 py-5 text-center border-r border-border-light dark:border-border-dark bg-primary/5 dark:bg-primary/10">
                                                <span className="text-sm font-bold text-text-main dark:text-text-main-dark">{item.statics.target || "-"}</span>
                                            </td>
                                            <td className="px-6 py-5 text-center border-r border-border-light dark:border-border-dark bg-primary/5 dark:bg-primary/10">
                                                <span className="text-sm font-bold text-text-main dark:text-text-main-dark">{item.reels.target || "-"}</span>
                                            </td>
                                            <td className="px-6 py-5 text-center border-r border-border-light dark:border-border-dark bg-green-50/5 dark:bg-green-900/5">
                                                <span className="text-sm font-bold text-text-main dark:text-text-main-dark">{item.statics.delivered || "-"}</span>
                                            </td>
                                            <td className="px-6 py-5 text-center border-r border-border-light dark:border-border-dark bg-green-50/5 dark:bg-green-900/5">
                                                <span className="text-sm font-bold text-text-main dark:text-text-main-dark">{item.reels.delivered || "-"}</span>
                                            </td>
                                            <td className="px-4 py-5 text-center border-r border-border-light dark:border-border-dark">
                                                <div className="flex flex-col items-center gap-1">
                                                    <div className="w-14 h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden transition-colors">
                                                        <div className={cn("h-full transition-all duration-1000", item.efficiency >= 50 ? "bg-green-500" : "bg-red-500")} style={{ width: `${Math.min(item.efficiency, 100)}%` }} />
                                                    </div>
                                                    <span className="text-[11px] font-bold text-text-muted dark:text-text-muted-dark">{item.efficiency}%</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <button
                                                    onClick={() => handleStartEdit(item)}
                                                    className="p-1.5 text-slate-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded transition-colors opacity-0 group-hover:opacity-100"
                                                >
                                                    <span className="material-symbols-outlined text-[16px]">edit</span>
                                                </button>
                                            </td>
                                        </>
                                    )}
                                </motion.tr>
                            ))}
                        </AnimatePresence>

                        {brandStats.length === 0 && (
                            <tr>
                                <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                                    <p className="text-sm font-medium">No brand data available.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

