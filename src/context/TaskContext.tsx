import { createContext, useContext, useState, useRef, useEffect, type ReactNode } from 'react';
import type { Task, Designer, Role, Status, FilterState, Brand, CreativeType, Scope, BrandQuota } from '../types';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, writeBatch, where, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from './AuthContext';
import { designers as initialDesigners, getCurrentWeekDays } from '../services/mockData';
import { ADMIN_EMAILS } from '../services/adminList';
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

    // Brands & Creative Types & Scopes
    brands: Brand[];
    addBrand: (name: string) => void;
    deleteBrand: (id: string) => void;
    creativeTypes: CreativeType[];
    addCreativeType: (name: string) => void;
    deleteCreativeType: (id: string) => void;
    scopes: Scope[];
    addScope: (name: string) => void;
    deleteScope: (id: string) => void;

    // Quotas
    quotas: BrandQuota[];
    updateQuota: (quota: Partial<BrandQuota>) => void;
    deleteQuota: (id: string) => void;

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

    // View Mode
    viewMode: 'comfortable' | 'compact';
    setViewMode: (mode: 'comfortable' | 'compact') => void;

    // Development/Seeding
    seedSocialMediaData: () => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider = ({ children }: { children: ReactNode }) => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [designers] = useState<Designer[]>(initialDesigners);
    const [activeDesignerId, setActiveDesignerId] = useState<string>(initialDesigners[0]?.id || 'd1');
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
        dateRange: { start: null, end: null }
    });

    const scrollContainerRef = useRef<HTMLDivElement | null>(null);
    const [lastAddedTaskId, setLastAddedTaskId] = useState<string | null>(null);

    // Real-time listener for tasks
    const { user } = useAuth();

    // Auto-assign role based on email
    useEffect(() => {
        if (user?.email && ADMIN_EMAILS.includes(user.email)) {
            setRole('Manager');
        } else {
            setRole('Designer');
        }
    }, [user]);

    useEffect(() => {
        if (!user) {
            setTasks([]);
            return;
        }

        // Determine date range for subscription
        const currentWeek = getCurrentWeekDays();
        const startDate = filters.dateRange.start || currentWeek[0];
        const endDate = filters.dateRange.end || currentWeek[currentWeek.length - 1];

        const q = query(
            collection(db, "tasks"),
            where("date", ">=", startDate),
            where("date", "<=", endDate)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedTasks: Task[] = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Task));
            setTasks(fetchedTasks);
        }, (error) => {
            console.error("Error fetching tasks:", error);
        });

        return () => unsubscribe();
    }, [user, filters.dateRange]);

    // Real-time listener for brands
    useEffect(() => {
        if (!user) return;
        const q = query(collection(db, "brands"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedBrands = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Brand));
            setBrands(fetchedBrands.sort((a, b) => a.name.localeCompare(b.name)));
        });
        return () => unsubscribe();
    }, [user]);

    // Real-time listener for creative types
    useEffect(() => {
        if (!user) return;
        const q = query(collection(db, "creativeTypes"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedTypes = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as CreativeType));
            setCreativeTypes(fetchedTypes.sort((a, b) => a.name.localeCompare(b.name)));
        });
        return () => unsubscribe();
    }, [user]);

    // Real-time listener for scopes
    useEffect(() => {
        if (!user) return;
        const q = query(collection(db, "scopes"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedScopes = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Scope));
            setScopes(fetchedScopes.sort((a, b) => a.name.localeCompare(b.name)));
        });
        return () => unsubscribe();
    }, [user]);

    // Real-time listener for quotas
    useEffect(() => {
        if (!user) return;
        const q = query(collection(db, "quotas"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedQuotas = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as BrandQuota));
            setQuotas(fetchedQuotas);
        });
        return () => unsubscribe();
    }, [user]);

    const addTask = async (task: Task) => {
        try {
            const { id, ...taskData } = task;
            const docRef = await addDoc(collection(db, "tasks"), taskData);
            setLastAddedTaskId(docRef.id);
        } catch (e) {
            console.error("Error adding task: ", e);
        }
    };

    const addDesigner = async (name: string) => {
        console.warn("Adding designers is disabled in constant mode.", name);
    };

    const updateTaskStatus = async (taskId: string, status: Status) => {
        try {
            const now = new Date().toISOString();
            if (selectedTask?.id === taskId) {
                setSelectedTask(prev => prev ? { ...prev, status, updatedAt: now } : null);
            }
            const taskRef = doc(db, "tasks", taskId);
            await updateDoc(taskRef, {
                status,
                updatedAt: now
            });
        } catch (e) {
            console.error("Error updating status: ", e);
        }
    };

    const updateTask = async (updatedTask: Task) => {
        try {
            const { id, ...data } = updatedTask;
            const finalData = { ...data, updatedAt: new Date().toISOString() };
            if (selectedTask?.id === updatedTask.id) {
                setSelectedTask({ ...updatedTask, updatedAt: finalData.updatedAt });
            }
            const taskRef = doc(db, "tasks", updatedTask.id);
            await updateDoc(taskRef, finalData);
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

    const addBrand = async (name: string) => {
        try {
            await addDoc(collection(db, "brands"), {
                name,
                createdAt: new Date().toISOString()
            });
        } catch (e) {
            console.error("Error adding brand: ", e);
        }
    };

    const deleteBrand = async (id: string) => {
        try {
            await deleteDoc(doc(db, "brands", id));
        } catch (e) {
            console.error("Error deleting brand: ", e);
        }
    };

    const addCreativeType = async (name: string) => {
        try {
            await addDoc(collection(db, "creativeTypes"), {
                name,
                createdAt: new Date().toISOString()
            });
        } catch (e) {
            console.error("Error adding creative type: ", e);
        }
    };

    const deleteCreativeType = async (id: string) => {
        try {
            await deleteDoc(doc(db, "creativeTypes", id));
        } catch (e) {
            console.error("Error deleting creative type: ", e);
        }
    };

    const addScope = async (name: string) => {
        try {
            await addDoc(collection(db, "scopes"), {
                name,
                createdAt: new Date().toISOString()
            });
        } catch (e) {
            console.error("Error adding scope: ", e);
        }
    };

    const deleteScope = async (id: string) => {
        try {
            await deleteDoc(doc(db, "scopes", id));
        } catch (e) {
            console.error("Error deleting scope: ", e);
        }
    };

    const deleteQuota = async (id: string) => {
        try {
            await deleteDoc(doc(db, "quotas", id));
        } catch (e) {
            console.error("Error deleting quota: ", e);
        }
    };

    const updateQuota = async (quota: Partial<BrandQuota>) => {
        if (!quota.brandId || !quota.scopeId) return;
        const id = `${quota.brandId}_${quota.scopeId}`;
        try {
            await setDoc(doc(db, "quotas", id), {
                ...quota,
                id
            }, { merge: true });
        } catch (e) {
            console.error("Error updating quota: ", e);
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

    const seedSocialMediaData = async () => {
        console.log("Seeding social media data...");
        const batch = writeBatch(db);

        // 1. Ensure Scopes exist
        const smScopeName = "Social Media";
        const staticsTypeName = "Statics";
        const reelsTypeName = "Reels";

        // This is a bit complex for a one-off but let's do it right.
        // We'll just create them and use the IDs.

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
            { brand: "Saket Veda", designer: "Abhishek", sS: 4, sR: 2, dS: 4, dR: 0 },
            { brand: "Saket Bhusatva", designer: "Abhishek", sS: 8, sR: 4, dS: 8, dR: 0 },
            { brand: "Saket Pranamam", designer: "Abhishek", sS: 8, sR: 4, dS: 8, dR: 0 },
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
            { brand: "Rail Cab", designer: "8", sS: 0, sR: 4, dS: 0, dR: 2 }, // Fixed based on user input for last row
        ];

        // We'll just define them by name for now and the dashboard will lookup by name if needed,
        // but it's better to create the Brand docs first.

        for (const item of data) {
            const brandId = item.brand.toLowerCase().replace(/\s+/g, '_');
            const brandRef = doc(db, "brands", brandId);
            batch.set(brandRef, { name: item.brand, createdAt: new Date().toISOString() });

            const quotaId = `${brandId}_social_media`;
            const quotaRef = doc(db, "quotas", quotaId);
            batch.set(quotaRef, {
                id: quotaId,
                brandId: item.brand, // Use name for simple lookup in dashboard
                scopeId: "Social Media",
                targets: {
                    "Statics": item.sS,
                    "Reels": item.sR
                },
                assignedDesigner: item.designer
            });

            // If delivered counts > 0, we can seed some tasks too, but maybe better to just show Delivered next to it.
            // For now, let's just seed the delivered as metadata or just let tasks handle it.
            // Actually, "Delivered" in the table is likely a snapshot.
            // I'll add "delivered" to quota as well for historical reference if they don't want to add all tasks.
            batch.update(quotaRef, {
                delivered: {
                    "Statics": item.dS,
                    "Reels": item.dR
                }
            });
        }

        // Add Scope and Types if missing
        batch.set(doc(db, "scopes", "social_media"), { name: "Social Media" });
        batch.set(doc(db, "creativeTypes", "statics"), { name: "Statics" });
        batch.set(doc(db, "creativeTypes", "reels"), { name: "Reels" });

        await batch.commit();
        console.log("Seeding complete!");
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
        lastAddedTaskId,
        viewMode,
        setViewMode,
        seedSocialMediaData
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
