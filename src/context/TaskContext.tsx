import { createContext, useContext, useState, useRef, useEffect, useMemo, useCallback, type ReactNode } from 'react';
import { format } from 'date-fns';
import type { Task, Designer, Role, Status, FilterState, Brand, CreativeType, Scope, BrandQuota } from '../types';
import { collection, onSnapshot, addDoc, updateDoc, doc, query, writeBatch, where, setDoc, getDoc, getDocs, arrayUnion } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from './AuthContext';
import { MANAGER_EMAILS } from '../constants/assigners';
import { designers as initialDesigners, getCurrentWeekDays } from '../services/mockData';
import toast from 'react-hot-toast';

interface TaskContextType {
    tasks: Task[];
    designers: Designer[];
    activeDesignerId: string;
    setActiveDesignerId: (id: string) => void;
    role: Role;
    setRole: (role: Role) => void;

    addTask: (task: Task) => Promise<void>;
    updateTaskStatus: (taskId: string, status: Status) => Promise<void>;
    updateTask: (task: Partial<Task> & { id: string }) => Promise<void>;
    deleteTask: (taskId: string) => Promise<void>;
    addComment: (taskId: string, text: string) => Promise<void>;

    brands: Brand[];
    addBrand: (name: string) => Promise<void>;
    deleteBrand: (id: string) => Promise<void>;

    creativeTypes: CreativeType[];
    addCreativeType: (name: string) => Promise<void>;
    deleteCreativeType: (id: string) => Promise<void>;

    scopes: Scope[];
    addScope: (name: string) => Promise<void>;
    deleteScope: (id: string) => Promise<void>;

    quotas: BrandQuota[];
    updateQuota: (quota: Partial<BrandQuota>) => Promise<void>;
    deleteQuota: (id: string) => Promise<void>;

    selectedTask: Task | null;
    setSelectedTask: (task: Task | null) => void;

    isDrawerOpen: boolean;
    setIsDrawerOpen: (isOpen: boolean) => void;

    isAddTaskOpen: boolean;
    setAddTaskOpen: (isOpen: boolean) => void;

    newTaskDefaults: { date?: string } | null;
    setNewTaskDefaults: (defaults: { date?: string } | null) => void;

    isAddDesignerOpen: boolean;
    setAddDesignerOpen: (isOpen: boolean) => void;

    filters: FilterState;
    setFilters: (filters: FilterState) => void;

    registerScrollContainer: (ref: HTMLDivElement | null) => void;
    scrollToToday: () => void;
    scrollByAmount: (amount: number) => void;

    lastAddedTaskId: string | null;
    viewMode: 'comfortable' | 'compact';
    setViewMode: (mode: 'comfortable' | 'compact') => void;

    allTasks: Task[];
    seedSocialMediaData: () => Promise<void>;

    isLoading: boolean;
    isSyncing: boolean;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider = ({ children }: { children: ReactNode }) => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [designers] = useState<Designer[]>(initialDesigners);
    const [activeDesignerId, setActiveDesignerId] = useState(initialDesigners[0]?.id || 'd1');
    const [role, setRole] = useState<Role>('Designer');
    const [viewMode, setViewMode] = useState<'comfortable' | 'compact'>('comfortable');

    const [isLoading, setIsLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);

    const [brands, setBrands] = useState<Brand[]>([]);
    const [creativeTypes, setCreativeTypes] = useState<CreativeType[]>([]);
    const [scopes, setScopes] = useState<Scope[]>([]);
    const [quotas, setQuotas] = useState<BrandQuota[]>([]);

    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const [isAddTaskOpen, setAddTaskOpen] = useState(false);
    const [newTaskDefaults, setNewTaskDefaults] = useState<{ date?: string } | null>(null);

    const [isAddDesignerOpen, setAddDesignerOpen] = useState(false);

    const [filters, setFilters] = useState<FilterState>({
        status: [],
        dateRange: { start: null, end: null },
        searchQuery: ''
    });

    const scrollContainerRef = useRef<HTMLDivElement | null>(null);
    const [lastAddedTaskId, setLastAddedTaskId] = useState<string | null>(null);

    const { user } = useAuth();

    /* ================= ROLE SETUP ================= */
    useEffect(() => {
        if (!user || !user.email) {
            setRole('Designer');
            return;
        }

        const isManager = MANAGER_EMAILS.some(email =>
            user.email?.toLowerCase() === email.toLowerCase()
        );

        setRole(isManager ? 'Manager' : 'Designer');
    }, [user]);

