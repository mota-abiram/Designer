import { useState } from 'react';
import { useTaskContext } from '../context/TaskContext';
import { Header } from '../components/layout/Header';
import { motion } from 'framer-motion';

export const Categories = () => {
    const {
        brands, addBrand, deleteBrand,
        creativeTypes, addCreativeType, deleteCreativeType,
        scopes, addScope, deleteScope
    } = useTaskContext();


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

    return (
        <div className="flex flex-col h-screen bg-background-light dark:bg-background-dark text-text-main font-display overflow-hidden">
            <Header />

            <main className="flex-1 overflow-y-auto p-6 md:p-8">
                <div className="max-w-5xl mx-auto space-y-12">
                    <header className="flex flex-col gap-2">
                        <h1 className="text-3xl font-bold tracking-tight text-text-main">Categories Management</h1>
                        <p className="text-text-muted">Manage brands, creative types, and scopes used in tasks.</p>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Brands Section */}
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white/50 dark:bg-surface-dark/50 backdrop-blur-xl border border-border-dark rounded-3xl p-6 shadow-sm flex flex-col gap-6"
                        >
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary p-2 bg-primary/10 rounded-xl">sell</span>
                                <h2 className="text-xl font-bold">Brands</h2>
                            </div>

                            <form onSubmit={handleAddBrand} className="flex gap-2">
                                <input
                                    type="text"
                                    value={newBrand}
                                    onChange={(e) => setNewBrand(e.target.value)}
                                    placeholder="Add new brand..."
                                    className="flex-1 bg-surface-dark/50 border border-border-dark rounded-xl px-4 py-2.5 text-text-main focus:outline-none focus:border-primary transition-all shadow-inner"
                                />
                                <button
                                    type="submit"
                                    disabled={!newBrand.trim()}
                                    className="bg-primary hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-primary/20 flex items-center justify-center"
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
                                                className="group flex items-center justify-between bg-surface-dark/30 hover:bg-surface-dark/80 border border-transparent hover:border-border-dark/50 rounded-xl px-4 py-3 transition-all"
                                            >
                                                <span className="font-semibold text-sm tracking-wide">{brand.name}</span>
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
                            className="bg-white/50 dark:bg-surface-dark/50 backdrop-blur-xl border border-border-dark rounded-3xl p-6 shadow-sm flex flex-col gap-6"
                        >
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-purple-500 p-2 bg-purple-500/10 rounded-xl">category</span>
                                <h2 className="text-xl font-bold">Types</h2>
                            </div>

                            <form onSubmit={handleAddType} className="flex gap-2">
                                <input
                                    type="text"
                                    value={newType}
                                    onChange={(e) => setNewType(e.target.value)}
                                    placeholder="Add type..."
                                    className="flex-1 bg-surface-dark/50 border border-border-dark rounded-xl px-4 py-2.5 text-text-main focus:outline-none focus:border-primary transition-all shadow-inner"
                                />
                                <button
                                    type="submit"
                                    disabled={!newType.trim()}
                                    className="bg-purple-500 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-purple-500/20 flex items-center justify-center"
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
                                                className="group flex items-center justify-between bg-surface-dark/30 hover:bg-surface-dark/80 border border-transparent hover:border-border-dark/50 rounded-xl px-4 py-3 transition-all"
                                            >
                                                <span className="font-semibold text-sm tracking-wide">{type.name}</span>
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
                            className="bg-white/50 dark:bg-surface-dark/50 backdrop-blur-xl border border-border-dark rounded-3xl p-6 shadow-sm flex flex-col gap-6"
                        >
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-green-500 p-2 bg-green-500/10 rounded-xl">scope</span>
                                <h2 className="text-xl font-bold">Scopes</h2>
                            </div>

                            <form onSubmit={handleAddScope} className="flex gap-2">
                                <input
                                    type="text"
                                    value={newScope}
                                    onChange={(e) => setNewScope(e.target.value)}
                                    placeholder="Add scope..."
                                    className="flex-1 bg-surface-dark/50 border border-border-dark rounded-xl px-4 py-2.5 text-text-main focus:outline-none focus:border-primary transition-all shadow-inner"
                                />
                                <button
                                    type="submit"
                                    disabled={!newScope.trim()}
                                    className="bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-green-500/20 flex items-center justify-center"
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
                                                className="group flex items-center justify-between bg-surface-dark/30 hover:bg-surface-dark/80 border border-transparent hover:border-border-dark/50 rounded-xl px-4 py-3 transition-all"
                                            >
                                                <span className="font-semibold text-sm tracking-wide">{scope.name}</span>
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
                </div>
            </main>
        </div>
    );
};
