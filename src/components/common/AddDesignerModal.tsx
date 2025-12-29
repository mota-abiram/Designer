import { useState } from 'react';
import { useTaskContext } from '../../context/TaskContext';
import { Modal } from './Modal';
import toast from 'react-hot-toast';

export const AddDesignerModal = () => {
    const { isAddDesignerOpen, setAddDesignerOpen } = useTaskContext();
    const [name, setName] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            // Note: Designer management is currently hardcoded in mockData.ts
            // This modal is a placeholder for future functionality
            toast.error('Designer management requires code update. Contact admin.');
            setName('');
            setAddDesignerOpen(false);
        }
    };

    return (
        <Modal
            isOpen={isAddDesignerOpen}
            onClose={() => setAddDesignerOpen(false)}
            title="Add New Member"
        >
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                    <label className="block text-[10px] font-black text-text-muted dark:text-text-muted-dark uppercase tracking-widest mb-2 px-1">Designer Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Alex"
                        autoFocus
                        className="w-full bg-gray-50 dark:bg-slate-800/50 border border-border-light dark:border-border-dark rounded-xl px-4 py-3 text-text-main dark:text-text-main-dark font-black placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-primary transition-all shadow-inner"
                    />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-amber-500 bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
                    Note: Adding new designers requires updating the codebase. Please contact your admin.
                </p>
                <div className="flex justify-end gap-3 mt-4">
                    <button
                        type="button"
                        onClick={() => setAddDesignerOpen(false)}
                        className="px-6 py-2.5 text-xs font-black uppercase tracking-widest text-text-muted dark:text-text-muted-dark hover:text-text-main dark:hover:text-text-main-dark transition-colors"
                    >
                        Close
                    </button>
                </div>
            </form>
        </Modal>
    );
};
