import { useState } from 'react';
import { useTaskContext } from '../../context/TaskContext';
import { Modal } from './Modal';

export const AddDesignerModal = () => {
    const { isAddDesignerOpen, setAddDesignerOpen, addDesigner } = useTaskContext();
    const [name, setName] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            addDesigner(name.trim());
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
                    <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">Designer Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Alex"
                        autoFocus
                        className="w-full bg-surface-dark border border-border-dark rounded-lg px-3 py-2 text-text-main placeholder-gray-400 focus:outline-none focus:border-primary transition-colors"
                    />
                </div>
                <div className="flex justify-end gap-3 mt-2">
                    <button
                        type="button"
                        onClick={() => setAddDesignerOpen(false)}
                        className="px-4 py-2 text-sm font-bold text-text-muted hover:text-text-main transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={!name.trim()}
                        className="px-4 py-2 text-sm font-bold bg-primary text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Add Member
                    </button>
                </div>
            </form>
        </Modal>
    );
};