    /* ================= TASK LISTENER ================= */
    useEffect(() => {
        if (!user) {
            setTasks([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        const currentWeek = getCurrentWeekDays();
        const startDate = filters.dateRange.start || currentWeek[0];
        const endDate = filters.dateRange.end || currentWeek[currentWeek.length - 1];

        const q = query(
            collection(db, "tasks"),
            where("date", ">=", startDate),
            where("date", "<=", endDate)
        );

        const unsubscribe = onSnapshot(q, snapshot => {
            const data = snapshot.docs
                .map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }))
                .filter((task: any) => !task.deleted) as Task[];
            setTasks(data);
            setIsLoading(false);
        }, (error) => {
            console.error("Firestore error:", error);
            setIsLoading(false);
            toast.error("Failed to sync tasks");
        });

        return () => unsubscribe();
    }, [user, filters.dateRange]);

    /* ================= BASIC COLLECTIONS ================= */
    useEffect(() => {
        if (!user) return;

        const unsubBrands = onSnapshot(collection(db, "brands"), snap => {
            setBrands(snap.docs.map(d => ({ id: d.id, ...d.data() } as Brand)).filter(b => !b.deleted));
        });

        const unsubTypes = onSnapshot(collection(db, "creativeTypes"), snap => {
            setCreativeTypes(snap.docs.map(d => ({ id: d.id, ...d.data() } as CreativeType)).filter(t => !t.deleted));
        });

        const unsubScopes = onSnapshot(collection(db, "scopes"), snap => {
            setScopes(snap.docs.map(d => ({ id: d.id, ...d.data() } as Scope)).filter(s => !s.deleted));
        });

        const unsubQuotas = onSnapshot(collection(db, "quotas"), snap => {
            setQuotas(snap.docs.map(d => ({ id: d.id, ...d.data() } as BrandQuota)).filter(q => !q.deleted));
        });

        return () => {
            unsubBrands();
            unsubTypes();
            unsubScopes();
            unsubQuotas();
        };
    }, [user]);

    /* ================= TASK ROLLOVER ================= */
    useEffect(() => {
        if (!user) return;

        const rolloverOverdueTasks = async () => {
            const todayStr = format(new Date(), 'yyyy-MM-dd');

            try {
                const qPending = query(collection(db, "tasks"), where("status", "==", "Pending"));
                const qRework = query(collection(db, "tasks"), where("status", "==", "Rework"));
                const qPendingApproval = query(collection(db, "tasks"), where("status", "==", "Pending Approval"));

                const [snapPending, snapRework, snapPendingApproval] = await Promise.all([
                    getDocs(qPending),
                    getDocs(qRework),
                    getDocs(qPendingApproval)
                ]);

                const overdueTasks = [...snapPending.docs, ...snapRework.docs, ...snapPendingApproval.docs].filter(doc => {
                    const taskDate = (doc.data() as any).date;
                    return taskDate && taskDate < todayStr;
                });

                if (overdueTasks.length === 0) return;

                const batch = writeBatch(db);
                overdueTasks.forEach(docSnap => {
                    batch.update(docSnap.ref, {
                        date: todayStr,
                        updatedAt: new Date().toISOString()
                    });
                });

                await batch.commit();
            } catch (error) {
                console.error("Error during task rollover:", error);
            }
        };

        rolloverOverdueTasks();
        const interval = setInterval(rolloverOverdueTasks, 60 * 60 * 1000);
        return () => clearInterval(interval);
    }, [user]);

    /* ================= TASK ACTIONS ================= */
    const adjustQuota = useCallback(async (brandName: string | undefined, scopeName: string | undefined, typeName: string | undefined, amount: number) => {
        if (!brandName || !scopeName || !typeName) return;

        const brandId = brandName.toLowerCase().replace(/\s+/g, '_');
        const scopeId = scopeName.toLowerCase().replace(/\s+/g, '_');
        const quotaId = `${brandId}_${scopeId}`;

        try {
            const quotaRef = doc(db, "quotas", quotaId);
            const quotaSnap = await getDoc(quotaRef);

            if (quotaSnap.exists()) {
                const currentData = quotaSnap.data();
                const currentDelivered = currentData.delivered || {};
                const oldValue = currentDelivered[typeName] || 0;
                const newValue = Math.max(0, oldValue + amount);

                await updateDoc(quotaRef, {
                    [`delivered.${typeName}`]: newValue
                });
            } else if (amount > 0) {
                await setDoc(quotaRef, {
                    id: quotaId,
                    brandId: brandName,
                    scopeId: scopeName,
                    targets: { [typeName]: 0 },
                    delivered: { [typeName]: amount }
                });
            }
        } catch (e) {
            console.error("Error adjusting quota:", e);
        }
    }, []);

