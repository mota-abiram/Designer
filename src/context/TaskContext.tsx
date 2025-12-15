import { createContext, useContext, useState, useRef, type ReactNode } from 'react';
import type { Task, Designer, Role, Status, FilterState } from '../types';
import { initialTasks, designers as initialDesigners } from '../services/mockData';

interface TaskContextType {
    tasks: Task[];
    designers: Designer[];
    activeDesignerId: string;
    setActiveDesignerId: (id: string) => void;
    role: Role;
    setRole: (role: Role) => void;
    addTask: (task: Task) => void;
    addDesigner: (name: string) => void;
    updateTaskStatus: (taskId: string, status: Status) => void;

    selectedTask: Task | null;
    setSelectedTask: (task: Task | null) => void;

    isDrawerOpen: boolean;
    setIsDrawerOpen: (isOpen: boolean) => void;

    // Modals
    isAddTaskOpen: boolean;
    setAddTaskOpen: (isOpen: boolean) => void;
    newTaskDefaults: { date?: string } | null;
    setNewTaskDefaults: (defaults: { date?: string } | null) => void;

    isAddDesignerOpen: boolean;
    setAddDesignerOpen: (isOpen: boolean) => void;

    // Filters
    filters: FilterState;
    setFilters: (filters: FilterState) => void;

    // Scroll
    registerScrollContainer: (ref: HTMLDivElement | null) => void;
    scrollToToday: () => void;
    lastAddedTaskId: string | null;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider = ({ children }: { children: ReactNode }) => {
    const [tasks, setTasks] = useState<Task[]>(initialTasks);
    const [designers, setDesigners] = useState<Designer[]>(initialDesigners);
    const [activeDesignerId, setActiveDesignerId] = useState<string>('d1');
    const [role, setRole] = useState<Role>('Designer');

    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const [isAddTaskOpen, setAddTaskOpen] = useState(false);
    const [newTaskDefaults, setNewTaskDefaults] = useState<{ date?: string } | null>(null);

    const [isAddDesignerOpen, setAddDesignerOpen] = useState(false);

    const [filters, setFilters] = useState<FilterState>({
        status: [],
        dateRange: { start: null, end: null }
    });

    const scrollContainerRef = useRef<HTMLDivElement | null>(null);

    const [lastAddedTaskId, setLastAddedTaskId] = useState<string | null>(null);

    const addTask = (task: Task) => {
        setTasks((prev) => [...prev, task]);
        setLastAddedTaskId(task.id);
    };

    const addDesigner = (name: string) => {
        const newDesigner: Designer = {
            id: `d${Date.now()}`,
            name,
        };
        setDesigners(prev => [...prev, newDesigner]);
        setActiveDesignerId(newDesigner.id);
    };

    const updateTaskStatus = (taskId: string, status: Status) => {
        setTasks((prev) =>
            prev.map((t) => (t.id === taskId ? { ...t, status, updatedAt: new Date().toISOString() } : t))
        );
    };

    const registerScrollContainer = (ref: HTMLDivElement | null) => {
        scrollContainerRef.current = ref;
    };

    const scrollToToday = () => {
        // This will be triggered by finding the "today" element ID
        const todayEl = document.getElementById('column-today');
        if (todayEl && scrollContainerRef.current) {
            // Calculate position to center or start
            const container = scrollContainerRef.current;
            const scrollLeft = todayEl.offsetLeft - container.offsetLeft - 32; // 32px padding offset
            container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
        }
    };

    // Filter logic can be applied here or in components. 
    // For global "New Task" autofill or specific date column adds, we use newTaskDefaults.

    const value = {
        tasks,
        designers,
        activeDesignerId,
        setActiveDesignerId,
        role,
        setRole,
        addTask,
        addDesigner,
        updateTaskStatus,
        selectedTask,
        setSelectedTask: (task: Task | null) => {
            setSelectedTask(task);
            if (task) setIsDrawerOpen(true);
            else setIsDrawerOpen(false);
        },
        isDrawerOpen,
        setIsDrawerOpen,
        isAddTaskOpen,
        setAddTaskOpen,
        newTaskDefaults,
        setNewTaskDefaults,
        isAddDesignerOpen,
        setAddDesignerOpen,
        filters,
        setFilters,
        registerScrollContainer,
        scrollToToday,
        lastAddedTaskId
    };

    return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};

export const useTaskContext = () => {
    const context = useContext(TaskContext);
    if (!context) {
        throw new Error('useTaskContext must be used within a TaskProvider');
    }
    return context;
};
