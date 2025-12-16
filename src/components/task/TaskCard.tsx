import type { Task } from '../../types';
import { cn } from '../../utils/cn';
import { useTaskContext } from '../../context/TaskContext';

export const TaskCard = ({ task }: { task: Task }) => {
    const { setSelectedTask, viewMode } = useTaskContext();

    const statusColors = {
        Pending: {
            border: 'border-red-500',
            badge: 'bg-red-500/10 text-red-500 border-red-500/20',
            dot: 'bg-red-500',
            icon: null
        },
        Submitted: {
            border: 'border-green-500',
            badge: 'bg-green-500/10 text-green-500 border-green-500/20',
            dot: 'bg-green-500',
            icon: 'check'
        }
    };

    const currentStyle = statusColors[task.status];
    const isCompact = viewMode === 'compact';

    return (
        <div
            onClick={() => setSelectedTask(task)}
            className={cn(
                "group relative flex flex-col rounded-lg bg-white border border-gray-200 border-l-4 hover:bg-gray-50 transition-all cursor-pointer shadow-sm hover:shadow-md mb-2",
                currentStyle.border,
                isCompact ? "p-2 gap-1" : "p-3 gap-2 mb-3"
            )}
        >
            <div className="flex flex-col gap-1">
                <div className="flex justify-between items-start gap-2">
                    <h3 className={cn("font-bold text-text-main leading-snug break-words", isCompact ? "text-xs" : "text-sm pr-2")}>{task.title}</h3>
                    {/* In compact mode, show status icon/dot nicely aligned top right if space permits, OR just rely on border color */}
                </div>
                {!isCompact && (
                    <p className="text-xs text-text-muted leading-relaxed line-clamp-3">
                        {task.description.split(/(https?:\/\/[^\s]+)/g).map((part, i) => (
                            part.match(/(https?:\/\/[^\s]+)/g) ? (
                                <a
                                    key={i}
                                    href={part}
                                    target="_blank"
                                    rel="noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="text-blue-500 hover:underline relative z-10"
                                >
                                    {part}
                                </a>
                            ) : part
                        ))}
                    </p>
                )}
            </div>

            <div className={cn("flex items-center justify-between", !isCompact && "mt-2 pt-2 border-t border-border-dark/50")}>
                {isCompact ? (
                    <div className="flex items-center gap-2 w-full justify-between mt-1">
                        <span className={cn("inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold border", currentStyle.badge)}>
                            {task.status}
                        </span>
                        {task.requestorAvatar && (
                            <div
                                className="size-4 rounded-full bg-cover bg-center"
                                style={{ backgroundImage: `url("${task.requestorAvatar}")` }}
                                title="Requestor"
                            ></div>
                        )}
                    </div>
                ) : (
                    <>
                        <span className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold border", currentStyle.badge)}>
                            {currentStyle.dot && <span className={cn("size-1.5 rounded-full", currentStyle.dot)}></span>}
                            {currentStyle.icon && <span className="material-symbols-outlined text-[14px]">{currentStyle.icon}</span>}
                            {task.status}
                        </span>
                        {task.requestorAvatar && (
                            <div
                                className="size-6 rounded-full bg-cover bg-center"
                                style={{ backgroundImage: `url("${task.requestorAvatar}")` }}
                                title="Requestor"
                            ></div>
                        )}
                    </>
                )}
            </div>
        </div >
    );
};
