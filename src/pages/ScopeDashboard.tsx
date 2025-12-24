import { useMemo, useState } from 'react';
import { useTaskContext } from '../context/TaskContext';
import { Layout } from '../components/layout/Layout';
import { cn } from '../utils/cn';
import { motion, AnimatePresence } from 'framer-motion';
import type { BrandQuota } from '../types';

export const ScopeDashboard = () => {
    const { tasks, quotas, updateQuota, deleteQuota, seedSocialMediaData, role } = useTaskContext();

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

    const activeScope = "Social Media";

    const brandStats = useMemo(() => {
        const scopeQuotas = quotas.filter(q => q.scopeId === activeScope);

        return scopeQuotas.map(quota => {
            const deliveredStatics = quota.delivered?.["Statics"] ?? tasks.filter(t => t.brand === quota.brandId && t.creativeType === "Statics" && t.status === "Submitted").length;
            const deliveredReels = quota.delivered?.["Reels"] ?? tasks.filter(t => t.brand === quota.brandId && t.creativeType === "Reels" && t.status === "Submitted").length;

            const targetStatics = quota.targets["Statics"] || 0;
            const targetReels = quota.targets["Reels"] || 0;

            const totalTarget = targetStatics + targetReels;
            const totalDelivered = deliveredStatics + deliveredReels;

            const efficiency = totalTarget > 0 ? Math.round((totalDelivered / totalTarget) * 100) : 0;

            return {
                id: quota.id,
                brand: quota.brandId,
                designer: quota.assignedDesigner || "Unassigned",
                statics: { target: targetStatics, delivered: deliveredStatics },
                reels: { target: targetReels, delivered: deliveredReels },
                total: { target: totalTarget, delivered: totalDelivered },
                efficiency
            };
        }).sort((a, b) => b.total.target - a.total.target);
    }, [tasks, quotas]);

    const handleStartEdit = (item: any) => {
        setEditingId(item.id);
        setEditForm({
            brandId: item.brand,
            assignedDesigner: item.designer,
            targets: { Statics: item.statics.target, Reels: item.reels.target },
            delivered: { Statics: item.statics.delivered, Reels: item.reels.delivered }
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
            targets: {
                "Statics": newBrandForm.targetStatics,
                "Reels": newBrandForm.targetReels
            },
            delivered: {
                "Statics": newBrandForm.deliveredStatics,
                "Reels": newBrandForm.deliveredReels
            }
        });

        setIsAddingNew(false);
        setNewBrandForm({
            brandName: '',
            designer: '',
            targetStatics: 0,
            targetReels: 0,
            deliveredStatics: 0,
            deliveredReels: 0
        });
    };

    const handleDelete = async (id: string, name: string) => {
        if (confirm(`Delete analytics for "${name}"?`)) {
            await deleteQuota(id);
        }
    };

    return (
        <Layout>
            <div className="flex flex-col h-full bg-[#f8fafc] overflow-hidden">
                <div className="flex-none px-8 py-6 border-b border-gray-200 bg-white shadow-sm z-10 flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded uppercase tracking-wider">Social Media</span>
                            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Scope Dashboard</h1>
                        </div>
                        <p className="text-sm text-slate-500">Tracking Statics & Reels distribution per Brand</p>
                    </div>
                    <div className="flex gap-3">
                        {role === 'Manager' && (
                            <>
                                <button
                                    onClick={() => setIsAddingNew(true)}
                                    className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-[18px]">add</span>
                                    Add Brand
                                </button>
                                <button
                                    onClick={() => seedSocialMediaData()}
                                    className="px-4 py-2 border border-slate-200 bg-white text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-50 transition-all flex items-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-[18px]">sync</span>
                                    Reset Seeds
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <div className="flex-1 overflow-auto p-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mb-8">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200">
                                        <th rowSpan={2} className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest border-r border-slate-200">Brand Name</th>
                                        <th rowSpan={2} className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest border-r border-slate-200">Assigned Designer</th>
                                        <th colSpan={2} className="px-6 py-2 text-center text-[10px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50/50 border-b border-blue-100 border-r border-slate-200">Targets</th>
                                        <th colSpan={2} className="px-6 py-2 text-center text-[10px] font-bold text-green-600 uppercase tracking-widest bg-green-50/50 border-b border-green-100 border-r border-slate-200">Delivered</th>
                                        <th rowSpan={2} className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">Status</th>
                                        {role === 'Manager' && <th rowSpan={2} className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center border-l border-slate-200">Actions</th>}
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
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                key={item.id}
                                                className={cn("hover:bg-slate-50 transition-colors group", editingId === item.id && "bg-blue-50/30")}
                                            >
                                                {editingId === item.id ? (
                                                    /* EDIT MODE */
                                                    <>
                                                        <td className="px-6 py-4 border-r border-slate-100">
                                                            <input
                                                                type="text"
                                                                value={editForm.brandId}
                                                                onChange={e => setEditForm(prev => ({ ...prev, brandId: e.target.value }))}
                                                                className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-sm font-bold focus:outline-none focus:border-blue-500"
                                                            />
                                                        </td>
                                                        <td className="px-6 py-4 border-r border-slate-100">
                                                            <input
                                                                type="text"
                                                                value={editForm.assignedDesigner}
                                                                onChange={e => setEditForm(prev => ({ ...prev, assignedDesigner: e.target.value }))}
                                                                placeholder="e.g. Veda"
                                                                className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500"
                                                            />
                                                        </td>
                                                        <td className="px-6 py-4 border-r border-slate-100 bg-blue-50/5">
                                                            <input
                                                                type="number"
                                                                value={editForm.targets?.Statics}
                                                                onChange={e => setEditForm(prev => ({ ...prev, targets: { ...prev.targets, Statics: parseInt(e.target.value) || 0 } }))}
                                                                className="w-16 mx-auto bg-white border border-slate-200 rounded px-2 py-1 text-sm text-center focus:outline-none focus:border-blue-500"
                                                            />
                                                        </td>
                                                        <td className="px-6 py-4 border-r border-slate-100 bg-blue-50/5">
                                                            <input
                                                                type="number"
                                                                value={editForm.targets?.Reels}
                                                                onChange={e => setEditForm(prev => ({ ...prev, targets: { ...prev.targets, Reels: parseInt(e.target.value) || 0 } }))}
                                                                className="w-16 mx-auto bg-white border border-slate-200 rounded px-2 py-1 text-sm text-center focus:outline-none focus:border-blue-500"
                                                            />
                                                        </td>
                                                        <td className="px-6 py-4 border-r border-slate-100 bg-green-50/5">
                                                            <input
                                                                type="number"
                                                                value={editForm.delivered?.Statics}
                                                                onChange={e => setEditForm(prev => ({ ...prev, delivered: { ...prev.delivered, Statics: parseInt(e.target.value) || 0 } }))}
                                                                className="w-16 mx-auto bg-white border border-slate-200 rounded px-2 py-1 text-sm text-center focus:outline-none focus:border-blue-500 font-bold"
                                                            />
                                                        </td>
                                                        <td className="px-6 py-4 border-r border-slate-100 bg-green-50/5">
                                                            <input
                                                                type="number"
                                                                value={editForm.delivered?.Reels}
                                                                onChange={e => setEditForm(prev => ({ ...prev, delivered: { ...prev.delivered, Reels: parseInt(e.target.value) || 0 } }))}
                                                                className="w-16 mx-auto bg-white border border-slate-200 rounded px-2 py-1 text-sm text-center focus:outline-none focus:border-blue-500 font-bold"
                                                            />
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <span className="text-xs font-bold text-slate-400 italic">Editing...</span>
                                                        </td>
                                                        <td className="px-6 py-4 text-center border-l border-slate-100">
                                                            <div className="flex items-center justify-center gap-2">
                                                                <button onClick={handleSaveEdit} className="p-1.5 bg-green-500 text-white rounded hover:bg-green-600 shadow-sm transition-colors">
                                                                    <span className="material-symbols-outlined text-[18px]">check</span>
                                                                </button>
                                                                <button onClick={() => setEditingId(null)} className="p-1.5 bg-slate-200 text-slate-600 rounded hover:bg-slate-300 transition-colors">
                                                                    <span className="material-symbols-outlined text-[18px]">close</span>
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </>
                                                ) : (
                                                    /* VIEW MODE */
                                                    <>
                                                        <td className="px-6 py-4 border-r border-slate-100">
                                                            <span className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{item.brand}</span>
                                                        </td>
                                                        <td className="px-6 py-4 border-r border-slate-100">
                                                            <div className="flex items-center gap-2">
                                                                <div className="size-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400">
                                                                    {item.designer?.[0] || "?"}
                                                                </div>
                                                                <span className="text-slate-600 text-sm font-medium">{item.designer}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-center border-r border-slate-100 bg-blue-50/5">
                                                            <span className={cn("text-sm font-bold", item.statics.target > 0 ? "text-slate-700" : "text-slate-300")}>
                                                                {item.statics.target || "-"}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-center border-r border-slate-100 bg-blue-50/5">
                                                            <span className={cn("text-sm font-bold", item.reels.target > 0 ? "text-slate-700" : "text-slate-300")}>
                                                                {item.reels.target || "-"}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-center border-r border-slate-100 bg-green-50/5">
                                                            <span className={cn("text-sm font-bold",
                                                                item.statics.delivered >= item.statics.target && item.statics.target > 0 ? "text-green-600" :
                                                                    item.statics.delivered > 0 ? "text-slate-700" : "text-slate-300"
                                                            )}>
                                                                {item.statics.delivered || "-"}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-center border-r border-slate-100 bg-green-50/5">
                                                            <span className={cn("text-sm font-bold",
                                                                item.reels.delivered >= item.reels.target && item.reels.target > 0 ? "text-green-600" :
                                                                    item.reels.delivered > 0 ? "text-slate-700" : "text-slate-300"
                                                            )}>
                                                                {item.reels.delivered || "-"}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <div className="flex flex-col items-center gap-1">
                                                                <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden">
                                                                    <div
                                                                        className={cn(
                                                                            "h-full transition-all duration-1000",
                                                                            item.efficiency >= 100 ? "bg-green-500" :
                                                                                item.efficiency >= 50 ? "bg-blue-500" : "bg-amber-500"
                                                                        )}
                                                                        style={{ width: `${Math.min(item.efficiency, 100)}%` }}
                                                                    />
                                                                </div>
                                                                <span className="text-[10px] font-bold text-slate-400">{item.efficiency}%</span>
                                                            </div>
                                                        </td>
                                                        {role === 'Manager' && (
                                                            <td className="px-6 py-4 text-center border-l border-slate-100">
                                                                <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <button onClick={() => handleStartEdit(item)} className="p-1 px-2 text-[10px] font-bold text-blue-600 hover:bg-blue-50 rounded transition-colors uppercase">Edit</button>
                                                                    <button onClick={() => handleDelete(item.id, item.brand)} className="p-1 px-2 text-[10px] font-bold text-red-500 hover:bg-red-50 rounded transition-colors uppercase">Delete</button>
                                                                </div>
                                                            </td>
                                                        )}
                                                    </>
                                                )}
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>

                                    {isAddingNew && (
                                        <tr className="bg-blue-50 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <td className="px-6 py-4 border-r border-blue-100">
                                                <input
                                                    autoFocus
                                                    placeholder="Brand Name..."
                                                    className="w-full bg-white border border-blue-200 rounded px-2 py-1 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                                    value={newBrandForm.brandName}
                                                    onChange={e => setNewBrandForm(prev => ({ ...prev, brandName: e.target.value }))}
                                                />
                                            </td>
                                            <td className="px-6 py-4 border-r border-blue-100">
                                                <input
                                                    placeholder="Designer..."
                                                    className="w-full bg-white border border-blue-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                                    value={newBrandForm.designer}
                                                    onChange={e => setNewBrandForm(prev => ({ ...prev, designer: e.target.value }))}
                                                />
                                            </td>
                                            <td className="px-6 py-4 border-r border-blue-100 bg-blue-100/30">
                                                <input
                                                    type="number"
                                                    placeholder="0"
                                                    className="w-16 mx-auto bg-white border border-blue-200 rounded px-2 py-1 text-sm text-center"
                                                    value={newBrandForm.targetStatics || ''}
                                                    onChange={e => setNewBrandForm(prev => ({ ...prev, targetStatics: parseInt(e.target.value) || 0 }))}
                                                />
                                            </td>
                                            <td className="px-6 py-4 border-r border-blue-100 bg-blue-100/30">
                                                <input
                                                    type="number"
                                                    placeholder="0"
                                                    className="w-16 mx-auto bg-white border border-blue-200 rounded px-2 py-1 text-sm text-center"
                                                    value={newBrandForm.targetReels || ''}
                                                    onChange={e => setNewBrandForm(prev => ({ ...prev, targetReels: parseInt(e.target.value) || 0 }))}
                                                />
                                            </td>
                                            <td className="px-6 py-4 border-r border-blue-100 bg-green-100/30">
                                                <input
                                                    type="number"
                                                    placeholder="0"
                                                    className="w-16 mx-auto bg-white border border-green-200 rounded px-2 py-1 text-sm text-center font-bold"
                                                    value={newBrandForm.deliveredStatics || ''}
                                                    onChange={e => setNewBrandForm(prev => ({ ...prev, deliveredStatics: parseInt(e.target.value) || 0 }))}
                                                />
                                            </td>
                                            <td className="px-6 py-4 border-r border-blue-100 bg-green-100/30">
                                                <input
                                                    type="number"
                                                    placeholder="0"
                                                    className="w-16 mx-auto bg-white border border-green-200 rounded px-2 py-1 text-sm text-center font-bold"
                                                    value={newBrandForm.deliveredReels || ''}
                                                    onChange={e => setNewBrandForm(prev => ({ ...prev, deliveredReels: parseInt(e.target.value) || 0 }))}
                                                />
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    onClick={handleAddNew}
                                                    className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-700 shadow-md shadow-blue-500/20"
                                                >
                                                    Add Row
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 text-center border-l border-blue-100">
                                                <button onClick={() => setIsAddingNew(false)} className="text-slate-400 hover:text-slate-600">
                                                    <span className="material-symbols-outlined">close</span>
                                                </button>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {brandStats.length === 0 && !isAddingNew && (
                            <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-4">
                                <span className="material-symbols-outlined text-6xl opacity-20">dataset</span>
                                <div className="text-center">
                                    <p className="font-bold text-slate-900">No Data Available</p>
                                    <p className="text-sm">Click 'Add Brand' to start tracking social media scope.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};
