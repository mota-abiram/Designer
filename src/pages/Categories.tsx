import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTaskContext } from '../context/TaskContext';
import { Header } from '../components/layout/Header';
import { ADMIN_EMAILS } from '../services/adminList';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export const Categories = () => {
    const {
        brands, addBrand, deleteBrand,
        creativeTypes, addCreativeType, deleteCreativeType,
        scopes, addScope, deleteScope,
        seedSocialMediaData
    } = useTaskContext();
    const { user } = useAuth();

    const isAdmin = user?.email ? ADMIN_EMAILS.includes(user.email) : false;

    const [newBrand, setNewBrand] = useState('');
    const [newType, setNewType] = useState('');
    const [newScope, setNewScope] = useState('');

    const handleAddBrand = (e: React.FormEvent) => {
        e.preventDefault();
        if (newBrand.trim()) {
            addBrand(newBrand.trim());
            setNewBrand('');
        }
    };

    const handleAddType = (e: React.FormEvent) => {
        e.preventDefault();
        if (newType.trim()) {
            addCreativeType(newType.trim());
            setNewType('');
        }
    };

    const handleAddScope = (e: React.FormEvent) => {
        e.preventDefault();
        if (newScope.trim()) {
            addScope(newScope.trim());
            setNewScope('');
        }
    };

    const handleSeed = async () => {
        if (!confirm('Are you sure you want to reset and seed the database? This is irreversible.')) return;

        try {
            await seedSocialMediaData();
            toast.success('Database seeded successfully!');
        } catch (error) {
            toast.error('Failed to seed database.');
            console.error(error);
        }
    }

    return (
        <div className="flex flex-col h-screen bg-background-light dark:bg-background-dark text-text-main font-display overflow-hidden">
            <Header />

            <main className="flex-1 overflow-y-auto p-6 md:p-8">
                <div className="max-w-6xl mx-auto space-y-12">
                    <header className="flex flex-col gap-2">
                        <h1 className="text-4xl font-bold tracking-tight text-text-main dark:text-text-main-dark">Client Onboarding</h1>
                        <p className="text-lg font-semibold text-text-muted dark:text-text-muted-dark opacity-80">Manage brands, creative types, and scopes for your design workflow.</p>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Brands Section */}
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-3xl p-8 shadow-sm flex flex-col gap-6 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary p-2 bg-primary/10 rounded-xl font-bold">sell</span>
                                <h2 className="text-2xl font-bold dark:text-text-main-dark">Brands</h2>
                            </div>

                            <form onSubmit={handleAddBrand} className="flex gap-2">
                                <input
                                    type="text"
                                    value={newBrand}
                                    onChange={(e) => setNewBrand(e.target.value)}
                                    placeholder="Add new brand..."
                                    className="flex-1 bg-gray-50 dark:bg-slate-800/50 border border-border-light dark:border-border-dark rounded-xl px-4 py-3 text-text-main dark:text-text-main-dark font-semibold focus:outline-none focus:border-primary transition-all shadow-inner"
                                />
                                <button
                                    type="submit"
                                    disabled={!newBrand.trim()}
                                    className="bg-primary hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-primary/20 flex items-center justify-center uppercase tracking-widest text-xs"
                                >
                                    <span className="material-symbols-outlined text-[20px]">add</span>
                                </button>
                            </form>

                            <div className="flex flex-col gap-2">
                                {brands.length === 0 ? (
                                    <div className="text-center py-10 text-text-muted opacity-50 flex flex-col items-center gap-2">
                                        <span className="material-symbols-outlined text-4xl">inventory_2</span>
                                        <p className="text-sm">No brands added yet</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                        {brands.map((brand) => (
                                            <motion.div
                                                layout
                                                key={brand.id}
                                                className="group flex items-center justify-between bg-gray-50 dark:bg-slate-800/30 hover:bg-white dark:hover:bg-slate-800 border border-border-light/50 dark:border-border-dark rounded-xl px-4 py-4 transition-all"
                                            >
                                                <span className="font-bold text-sm tracking-widest uppercase text-text-main dark:text-text-main-dark">{brand.name}</span>
                                                <button
                                                    onClick={() => {
                                                        if (confirm(`Delete brand "${brand.name}"?`)) deleteBrand(brand.id);
                                                    }}
                                                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/10 text-text-muted hover:text-red-500 rounded-lg transition-all"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">delete</span>
                                                </button>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.section>

                        {/* Creative Types Section */}

                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-3xl p-8 shadow-sm flex flex-col gap-6 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-purple-500 p-2 bg-purple-500/10 rounded-xl font-bold">category</span>
                                <h2 className="text-2xl font-bold dark:text-text-main-dark">Types</h2>
                            </div>

                            <form onSubmit={handleAddType} className="flex gap-2">
                                <input
                                    type="text"
                                    value={newType}
                                    onChange={(e) => setNewType(e.target.value)}
                                    placeholder="Add type..."
                                    className="flex-1 bg-gray-50 dark:bg-slate-800/50 border border-border-light dark:border-border-dark rounded-xl px-4 py-3 text-text-main dark:text-text-main-dark font-semibold focus:outline-none focus:border-purple-500 transition-all shadow-inner"
                                />
                                <button
                                    type="submit"
                                    disabled={!newType.trim()}
                                    className="bg-purple-500 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-purple-500/20 flex items-center justify-center uppercase tracking-widest text-xs"
                                >
                                    <span className="material-symbols-outlined text-[20px]">add</span>
                                </button>
                            </form>

                            <div className="flex flex-col gap-2">
                                {creativeTypes.length === 0 ? (
                                    <div className="text-center py-10 text-text-muted opacity-50 flex flex-col items-center gap-2">
                                        <span className="material-symbols-outlined text-4xl">inventory_2</span>
                                        <p className="text-sm">No types added yet.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                        {creativeTypes.map((type) => (
                                            <motion.div
                                                layout
                                                key={type.id}
                                                className="group flex items-center justify-between bg-gray-50 dark:bg-slate-800/30 hover:bg-white dark:hover:bg-slate-800 border border-border-light/50 dark:border-border-dark rounded-xl px-4 py-4 transition-all"
                                            >
                                                <span className="font-bold text-sm tracking-widest uppercase text-text-main dark:text-text-main-dark">{type.name}</span>
                                                <button
                                                    onClick={() => {
                                                        if (confirm(`Delete creative type "${type.name}"?`)) deleteCreativeType(type.id);
                                                    }}
                                                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/10 text-text-muted hover:text-red-500 rounded-lg transition-all"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">delete</span>
                                                </button>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.section>

                        {/* Scopes Section */}
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-3xl p-8 shadow-sm flex flex-col gap-6 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-green-500 p-2 bg-green-500/10 rounded-xl font-bold">scope</span>
                                <h2 className="text-2xl font-bold dark:text-text-main-dark">Scopes</h2>
                            </div>

                            <form onSubmit={handleAddScope} className="flex gap-2">
                                <input
                                    type="text"
                                    value={newScope}
                                    onChange={(e) => setNewScope(e.target.value)}
                                    placeholder="Add scope..."
                                    className="flex-1 bg-gray-50 dark:bg-slate-800/50 border border-border-light dark:border-border-dark rounded-xl px-4 py-3 text-text-main dark:text-text-main-dark font-semibold focus:outline-none focus:border-green-500 transition-all shadow-inner"
                                />
                                <button
                                    type="submit"
                                    disabled={!newScope.trim()}
                                    className="bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-green-500/20 flex items-center justify-center uppercase tracking-widest text-xs"
                                >
                                    <span className="material-symbols-outlined text-[20px]">add</span>
                                </button>
                            </form>

                            <div className="flex flex-col gap-2">
                                {scopes.length === 0 ? (
                                    <div className="text-center py-10 text-text-muted opacity-50 flex flex-col items-center gap-2">
                                        <span className="material-symbols-outlined text-4xl">inventory_2</span>
                                        <p className="text-sm">No scopes added yet.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                        {scopes.map((scope) => (
                                            <motion.div
                                                layout
                                                key={scope.id}
                                                className="group flex items-center justify-between bg-gray-50 dark:bg-slate-800/30 hover:bg-white dark:hover:bg-slate-800 border border-border-light/50 dark:border-border-dark rounded-xl px-4 py-4 transition-all"
                                            >
                                                <span className="font-bold text-sm tracking-widest uppercase text-text-main dark:text-text-main-dark">{scope.name}</span>
                                                <button
                                                    onClick={() => {
                                                        if (confirm(`Delete scope "${scope.name}"?`)) deleteScope(scope.id);
                                                    }}
                                                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/10 text-text-muted hover:text-red-500 rounded-lg transition-all"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">delete</span>
                                                </button>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.section>
                    </div>

                    {isAdmin && (
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-red-900/10 border border-red-500/20 rounded-3xl p-8 shadow-sm flex flex-col gap-6"
                        >
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-red-500 p-2 bg-red-500/10 rounded-xl font-bold">warning</span>
                                <h2 className="text-2xl font-bold text-red-500">Danger Zone</h2>
                            </div>
                            <p className="text-red-500/80 font-semibold">
                                These actions are destructive and cannot be undone.
                            </p>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={handleSeed}
                                    className="bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-red-500/20 flex items-center justify-center uppercase tracking-widest text-sm gap-2"
                                >
                                    <span className="material-symbols-outlined text-[20px]">bolt</span>
                                    <span>Reset Seed Data</span>
                                </button>
                            </div>
                        </motion.section>
                    )}
                </div>
            </main>
        </div>
    );
};
