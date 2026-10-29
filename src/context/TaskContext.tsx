import { createContext, useContext, useState, useRef, useEffect, useMemo, useCallback, type ReactNode } from 'react';
import { format } from 'date-fns';
import type { Task, Designer, Role, Status, FilterState, Brand, CreativeType, Scope, BrandQuota } from '../types';
import { designers as initialDesigners, getCurrentWeekDays, initialTasks, initialBrands, initialCreativeTypes, initialScopes, initialQuotas } from '../services/mockData';

const uid = () => Math.random().toString(36).slice(2, 11);
const slug = (s: string) => s.toLowerCase().replace(/\s+/g, '_');
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
    const [tasks, setTasks] = useState<Task[]>(initialTasks);
    const [designers] = useState<Designer[]>(initialDesigners);
    const [activeDesignerId, setActiveDesignerId] = useState(initialDesigners[0]?.id || 'd1');
    const [role, setRole] = useState<Role>('Designer');
    const [viewMode, setViewMode] = useState<'comfortable' | 'compact'>('comfortable');

    const isLoading = false;
    const isSyncing = false;

    const [brands, setBrands] = useState<Brand[]>(initialBrands);
    const [creativeTypes, setCreativeTypes] = useState<CreativeType[]>(initialCreativeTypes);
    const [scopes, setScopes] = useState<Scope[]>(initialScopes);
    const [quotas, setQuotas] = useState<BrandQuota[]>(initialQuotas);

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


    // no login: everyone gets full access
    useEffect(() => { setRole('Manager'); }, []);

    /* In-memory data (Firebase removed); resets on reload. */
    const adjustQuota = useCallback((brandName?: string, scopeName?: string, typeName?: string, amount = 0) => {
        if (!brandName || !scopeName || !typeName) return;
        const id = `${slug(brandName)}_${slug(scopeName)}`;
        setQuotas(qs => {
            const bump = (d?: Record<string, number>) => ({ ...d, [typeName]: Math.max(0, (d?.[typeName] || 0) + amount) });
            if (qs.some(q => q.id === id)) return qs.map(q => q.id === id ? { ...q, delivered: bump(q.delivered) } : q);
            return amount > 0 ? [...qs, { id, brandId: brandName, scopeId: scopeName, targets: { [typeName]: 0 }, delivered: { [typeName]: amount } }] : qs;
        });
    }, []);

    const addTask = useCallback(async (task: Task) => {
        const id = uid();
        setTasks(ts => [...ts, { ...task, id }]);
        setLastAddedTaskId(id);
        if (task.status === 'Approved') adjustQuota(task.brand, task.scope, task.creativeType, 1);
        toast.success('Task created successfully');
    }, [adjustQuota]);

    const updateTask = useCallback(async (taskUpdate: Partial<Task> & { id: string }) => {
        const oldTask = tasks.find(t => t.id === taskUpdate.id);
        if (!oldTask) return;
        const updated = { ...oldTask, ...taskUpdate, updatedAt: new Date().toISOString() };

        const wasApproved = oldTask.status === 'Approved';
        const isApproved = updated.status === 'Approved';
        const keyChanged = oldTask.brand !== updated.brand || oldTask.scope !== updated.scope || oldTask.creativeType !== updated.creativeType;
        if (wasApproved && (!isApproved || keyChanged)) adjustQuota(oldTask.brand, oldTask.scope, oldTask.creativeType, -1);
        if (isApproved && (!wasApproved || keyChanged)) adjustQuota(updated.brand, updated.scope, updated.creativeType, 1);

        setTasks(ts => ts.map(t => t.id === updated.id ? updated : t));
        if (selectedTask?.id === updated.id) setSelectedTask(updated);
    }, [tasks, selectedTask, adjustQuota]);

    const updateTaskStatus = useCallback(async (taskId: string, status: Status) => {
        const task = tasks.find(t => t.id === taskId);
        if (!task || task.status === status) return;
        const extra = status === 'Rework' ? { reworkCount: (task.reworkCount || 0) + 1, date: format(new Date(), 'yyyy-MM-dd') } : {};
        await updateTask({ id: taskId, status, ...extra });
        toast.success(`Task marked as ${status}`);
    }, [tasks, updateTask]);

    const deleteTask = useCallback(async (taskId: string) => {
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;
        if (task.status === 'Approved') adjustQuota(task.brand, task.scope, task.creativeType, -1);
        setTasks(ts => ts.filter(t => t.id !== taskId));
        if (selectedTask?.id === taskId) {
            setSelectedTask(null);
            setIsDrawerOpen(false);
        }
        toast.success('Task removed');
    }, [tasks, selectedTask, adjustQuota]);

    const addBrand = useCallback(async (name: string) => { setBrands(b => [...b, { id: uid(), name }]); }, []);
    const deleteBrand = useCallback(async (id: string) => { setBrands(b => b.filter(x => x.id !== id)); }, []);
    const addCreativeType = useCallback(async (name: string) => { setCreativeTypes(b => [...b, { id: uid(), name }]); }, []);
    const deleteCreativeType = useCallback(async (id: string) => { setCreativeTypes(b => b.filter(x => x.id !== id)); }, []);
    const addScope = useCallback(async (name: string) => { setScopes(b => [...b, { id: uid(), name }]); }, []);
    const deleteScope = useCallback(async (id: string) => { setScopes(b => b.filter(x => x.id !== id)); }, []);

    const updateQuota = useCallback(async (quota: Partial<BrandQuota>) => {
        if (!quota.brandId || !quota.scopeId) return;
        const id = `${slug(quota.brandId)}_${slug(quota.scopeId)}`;
        setQuotas(qs => qs.some(q => q.id === id)
            ? qs.map(q => q.id === id ? { ...q, ...quota, id } : q)
            : [...qs, { targets: {}, ...quota, id } as BrandQuota]);
    }, []);
    const deleteQuota = useCallback(async (id: string) => { setQuotas(qs => qs.filter(q => q.id !== id)); }, []);

    const addComment = useCallback(async (taskId: string, text: string) => {
        const comment = { id: uid(), text, author: 'Unknown User', authorAvatar: null, timestamp: new Date().toISOString() };
        setTasks(ts => ts.map(t => t.id === taskId ? { ...t, comments: [...(t.comments || []), comment] } : t));
        setSelectedTask(sel => sel && sel.id === taskId ? { ...sel, comments: [...(sel.comments || []), comment] } : sel);
    }, []);

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
        const week = getCurrentWeekDays();
        const start = filters.dateRange.start || week[0];
        const end = filters.dateRange.end || week[week.length - 1];
        return tasks.filter(task => {
            if (task.date < start || task.date > end) return false;
            const matchesStatus = filters.status.length === 0 || filters.status.includes(task.status);
            const matchesSearch = !filters.searchQuery ||
                task.title.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
                task.description.toLowerCase().includes(filters.searchQuery.toLowerCase());
            return matchesStatus && matchesSearch;
        });
    }, [tasks, filters.status, filters.searchQuery, filters.dateRange]);

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
