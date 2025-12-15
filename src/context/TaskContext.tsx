import { createContext, useContext, useState, useRef, useEffect, type ReactNode } from 'react';
import type { Task, Designer, Role, Status, FilterState } from '../types';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, writeBatch } from 'firebase/firestore';
import { db } from '../services/firebase';
import { designers as initialDesigners } from '../services/mockData';
import { format, isPast, isSameDay, parseISO } from 'date-fns';

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
    updateTask: (task: Task) => void;
    deleteTask: (taskId: string) => void;

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
    scrollByAmount: (amount: number) => void;
    lastAddedTaskId: string | null;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider = ({ children }: { children: ReactNode }) => {
    const [tasks, setTasks] = useState<Task[]>([]);

    // ... (rest of state definitions)
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

    // Real-time listener for tasks
    useEffect(() => {
        const q = query(collection(db, "tasks"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedTasks: Task[] = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Task));
            setTasks(fetchedTasks);
        });

        // Cleanup subscription
        return () => unsubscribe();
    }, []);

    // Auto-migrate overdue pending tasks to today (Cloud-side preferred, but done client-side here)
    useEffect(() => {
        if (tasks.length === 0) return;

        const migrateTasks = async () => {
            const todayStr = format(new Date(), 'yyyy-MM-dd');
            const batch = writeBatch(db);
            let hasMigrations = false;

            tasks.forEach(task => {
                if (task.status === 'Pending') {
                    const taskDate = parseISO(task.date);
                    if (isPast(taskDate) && !isSameDay(taskDate, new Date())) {
                        const taskRef = doc(db, "tasks", task.id);
                        batch.update(taskRef, {
                            date: todayStr,
                            updatedAt: new Date().toISOString()
                        });
                        hasMigrations = true;
                    }
                }
            });

            if (hasMigrations) {
                await batch.commit();
                console.log("Migrated overdue tasks to today");
            }
        };

        migrateTasks();
    }, [tasks.length]); // Run when tasks are loaded

    const addTask = async (task: Task) => {
        try {
            // Remove id as Firestore generates it, or use setDoc if we want custom ID.
            // Here we let Firestore generate ID, but our Task type requires ID.
            // We'll create a doc ref first if we need the ID immediately, or just let addDoc handle it.
            // Ideally UI creates ID:
            // const { id, ...data } = task;
            // await addDoc(collection(db, "tasks"), data); 
            // BUT local optimistic update is tricky if we mix flow. 
            // Best practice: let Firestore generate ID.

            // However, the `task` passed in has a temp ID usually.
            const { id, ...taskData } = task;
            const docRef = await addDoc(collection(db, "tasks"), taskData);
            setLastAddedTaskId(docRef.id);
        } catch (e) {
            console.error("Error adding task: ", e);
        }
    };

    const addDesigner = (name: string) => {
        const newDesigner: Designer = {
            id: `d${Date.now()}`,
            name,
        };
        setDesigners(prev => [...prev, newDesigner]);
        setActiveDesignerId(newDesigner.id);
    };

    const updateTaskStatus = async (taskId: string, status: Status) => {
        try {
            const taskRef = doc(db, "tasks", taskId);
            await updateDoc(taskRef, {
                status,
                updatedAt: new Date().toISOString()
            });

            // Optimistic update for selected task view
            if (selectedTask?.id === taskId) {
                setSelectedTask(prev => prev ? { ...prev, status, updatedAt: new Date().toISOString() } : null);
            }
        } catch (e) {
            console.error("Error updating status: ", e);
        }
    };

    const updateTask = async (updatedTask: Task) => {
        try {
            const taskRef = doc(db, "tasks", updatedTask.id);
            const { id, ...data } = updatedTask;
            const finalData = { ...data, updatedAt: new Date().toISOString() };

            await updateDoc(taskRef, finalData);

            if (selectedTask?.id === updatedTask.id) {
                setSelectedTask({ ...updatedTask, updatedAt: finalData.updatedAt });
            }
        } catch (e) {
            console.error("Error updating task: ", e);
        }
    };

    const deleteTask = async (taskId: string) => {
        try {
            await deleteDoc(doc(db, "tasks", taskId));
            if (selectedTask?.id === taskId) {
                setSelectedTask(null);
                setIsDrawerOpen(false);
            }
        } catch (e) {
            console.error("Error deleting task: ", e);
        }
    };

    const registerScrollContainer = (ref: HTMLDivElement | null) => {
        scrollContainerRef.current = ref;
    };

    const scrollToToday = () => {
        const todayEl = document.getElementById('column-today');
        if (todayEl && scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const scrollLeft = todayEl.offsetLeft - container.offsetLeft - 32;
            container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
        }
    };

    const scrollByAmount = (amount: number) => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: amount, behavior: 'smooth' });
        }
    };

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
        updateTask,
        deleteTask,
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
        scrollByAmount,
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