    const addTask = useCallback(async (task: Task) => {
        setIsSyncing(true);
        try {
            const { id, ...payload } = task;
            const docRef = await addDoc(collection(db, "tasks"), payload);
            setLastAddedTaskId(docRef.id);

            if (payload.status === 'Approved') {
                await adjustQuota(payload.brand, payload.scope, payload.creativeType, 1);
            }
            toast.success('Task created successfully');
        } catch (e) {
            console.error("Error adding task:", e);
            toast.error('Failed to create task');
        } finally {
            setIsSyncing(false);
        }
    }, [adjustQuota]);

    const updateTaskStatus = useCallback(async (taskId: string, status: Status) => {
        const task = tasks.find(t => t.id === taskId);
        if (!task || task.status === status) return;

        setIsSyncing(true);
        try {
            const now = new Date().toISOString();
            const updateData: any = { status, updatedAt: now };

            if (status === 'Approved') {
                if (task.status !== 'Approved') await adjustQuota(task.brand, task.scope, task.creativeType, 1);
            } else if (task.status === 'Approved') {
                await adjustQuota(task.brand, task.scope, task.creativeType, -1);
            }

            if (status === 'Rework') {
                updateData.reworkCount = (task.reworkCount || 0) + 1;
                updateData.date = format(new Date(), 'yyyy-MM-dd');
            }

            await updateDoc(doc(db, "tasks", taskId), updateData);

            if (selectedTask?.id === taskId) {
                setSelectedTask(prev => prev ? { ...prev, ...updateData } : null);
            }
            toast.success(`Task marked as ${status}`);
        } catch (e) {
            console.error("Error updating status:", e);
            toast.error('Failed to update status');
        } finally {
            setIsSyncing(false);
        }
    }, [tasks, selectedTask, adjustQuota]);

    const updateTask = useCallback(async (taskUpdate: Partial<Task> & { id: string }) => {
        const oldTask = tasks.find(t => t.id === taskUpdate.id);
        if (!oldTask) return;

        setIsSyncing(true);
        try {
            const updatedTask = { ...oldTask, ...taskUpdate };

            if (oldTask.status !== updatedTask.status) {
                if (updatedTask.status === 'Approved') {
                    if (oldTask.status !== 'Approved') await adjustQuota(updatedTask.brand, updatedTask.scope, updatedTask.creativeType, 1);
                } else if (oldTask.status === 'Approved') {
                    await adjustQuota(oldTask.brand, oldTask.scope, oldTask.creativeType, -1);
                }
            } else if (updatedTask.status === 'Approved') {
                if (oldTask.brand !== updatedTask.brand || oldTask.scope !== updatedTask.scope || oldTask.creativeType !== updatedTask.creativeType) {
                    await adjustQuota(oldTask.brand, oldTask.scope, oldTask.creativeType, -1);
                    await adjustQuota(updatedTask.brand, updatedTask.scope, updatedTask.creativeType, 1);
                }
            }

            const { id, ...data } = taskUpdate;
            await updateDoc(doc(db, "tasks", id), { ...data, updatedAt: new Date().toISOString() });

            if (selectedTask?.id === id) setSelectedTask(updatedTask);
            toast.success('Task updated');
        } catch (e) {
            console.error("Error updating task:", e);
            toast.error('Failed to update task');
        } finally {
            setIsSyncing(false);
        }
    }, [tasks, selectedTask, adjustQuota]);

    const deleteTask = useCallback(async (taskId: string) => {
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;

        setIsSyncing(true);
        try {
            if (task.status === 'Approved') await adjustQuota(task.brand, task.scope, task.creativeType, -1);

            await updateDoc(doc(db, "tasks", taskId), {
                deleted: true,
                deletedAt: new Date().toISOString(),
                deletedBy: user?.email || 'unknown',
                updatedAt: new Date().toISOString()
            });

            if (selectedTask?.id === taskId) {
                setSelectedTask(null);
                setIsDrawerOpen(false);
            }
            toast.success('Task removed');
        } catch (e) {
            console.error("Error deleting task:", e);
            toast.error('Failed to remove task');
        } finally {
            setIsSyncing(false);
        }
    }, [tasks, selectedTask, user, adjustQuota]);

    const addBrand = useCallback(async (name: string) => {
        await addDoc(collection(db, "brands"), { name, createdAt: new Date().toISOString() });
    }, []);

    const deleteBrand = useCallback(async (id: string) => {
        await updateDoc(doc(db, "brands", id), { deleted: true, updatedAt: new Date().toISOString() });
    }, []);

    const addCreativeType = useCallback(async (name: string) => {
        await addDoc(collection(db, "creativeTypes"), { name, createdAt: new Date().toISOString() });
    }, []);

