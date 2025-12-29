
import { useTaskContext } from '../../context/TaskContext';
import { cn } from '../../utils/cn';

export const DesignerTabs = () => {
    const { designers, activeDesignerId, setActiveDesignerId, setAddDesignerOpen } = useTaskContext();

    return (
        <div className="flex-none bg-background-light dark:bg-background-dark pt-4 px-6 border-b border-border-light dark:border-border-dark transition-colors">
            <div className="flex gap-8 overflow-x-auto no-scrollbar">
                {designers.map((designer) => {
                    const isActive = designer.id === activeDesignerId;
                    return (
                        <button
                            key={designer.id}
                            onClick={() => setActiveDesignerId(designer.id)}
                            className={cn(
                                "group flex flex-col items-center justify-center border-b-[3px] pb-3 min-w-[80px] cursor-pointer transition-colors",
                                isActive ? "border-primary" : "border-transparent hover:border-border-light dark:hover:border-border-dark"
                            )}
                        >
                            <p className={cn(
                                "text-sm font-black tracking-wide transition-colors",
                                isActive ? "text-text-main dark:text-text-main-dark group-hover:text-primary" : "text-text-muted dark:text-text-muted-dark group-hover:text-text-main dark:group-hover:text-text-main-dark"
                            )}>
                                {designer.name}
                            </p>
                        </button>
                    );
                })}

                <button
                    onClick={() => setAddDesignerOpen(true)}
                    className="group flex flex-col items-center justify-center border-b-[3px] border-transparent hover:border-border-light dark:hover:border-border-dark pb-3 min-w-[120px] cursor-pointer transition-colors"
                >
                    <div className="flex items-center gap-1 text-text-muted dark:text-text-muted-dark group-hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-[18px] font-black">add</span>
                        <span className="text-sm font-black uppercase tracking-widest">Add Member</span>
                    </div>
                </button>
            </div>
        </div>
    );
};
