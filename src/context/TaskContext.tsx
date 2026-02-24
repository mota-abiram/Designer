import { createContext, useContext, useState, useRef, useEffect, useMemo, type ReactNode } from 'react';
import { format } from 'date-fns';
import type { Task, Designer, Role, Status, FilterState, Brand, CreativeType, Scope, BrandQuota } from '../types';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, writeBatch, where, setDoc, getDoc, getDocs } from 'firebase/firestore';
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

    addTask: (task: Task) => void;
    updateTaskStatus: (taskId: string, status: Status) => void;
    updateTask: (task: Task) => void;
    deleteTask: (taskId: string) => void;
    addComment: (taskId: string, text: string) => Promise<void>;

    brands: Brand[];
    addBrand: (name: string) => void;
    deleteBrand: (id: string) => void;

    creativeTypes: CreativeType[];
    addCreativeType: (name: string) => void;
    deleteCreativeType: (id: string) => void;

    scopes: Scope[];
    addScope: (name: string) => void;
    deleteScope: (id: string) => void;

    quotas: BrandQuota[];
    updateQuota: (quota: Partial<BrandQuota>) => void;
    deleteQuota: (id: string) => void;

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
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider = ({ children }: { children: ReactNode }) => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [designers] = useState<Designer[]>(initialDesigners);
    const [activeDesignerId, setActiveDesignerId] = useState(initialDesigners[0]?.id || 'd1');
    const [role, setRole] = useState<Role>('Designer');
    const [viewMode, setViewMode] = useState<'comfortable' | 'compact'>('comfortable');

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

        // Check if user is an Account Manager (in MANAGER_EMAILS list)
        const isManager = MANAGER_EMAILS.some(email =>
            user.email?.toLowerCase() === email.toLowerCase()
        );

        setRole(isManager ? 'Manager' : 'Designer');
    }, [user]);

    /* ================= TASK LISTENER ================= */
    useEffect(() => {
        if (!user) {
            setTasks([]);
            return;
        }

        const currentWeek = getCurrentWeekDays();
        const startDate = filters.dateRange.start || currentWeek[0];
        const endDate = filters.dateRange.end || currentWeek[currentWeek.length - 1];

        const q = query(
            collection(db, "tasks"),
            where("date", ">=", startDate),
            where("date", "<=", endDate)
        );

        const unsubscribe = onSnapshot(q, snapshot => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Task[];
            setTasks(data);
        });

        return () => unsubscribe();
    }, [user, filters.dateRange]);

    /* ================= BASIC COLLECTIONS ================= */
    useEffect(() => {
        if (!user) return;

        const unsubBrands = onSnapshot(collection(db, "brands"), snap => {
            setBrands(snap.docs.map(d => ({ id: d.id, ...d.data() } as Brand)));
        });

        const unsubTypes = onSnapshot(collection(db, "creativeTypes"), snap => {
            setCreativeTypes(snap.docs.map(d => ({ id: d.id, ...d.data() } as CreativeType)));
        });

        const unsubScopes = onSnapshot(collection(db, "scopes"), snap => {
            setScopes(snap.docs.map(d => ({ id: d.id, ...d.data() } as Scope)));
        });

        const unsubQuotas = onSnapshot(collection(db, "quotas"), snap => {
            setQuotas(snap.docs.map(d => ({ id: d.id, ...d.data() } as BrandQuota)));
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
                // Fetch ALL tasks where status is 'Pending' or 'Rework'
                // We filter by date client-side to avoid needing a composite index on [status, date]
                const qPending = query(
                    collection(db, "tasks"),
                    where("status", "==", "Pending")
                );

                const qRework = query(
                    collection(db, "tasks"),
                    where("status", "==", "Rework")
                );

                const qPendingApproval = query(
                    collection(db, "tasks"),
                    where("status", "==", "Pending Approval")
                );

                const [snapPending, snapRework, snapPendingApproval] = await Promise.all([
                    getDocs(qPending),
                    getDocs(qRework),
                    getDocs(qPendingApproval)
                ]);

                // Combine and filter for dates strictly before today
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
                console.log(`Rolled over ${overdueTasks.length} pending/rework/pending-approval tasks to ${todayStr}`);
            } catch (error) {
                console.error("Error during task rollover:", error);
            }
        };

        // Run on mount
        rolloverOverdueTasks();

        // Check for day change every hour
        const interval = setInterval(rolloverOverdueTasks, 60 * 60 * 1000);

        return () => clearInterval(interval);
    }, [user]);

    /* ================= TASK ACTIONS ================= */
    const adjustQuota = async (brandName: string | undefined, scopeName: string | undefined, typeName: string | undefined, amount: number) => {
        if (!brandName || !scopeName || !typeName) return;

        const brandId = brandName.toLowerCase().replace(/\s+/g, '_');
        const scopeId = scopeName.toLowerCase().replace(/\s+/g, '_');
        const quotaId = `${brandId}_${scopeId}`;

        try {
            const quotaRef = doc(db, "quotas", quotaId);
            // Use getDoc for fresh data instead of potentially stale local state
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
                // Create new quota entry if it doesn't exist
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
    };

    const addTask = async (task: Task) => {
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
        }
    };

    const updateTaskStatus = async (taskId: string, status: Status) => {
        try {
            const task = tasks.find(t => t.id === taskId);
            const now = new Date().toISOString();

            if (task && task.status !== status) {
                const updateData: any = { status, updatedAt: now };

                // Logic for Quota (delivered)
                if (status === 'Approved') {
                    // Increase quota if moving TO Approved
                    if (task.status !== 'Approved') {
                        await adjustQuota(task.brand, task.scope, task.creativeType, 1);
                    }
                } else if (task.status === 'Approved') {
                    // Decrease quota if moving AWAY from Approved
                    await adjustQuota(task.brand, task.scope, task.creativeType, -1);
                }

                // Logic for Task Count (reworkCount)
                if (status === 'Rework') {
                    updateData.reworkCount = (task.reworkCount || 0) + 1;
                    // Move to today's date
                    updateData.date = format(new Date(), 'yyyy-MM-dd');
                }

                await updateDoc(doc(db, "tasks", taskId), updateData);

                if (selectedTask?.id === taskId) {
                    setSelectedTask(prev => prev ? { ...prev, ...updateData } : null);
                }
                toast.success(`Task marked as ${status}`);
            }
        } catch (e) {
            console.error("Error updating status:", e);
            toast.error('Failed to update status');
        }
    };

    const updateTask = async (updatedTask: Task) => {
        try {
            const oldTask = tasks.find(t => t.id === updatedTask.id);
            if (oldTask) {
                if (oldTask.status !== updatedTask.status) {
                    if (updatedTask.status === 'Approved') {
                        if (oldTask.status !== 'Approved') {
                            await adjustQuota(updatedTask.brand, updatedTask.scope, updatedTask.creativeType, 1);
                        }
                    } else if (oldTask.status === 'Approved') {
                        await adjustQuota(oldTask.brand, oldTask.scope, oldTask.creativeType, -1);
                    }
                } else if (updatedTask.status === 'Approved') {
                    if (oldTask.brand !== updatedTask.brand ||
                        oldTask.scope !== updatedTask.scope ||
                        oldTask.creativeType !== updatedTask.creativeType) {
                        await adjustQuota(oldTask.brand, oldTask.scope, oldTask.creativeType, -1);
                        await adjustQuota(updatedTask.brand, updatedTask.scope, updatedTask.creativeType, 1);
                    }
                }
            }

            const { id, ...data } = updatedTask;
            await updateDoc(doc(db, "tasks", id), {
                ...data,
                updatedAt: new Date().toISOString()
            });

            if (selectedTask?.id === id) {
                setSelectedTask(updatedTask);
            }
            toast.success('Task updated');
        } catch (e) {
            console.error("Error updating task:", e);
            toast.error('Failed to update task');
        }
    };

    const deleteTask = async (taskId: string) => {
        try {
            const task = tasks.find(t => t.id === taskId);
            if (task && task.status === 'Approved') {
                await adjustQuota(task.brand, task.scope, task.creativeType, -1);
            }

            await deleteDoc(doc(db, "tasks", taskId));
            if (selectedTask?.id === taskId) {
                setSelectedTask(null);
                setIsDrawerOpen(false);
            }
            toast.success('Task deleted');
        } catch (e) {
            console.error("Error deleting task:", e);
            toast.error('Failed to delete task');
        }
    };

    /* ================= CRUD HELPERS ================= */

    const addBrand = async (name: string) => {
        await addDoc(collection(db, "brands"), { name, createdAt: new Date().toISOString() });
    };

    const deleteBrand = async (id: string) => {
        await deleteDoc(doc(db, "brands", id));
    };

    const addCreativeType = async (name: string) => {
        await addDoc(collection(db, "creativeTypes"), { name, createdAt: new Date().toISOString() });
    };

    const deleteCreativeType = async (id: string) => {
        await deleteDoc(doc(db, "creativeTypes", id));
    };

    const addScope = async (name: string) => {
        await addDoc(collection(db, "scopes"), { name, createdAt: new Date().toISOString() });
    };

    const deleteScope = async (id: string) => {
        await deleteDoc(doc(db, "scopes", id));
    };

    const updateQuota = async (quota: Partial<BrandQuota>) => {
        if (!quota.brandId || !quota.scopeId) return;
        const id = `${quota.brandId.toLowerCase().replace(/\s+/g, '_')}_${quota.scopeId.toLowerCase().replace(/\s+/g, '_')}`;
        await updateDoc(doc(db, "quotas", id), { ...quota, id });
    };

    const deleteQuota = async (id: string) => {
        await deleteDoc(doc(db, "quotas", id));
    };

    const addComment = async (taskId: string, text: string) => {
        try {
            const task = tasks.find(t => t.id === taskId);
            if (!task) return;

            const newComment = {
                id: Math.random().toString(36).substring(2, 9),
                text,
                author: user?.displayName || 'Unknown User',
                authorAvatar: user?.photoURL || null,
                timestamp: new Date().toISOString()
            };

            const updatedComments = [...(task.comments || []), newComment];
            const taskRef = doc(db, "tasks", taskId);
            await updateDoc(taskRef, {
                comments: updatedComments,
                updatedAt: new Date().toISOString()
            });

            if (selectedTask?.id === taskId) {
                setSelectedTask({ ...task, comments: updatedComments });
            }
        } catch (e) {
            console.error("Error adding comment:", e);
            toast.error('Failed to add comment');
        }
    };

    /* ================= SCROLL ================= */

    const registerScrollContainer = (ref: HTMLDivElement | null) => {
        scrollContainerRef.current = ref;
    };

    const scrollToToday = () => {
        const todayEl = document.getElementById('column-today');
        if (todayEl && scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            container.scrollTo({ left: todayEl.offsetLeft - container.offsetLeft - 32, behavior: 'smooth' });
        }
    };

    const scrollByAmount = (amount: number) => {
        scrollContainerRef.current?.scrollBy({ left: amount, behavior: 'smooth' });
    };

    /* ================= SEED DATA ================= */

    const seedSocialMediaData = async () => {
        const batch = writeBatch(db);

        const data = [
            { brand: "PMR", designer: "Vaishnove/Janvi", sS: 8, sR: 4, dS: 6, dR: 1 },
            { brand: "Vertex", designer: "Vaishnove", sS: 8, sR: 4, dS: 8, dR: 3 },
            { brand: "Bell Tech", designer: "Vaishnove", sS: 5, sR: 5, dS: 5, dR: 5 },
            { brand: "APR Developers", designer: "Vaishnove/Aarti", sS: 0, sR: 0, dS: 0, dR: 0 },
            { brand: "Umbera", designer: "Vaishnove/Aarti", sS: 8, sR: 4, dS: 6, dR: 1 },
            { brand: "Karlan", designer: "Vaishnove/Aarti", sS: 8, sR: 8, dS: 5, dR: 1 },
            { brand: "Duroguard", designer: "Saurabh", sS: 10, sR: 5, dS: 1, dR: 3 },
            { brand: "Jaya Physio", designer: "Saurabh", sS: 4, sR: 10, dS: 4, dR: 4 },
            { brand: "Lifescc", designer: "Saurabh", sS: 0, sR: 0, dS: 0, dR: 0 },
            { brand: "APD Developers", designer: "Saurabh", sS: 10, sR: 4, dS: 8, dR: 0 },
            { brand: "Bharathai", designer: "Janvi", sS: 6, sR: 6, dS: 5, dR: 3 },
            { brand: "Sathyu", designer: "Janvi /Haripriya", sS: 8, sR: 4, dS: 4, dR: 3 },
            { brand: "Procural", designer: "Janvi", sS: 8, sR: 4, dS: 2, dR: 1 },
            { brand: "Olive Space", designer: "Janvi", sS: 0, sR: 0, dS: 0, dR: 0 },
            { brand: "PriyaGold", designer: "Haripriya", sS: 8, sR: 7, dS: 5, dR: 10 },
            { brand: "Rubricks Tripura", designer: "Abhishek", sS: 8, sR: 4, dS: 0, dR: 0 },
            { brand: "Saket Veda", designer: "Abhishek", sS: 4, sR: 2, dS: 4, dR: 2 },
            { brand: "Saket Bhusatva", designer: "Abhishek", sS: 8, sR: 4, dS: 8, dR: 2 },
            { brand: "Saket Pranamam", designer: "Abhishek", sS: 8, sR: 4, dS: 9, dR: 1 },
            { brand: "Janapriya", designer: "Abhishek", sS: 4, sR: 10, dS: 4, dR: 10 },
            { brand: "Reliance", designer: "Veda", sS: 7, sR: 8, dS: 4, dR: 7 },
            { brand: "Revasa", designer: "Veda", sS: 7, sR: 8, dS: 7, dR: 5 },
            { brand: "Deevyashakti", designer: "Veda", sS: 3, sR: 3, dS: 2, dR: 2 },
            { brand: "Hello Eggs", designer: "Veda", sS: 6, sR: 8, dS: 6, dR: 8 },
            { brand: "Samkins", designer: "Vaishnove/Janvi", sS: 0, sR: 0, dS: 0, dR: 0 },
            { brand: "Elements by nirvania", designer: "Haripriya", sS: 0, sR: 0, dS: 0, dR: 0 },
            { brand: "Beyond work spaces", designer: "Haripriya", sS: 8, sR: 4, dS: 9, dR: 3 },
            { brand: "Sanvi Homes", designer: "Prajakta", sS: 8, sR: 6, dS: 5, dR: 3 },
            { brand: "Lokal", designer: "", sS: 0, sR: 0, dS: 0, dR: 0 },
            { brand: "One40", designer: "", sS: 0, sR: 0, dS: 0, dR: 0 },
            { brand: "Rail Cab", designer: "", sS: 8, sR: 4, dS: 4, dR: 1 }
        ];

        for (const item of data) {
            const brandId = item.brand.toLowerCase().replace(/\s+/g, '_');

            batch.set(doc(db, "brands", brandId), {
                name: item.brand,
                createdAt: new Date().toISOString()
            });

            batch.set(doc(db, "quotas", `${brandId}_social_media`), {
                id: `${brandId}_social_media`,
                brandId: item.brand,
                scopeId: "Social Media",
                targets: {
                    Statics: item.sS,
                    Reels: item.sR
                },
                delivered: {
                    Statics: item.dS,
                    Reels: item.dR
                },
                assignedDesigner: item.designer
            });
        }

        await batch.commit();
    };

    const filteredTasks = useMemo(() => {
        return tasks.filter(task => {
            const matchesStatus = filters.status.length === 0 || filters.status.includes(task.status);
            const matchesSearch = !filters.searchQuery ||
                task.title.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
                task.description.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
                task.brand?.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
                task.creativeType?.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
                task.scope?.toLowerCase().includes(filters.searchQuery.toLowerCase());

            return matchesStatus && matchesSearch;
        });
    }, [tasks, filters.status, filters.searchQuery]);

    return (
        <TaskContext.Provider value={{
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
            setSelectedTask: (task) => {
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
            seedSocialMediaData,
            allTasks: tasks
        }}>
            {children}
        </TaskContext.Provider>
    );
};

export const useTaskContext = () => {
    const context = useContext(TaskContext);
    if (!context) throw new Error("useTaskContext must be used within TaskProvider");
    return context;
};
