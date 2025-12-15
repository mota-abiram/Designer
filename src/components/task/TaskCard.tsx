import type { Task } from '../../types';
import { cn } from '../../utils/cn';
import { useTaskContext } from '../../context/TaskContext';

export const TaskCard = ({ task }: { task: Task }) => {
    const { setSelectedTask } = useTaskContext();

    const statusColors = {
        Pending: {
            border: 'border-red-500',
            badge: 'bg-red-500/10 text-red-500 border-red-500/20',
            dot: 'bg-red-500',
            icon: null
        },
        Submitted: {
            border: 'border-yellow-500',
            badge: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
            dot: 'bg-yellow-500',
            icon: null
        },
        Approved: {
            border: 'border-green-500',
            badge: 'bg-green-500/10 text-green-500 border-green-500/20',
            dot: null,
            icon: 'check'
        }
    };

    const currentStyle = statusColors[task.status];

    return (
        <div
            onClick={() => setSelectedTask(task)}
            className={cn(
                "group relative flex flex-col gap-2 p-3 rounded-lg bg-[#233648] border-l-4 hover:bg-[#2a4055] transition-all cursor-pointer shadow-sm hover:shadow-md mb-3",
                currentStyle.border,
                task.status === 'Approved' ? "opacity-60 hover:opacity-100" : ""
            )}
        >
            <div className="flex flex-col gap-1">
                <div className="flex justify-between items-start">
                    <h3 className="text-sm font-bold text-white leading-snug pr-2">{task.title}</h3>
                    <a
                        href={task.link}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-[#92adc9] hover:text-primary transition-colors opacity-0 group-hover:opacity-100"
                    >
                        <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                    </a>
                </div>
                <p className="text-xs text-[#92adc9] leading-relaxed line-clamp-2">{task.description}</p>
                <a
                    href={`https://${task.link}`}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs text-primary hover:underline truncate mt-1 block"
                >
                    {task.link}
                </a>
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-border-dark/50">
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
            </div>
        </div>
    );
};
