
import { useTaskContext } from '../../context/TaskContext';
import { cn } from '../../utils/cn';

export const DesignerTabs = () => {
    const { designers, activeDesignerId, setActiveDesignerId, setAddDesignerOpen } = useTaskContext();

    return (
        <div className="flex-none bg-background-dark pt-4 px-6 border-b border-border-dark">
            <div className="flex gap-8 overflow-x-auto no-scrollbar">
                {designers.map((designer) => {
                    const isActive = designer.id === activeDesignerId;
                    return (
                        <button
                            key={designer.id}
                            onClick={() => setActiveDesignerId(designer.id)}
                            className={cn(
                                "group flex flex-col items-center justify-center border-b-[3px] pb-3 min-w-[80px] cursor-pointer transition-colors",
                                isActive ? "border-primary" : "border-transparent hover:border-border-dark"
                            )}
                        >
                            <p className={cn(
                                "text-sm font-bold tracking-wide transition-colors",
                                isActive ? "text-white group-hover:text-primary" : "text-[#92adc9] group-hover:text-white"
                            )}>
                                {designer.name}
                            </p>
                        </button>
                    );
                })}

                <button
                    onClick={() => setAddDesignerOpen(true)}
                    className="group flex flex-col items-center justify-center border-b-[3px] border-transparent hover:border-border-dark pb-3 min-w-[80px] cursor-pointer"
                >
                    <div className="flex items-center gap-1 text-[#92adc9] group-hover:text-primary">
                        <span className="material-symbols-outlined text-sm font-bold">add</span>
                        <span className="text-sm font-bold tracking-wide">Add Member</span>
                    </div>
                </button>
            </div>
        </div>
    );
};