    const deleteCreativeType = useCallback(async (id: string) => {
        await updateDoc(doc(db, "creativeTypes", id), { deleted: true, updatedAt: new Date().toISOString() });
    }, []);

    const addScope = useCallback(async (name: string) => {
        await addDoc(collection(db, "scopes"), { name, createdAt: new Date().toISOString() });
    }, []);

    const deleteScope = useCallback(async (id: string) => {
        await updateDoc(doc(db, "scopes", id), { deleted: true, updatedAt: new Date().toISOString() });
    }, []);

    const updateQuota = useCallback(async (quota: Partial<BrandQuota>) => {
        if (!quota.brandId || !quota.scopeId) return;
        const id = `${quota.brandId.toLowerCase().replace(/\s+/g, '_')}_${quota.scopeId.toLowerCase().replace(/\s+/g, '_')}`;
        await updateDoc(doc(db, "quotas", id), { ...quota, id });
    }, []);

    const deleteQuota = useCallback(async (id: string) => {
        await updateDoc(doc(db, "quotas", id), { deleted: true, updatedAt: new Date().toISOString() });
    }, []);

    const addComment = useCallback(async (taskId: string, text: string) => {
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;

        setIsSyncing(true);
        try {
            const newComment = {
                id: Math.random().toString(36).substring(2, 9),
                text,
                author: user?.displayName || user?.email?.split('@')[0] || 'Unknown User',
                authorAvatar: user?.photoURL || null,
                timestamp: new Date().toISOString()
            };

            await updateDoc(doc(db, "tasks", taskId), {
                comments: arrayUnion(newComment),
                updatedAt: new Date().toISOString()
            });

            if (selectedTask?.id === taskId) {
                const existingComments = task.comments || [];
                setSelectedTask({ ...task, comments: [...existingComments, newComment] });
            }
        } catch (e) {
            console.error("Error adding comment:", e);
            toast.error('Failed to add comment');
        } finally {
            setIsSyncing(false);
        }
    }, [tasks, selectedTask, user]);

    const registerScrollContainer = useCallback((ref: HTMLDivElement | null) => {
        scrollContainerRef.current = ref;
    }, []);

    const scrollToToday = useCallback(() => {
        const todayEl = document.getElementById('column-today');
        if (todayEl && scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            container.scrollTo({ left: todayEl.offsetLeft - container.offsetLeft - 32, behavior: 'smooth' });
        }
    }, []);

    const scrollByAmount = useCallback((amount: number) => {
        scrollContainerRef.current?.scrollBy({ left: amount, behavior: 'smooth' });
    }, []);

    const filteredTasks = useMemo(() => {
        return tasks.filter(task => {
            const matchesStatus = filters.status.length === 0 || filters.status.includes(task.status);
            const matchesSearch = !filters.searchQuery ||
                task.title.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
                task.description.toLowerCase().includes(filters.searchQuery.toLowerCase());
            return matchesStatus && matchesSearch;
        });
    }, [tasks, filters.status, filters.searchQuery]);

    const contextValue = useMemo(() => ({
        tasks: filteredTasks,
        designers,
        activeDesignerId,
        setActiveDesignerId,
        role,
        setRole,
        addTask,
        updateTaskStatus,
        updateTask,
        deleteTask,
        brands,
        addBrand,
        deleteBrand,
        creativeTypes,
        addCreativeType,
        deleteCreativeType,
        scopes,
        addScope,
        deleteScope,
        quotas,
        updateQuota,
        deleteQuota,
        addComment,
        selectedTask,
        setSelectedTask: (task: Task | null) => {
            setSelectedTask(task);
            setIsDrawerOpen(!!task);
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
        lastAddedTaskId,
        viewMode,
        setViewMode,
        seedSocialMediaData: async () => { }, // Define if needed
        allTasks: tasks,
        isLoading,
        isSyncing
    }), [
        filteredTasks, designers, activeDesignerId, role, brands, creativeTypes,
        scopes, quotas, selectedTask, isDrawerOpen, isAddTaskOpen,
        newTaskDefaults, isAddDesignerOpen, filters, lastAddedTaskId,
        viewMode, tasks, isLoading, isSyncing,
        addTask, updateTaskStatus, updateTask, deleteTask, addBrand,
        deleteBrand, addCreativeType, deleteCreativeType, addScope,
        deleteScope, updateQuota, deleteQuota, addComment,
        registerScrollContainer, scrollToToday, scrollByAmount
    ]);

    return (
        <TaskContext.Provider value={contextValue}>
            {children}
        </TaskContext.Provider>
    );
};

export const useTaskContext = () => {
    const context = useContext(TaskContext);
    if (!context) throw new Error("useTaskContext must be used within TaskProvider");
    return context;
};
