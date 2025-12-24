import { useMemo, useState } from 'react';
import { useTaskContext } from '../../context/TaskContext';
import { cn } from '../../utils/cn';
import { motion, AnimatePresence } from 'framer-motion';
import type { BrandQuota, Task } from '../../types';
import { Modal } from '../common/Modal';
import { format, parseISO } from 'date-fns';
import { ASSIGNERS } from '../../constants/assigners';

const CircularProgress = ({ value, total, label, color }: { value: number, total: number, label: string, color: string }) => {
    const percentage = total > 0 ? Math.min(Math.round((value / total) * 100), 100) : 0;
    const radius = 42;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="relative size-32">
                <svg className="size-full -rotate-90">
                    <circle
                        cx="64"
                        cy="64"
                        r={radius}
                        fill="transparent"
                        stroke="currentColor"
                        strokeWidth="10"
                        className="text-slate-100"
                    />
                    <motion.circle
                        cx="64"
                        cy="64"
                        r={radius}
                        fill="transparent"
                        stroke="currentColor"
                        strokeWidth="10"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        strokeLinecap="round"
                        style={{ color }}
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-slate-900">{percentage}%</span>
                </div>
            </div>
            <div className="mt-4 text-center">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
                <div className="flex items-center justify-center gap-1 mt-1">
                    <span className="text-lg font-bold text-slate-900">{value}</span>
                    <span className="text-slate-400 font-medium">/</span>
                    <span className="text-sm font-bold text-slate-500">{total}</span>
                </div>
            </div>
        </div>
    );
};

export const ScopeTrackingTab = () => {
    const { tasks, quotas, updateQuota, deleteQuota, seedSocialMediaData, setSelectedTask } = useTaskContext();

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<BrandQuota>>({});
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [newBrandForm, setNewBrandForm] = useState({
        brandName: '',
        designer: '',
        targetStatics: 0,
        targetReels: 0,
        deliveredStatics: 0,
        deliveredReels: 0
    });

    const [viewingTasks, setViewingTasks] = useState<{ brand: string; type: string; tasks: Task[] } | null>(null);
    const activeScope = "Social Media";

    const brandStats = useMemo(() => {
        const scopeQuotas = quotas.filter(q => q.scopeId === activeScope);
        return scopeQuotas.map(quota => {
            const liveTasksStatics = tasks.filter(t =>
                t.brand === quota.brandId &&
                t.scope === quota.scopeId &&
                t.creativeType === "Statics" &&
                t.status === "Submitted"
            );
            const liveTasksReels = tasks.filter(t =>
                t.brand === quota.brandId &&
                t.scope === quota.scopeId &&
                t.creativeType === "Reels" &&
                t.status === "Submitted"
            );

            const deliveredStaticsBase = quota.delivered?.["Statics"] || 0;
            const deliveredReelsBase = quota.delivered?.["Reels"] || 0;
            const totalDeliveredStatics = deliveredStaticsBase + liveTasksStatics.length;
            const totalDeliveredReels = deliveredReelsBase + liveTasksReels.length;
            const targetStatics = quota.targets["Statics"] || 0;
            const targetReels = quota.targets["Reels"] || 0;
            const totalTarget = targetStatics + targetReels;
            const totalDelivered = totalDeliveredStatics + totalDeliveredReels;
            const efficiency = totalTarget > 0 ? Math.round((totalDelivered / totalTarget) * 100) : 0;

            return {
                id: quota.id,
                brand: quota.brandId,
                designer: quota.assignedDesigner || "Unassigned",
                statics: {
                    target: targetStatics,
                    delivered: totalDeliveredStatics,
                    base: deliveredStaticsBase,
                    live: liveTasksStatics
                },
                reels: {
                    target: targetReels,
                    delivered: totalDeliveredReels,
                    base: deliveredReelsBase,
                    live: liveTasksReels
                },
                total: { target: totalTarget, delivered: totalDelivered },
                efficiency
            };
        }).sort((a, b) => b.total.target - a.total.target);
    }, [tasks, quotas]);

    const totals = useMemo(() => {
        return brandStats.reduce((acc, curr) => ({
            statics: {
                target: acc.statics.target + curr.statics.target,
                delivered: acc.statics.delivered + curr.statics.delivered
            },
            reels: {
                target: acc.reels.target + curr.reels.target,
                delivered: acc.reels.delivered + curr.reels.delivered
            }
        }), {
            statics: { target: 0, delivered: 0 },
            reels: { target: 0, delivered: 0 }
        });
    }, [brandStats]);

    const handleStartEdit = (item: any) => {
        setEditingId(item.id);
        setEditForm({
            brandId: item.brand,
            assignedDesigner: item.designer,
            targets: { Statics: item.statics.target, Reels: item.reels.target },
            delivered: { Statics: item.statics.base, Reels: item.reels.base }
        });
    };

    const handleSaveEdit = async () => {
        if (!editingId) return;
        await updateQuota({
            ...editForm,
            id: editingId,
            scopeId: activeScope
        });
        setEditingId(null);
    };

    const handleAddNew = async () => {
        if (!newBrandForm.brandName.trim()) return;
        const quotaId = `${newBrandForm.brandName.toLowerCase().replace(/\s+/g, '_')}_social_media`;
        await updateQuota({
            id: quotaId,
            brandId: newBrandForm.brandName,
            scopeId: activeScope,
            assignedDesigner: newBrandForm.designer,
            targets: { "Statics": newBrandForm.targetStatics, "Reels": newBrandForm.targetReels },
            delivered: { "Statics": newBrandForm.deliveredStatics, "Reels": newBrandForm.deliveredReels }
        });
        setIsAddingNew(false);
        setNewBrandForm({
            brandName: '', designer: '', targetStatics: 0, targetReels: 0, deliveredStatics: 0, deliveredReels: 0
        });
    };

    const handleDelete = async (id: string, name: string) => {
        if (confirm(`Delete analytics for "${name}"?`)) {
            await deleteQuota(id);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-slate-900">Social Media Scope</h3>
                    <p className="text-sm text-slate-500">Target vs Delivered metrics per brand</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsAddingNew(true)}
                        className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-[16px]">add</span>
                        Add Brand
                    </button>
                    <button
                        onClick={() => seedSocialMediaData()}
                        className="px-3 py-1.5 border border-slate-200 bg-white text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-50 transition-all flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-[16px]">sync</span>
                        Reset Seeds
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-2">
                <CircularProgress
                    value={totals.statics.delivered}
                    total={totals.statics.target}
                    label="Total Statics"
                    color="#137fec"
                />
                <CircularProgress
                    value={totals.reels.delivered}
                    total={totals.reels.target}
                    label="Total Reels"
                    color="#10b981"
                />
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mb-8">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                            <th rowSpan={2} className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-r border-slate-200">Brand</th>
                            <th rowSpan={2} className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-r border-slate-200">Manager</th>
                            <th colSpan={2} className="px-6 py-2 text-center text-[10px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50/50 border-b border-blue-100 border-r border-slate-200">Targets</th>
                            <th colSpan={2} className="px-6 py-2 text-center text-[10px] font-bold text-green-600 uppercase tracking-widest bg-green-50/50 border-b border-green-100 border-r border-slate-200">Delivered</th>
                            <th rowSpan={2} className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Status</th>
                            <th rowSpan={2} className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center border-l border-slate-200">Actions</th>
                        </tr>
                        <tr className="bg-slate-50/50 border-b border-slate-200">
                            <th className="px-6 py-2 text-[10px] font-bold text-slate-400 uppercase text-center border-r border-slate-200 bg-blue-50/30">Statics</th>
                            <th className="px-6 py-2 text-[10px] font-bold text-slate-400 uppercase text-center border-r border-slate-200 bg-blue-50/30">Reels</th>
                            <th className="px-6 py-2 text-[10px] font-bold text-slate-400 uppercase text-center border-r border-slate-200 bg-green-50/30">Statics</th>
                            <th className="px-6 py-2 text-[10px] font-bold text-slate-400 uppercase text-center border-r border-slate-200 bg-green-50/30">Reels</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        <AnimatePresence mode='popLayout'>
                            {brandStats.map((item) => (
                                <motion.tr
                                    layout
                                    key={item.id}
                                    className={cn("hover:bg-slate-50 transition-colors group", editingId === item.id && "bg-blue-50/30")}
                                >
                                    {editingId === item.id ? (
                                        <>
                                            <td className="px-6 py-4 border-r border-slate-100">
                                                <input type="text" value={editForm.brandId} onChange={e => setEditForm(prev => ({ ...prev, brandId: e.target.value }))} className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-sm font-bold" />
                                            </td>
                                            <td className="px-6 py-4 border-r border-slate-100">
                                                <select value={editForm.assignedDesigner} onChange={e => setEditForm(prev => ({ ...prev, assignedDesigner: e.target.value }))} className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-sm">
                                                    <option value="">Unassigned</option>
                                                    {ASSIGNERS.map(name => <option key={name} value={name}>{name}</option>)}
                                                </select>
                                            </td>
                                            <td className="px-6 py-4 border-r border-slate-100 bg-blue-50/5 text-center">
                                                <input type="number" value={editForm.targets?.Statics} onChange={e => setEditForm(prev => ({ ...prev, targets: { ...prev.targets, Statics: parseInt(e.target.value) || 0 } }))} className="w-12 bg-white border border-slate-200 rounded px-1 py-1 text-xs text-center" />
                                            </td>
                                            <td className="px-6 py-4 border-r border-slate-100 bg-blue-50/5 text-center">
                                                <input type="number" value={editForm.targets?.Reels} onChange={e => setEditForm(prev => ({ ...prev, targets: { ...prev.targets, Reels: parseInt(e.target.value) || 0 } }))} className="w-12 bg-white border border-slate-200 rounded px-1 py-1 text-xs text-center" />
                                            </td>
                                            <td className="px-6 py-4 border-r border-slate-100 bg-green-50/5 text-center">
                                                <input type="number" value={editForm.delivered?.Statics} onChange={e => setEditForm(prev => ({ ...prev, delivered: { ...prev.delivered, Statics: parseInt(e.target.value) || 0 } }))} className="w-12 bg-white border border-slate-200 rounded px-1 py-1 text-xs text-center font-bold" />
                                            </td>
                                            <td className="px-6 py-4 border-r border-slate-100 bg-green-50/5 text-center">
                                                <input type="number" value={editForm.delivered?.Reels} onChange={e => setEditForm(prev => ({ ...prev, delivered: { ...prev.delivered, Reels: parseInt(e.target.value) || 0 } }))} className="w-12 bg-white border border-slate-200 rounded px-1 py-1 text-xs text-center font-bold" />
                                            </td>
                                            <td className="px-6 py-4 text-center"><span className="text-[10px] font-bold text-slate-400 italic">Editing</span></td>
                                            <td className="px-6 py-4 text-center border-l border-slate-100">
                                                <div className="flex items-center justify-center gap-1">
                                                    <button onClick={handleSaveEdit} className="p-1 bg-green-500 text-white rounded"><span className="material-symbols-outlined text-[16px]">check</span></button>
                                                    <button onClick={() => setEditingId(null)} className="p-1 bg-slate-200 text-slate-600 rounded"><span className="material-symbols-outlined text-[16px]">close</span></button>
                                                </div>
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            <td className="px-6 py-4 border-r border-slate-100">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors text-sm">{item.brand}</span>
                                                    {new Date().getDate() > 15 && item.efficiency < 50 && (
                                                        <span className="material-symbols-outlined text-red-500 text-[16px] animate-pulse" title="Behind Schedule">warning</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 border-r border-slate-100">
                                                <span className="text-slate-600 text-xs font-medium">{item.designer}</span>
                                            </td>
                                            <td className="px-6 py-4 text-center border-r border-slate-100 bg-blue-50/5"><span className="text-xs font-bold text-slate-700">{item.statics.target || "-"}</span></td>
                                            <td className="px-6 py-4 text-center border-r border-slate-100 bg-blue-50/5"><span className="text-xs font-bold text-slate-700">{item.reels.target || "-"}</span></td>
                                            <td onClick={() => item.statics.live.length > 0 && setViewingTasks({ brand: item.brand, type: "Statics", tasks: item.statics.live })} className={cn("px-6 py-4 text-center border-r border-slate-100 bg-green-50/5 transition-all", item.statics.live.length > 0 && "cursor-pointer hover:bg-green-100")}>
                                                <div className="flex flex-col items-center">
                                                    <span className="text-xs font-bold text-slate-700">{item.statics.delivered || "-"}</span>
                                                    {item.statics.live.length > 0 && <span className="text-[8px] text-green-500 font-bold">+{item.statics.live.length} Live</span>}
                                                </div>
                                            </td>
                                            <td onClick={() => item.reels.live.length > 0 && setViewingTasks({ brand: item.brand, type: "Reels", tasks: item.reels.live })} className={cn("px-6 py-4 text-center border-r border-slate-100 bg-green-50/5 transition-all", item.reels.live.length > 0 && "cursor-pointer hover:bg-green-100")}>
                                                <div className="flex flex-col items-center">
                                                    <span className="text-xs font-bold text-slate-700">{item.reels.delivered || "-"}</span>
                                                    {item.reels.live.length > 0 && <span className="text-[8px] text-green-500 font-bold">+{item.reels.live.length} Live</span>}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex flex-col items-center gap-0.5">
                                                    <div className="w-12 h-1 bg-slate-100 rounded-full overflow-hidden">
                                                        <div className={cn("h-full transition-all duration-1000", item.efficiency >= 50 ? "bg-green-500" : "bg-red-500")} style={{ width: `${Math.min(item.efficiency, 100)}%` }} />
                                                    </div>
                                                    <span className="text-[9px] font-bold text-slate-400">{item.efficiency}%</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center border-l border-slate-100">
                                                <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => handleStartEdit(item)} className="p-1 px-1.5 text-[9px] font-bold text-blue-600 hover:bg-blue-50 rounded transition-colors uppercase">Edit</button>
                                                    <button onClick={() => handleDelete(item.id, item.brand)} className="p-1 px-1.5 text-[9px] font-bold text-red-500 hover:bg-red-50 rounded transition-colors uppercase">Delete</button>
                                                </div>
                                            </td>
                                        </>
                                    )}
                                </motion.tr>
                            ))}
                        </AnimatePresence>

                        {isAddingNew && (
                            <tr className="bg-blue-50">
                                <td className="px-6 py-4 border-r border-blue-100"><input autoFocus placeholder="Brand..." className="w-full bg-white border border-blue-200 rounded px-2 py-1 text-xs font-bold" value={newBrandForm.brandName} onChange={e => setNewBrandForm(prev => ({ ...prev, brandName: e.target.value }))} /></td>
                                <td className="px-6 py-4 border-r border-blue-100">
                                    <select className="w-full bg-white border border-blue-200 rounded px-2 py-1 text-xs" value={newBrandForm.designer} onChange={e => setNewBrandForm(prev => ({ ...prev, designer: e.target.value }))}>
                                        <option value="">Select Manager...</option>
                                        {ASSIGNERS.map(name => <option key={name} value={name}>{name}</option>)}
                                    </select>
                                </td>
                                <td className="px-6 py-4 border-r border-blue-100 bg-blue-100/30 text-center"><input type="number" className="w-10 bg-white border border-blue-200 rounded px-1 py-1 text-xs text-center" value={newBrandForm.targetStatics || ''} onChange={e => setNewBrandForm(prev => ({ ...prev, targetStatics: parseInt(e.target.value) || 0 }))} /></td>
                                <td className="px-6 py-4 border-r border-blue-100 bg-blue-100/30 text-center"><input type="number" className="w-10 bg-white border border-blue-200 rounded px-1 py-1 text-xs text-center" value={newBrandForm.targetReels || ''} onChange={e => setNewBrandForm(prev => ({ ...prev, targetReels: parseInt(e.target.value) || 0 }))} /></td>
                                <td className="px-6 py-4 border-r border-blue-100 bg-green-100/30 text-center"><input type="number" className="w-10 bg-white border border-green-200 rounded px-1 py-1 text-xs text-center" value={newBrandForm.deliveredStatics || ''} onChange={e => setNewBrandForm(prev => ({ ...prev, deliveredStatics: parseInt(e.target.value) || 0 }))} /></td>
                                <td className="px-6 py-4 border-r border-blue-100 bg-green-100/30 text-center"><input type="number" className="w-10 bg-white border border-green-200 rounded px-1 py-1 text-xs text-center" value={newBrandForm.deliveredReels || ''} onChange={e => setNewBrandForm(prev => ({ ...prev, deliveredReels: parseInt(e.target.value) || 0 }))} /></td>
                                <td className="px-6 py-4 text-center"><button onClick={handleAddNew} className="bg-blue-600 text-white px-3 py-1 rounded text-[10px] font-bold uppercase">Add</button></td>
                                <td className="px-6 py-4 text-center border-l border-blue-100"><button onClick={() => setIsAddingNew(false)} className="text-slate-400"><span className="material-symbols-outlined text-[18px]">close</span></button></td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={!!viewingTasks} onClose={() => setViewingTasks(null)} title={`${viewingTasks?.brand} - Submitted ${viewingTasks?.type}`}>
                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                    {viewingTasks?.tasks.map(task => (
                        <div key={task.id} onClick={() => { setSelectedTask(task); setViewingTasks(null); }} className="p-3 bg-slate-50 border border-slate-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer group">
                            <div className="flex justify-between items-start mb-1">
                                <h4 className="font-bold text-slate-900 text-sm group-hover:text-blue-600">{task.title}</h4>
                                <span className="text-[10px] font-bold text-slate-400 bg-white border border-slate-100 px-1.5 py-0.5 rounded uppercase">{format(parseISO(task.date), 'MMM d')}</span>
                            </div>
                            <p className="text-xs text-slate-500 line-clamp-1 italic">{task.description || "No description"}</p>
                            <div className="flex items-center gap-2 mt-2">
                                <div className="size-4 rounded-full bg-blue-100 flex items-center justify-center text-[8px] font-bold text-blue-600">{task.assignedBy?.[0] || "A"}</div>
                                <span className="text-[10px] text-slate-400 font-medium">Assigned by {task.assignedBy}</span>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-6 flex justify-end">
                    <button onClick={() => setViewingTasks(null)} className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-900">Close</button>
                </div>
            </Modal>
        </div>
    );
};
