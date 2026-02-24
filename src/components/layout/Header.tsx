import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useTaskContext } from '../../context/TaskContext';
import { cn } from '../../utils/cn';

export const Header = () => {
    const { logout, user } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const { allTasks, role, setFilters, setSelectedTask } = useTaskContext();
    const location = useLocation();
    const navigate = useNavigate();
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const isDashboardActive = location.pathname === '/dashboard';

    const pendingApprovals = allTasks.filter(t => t.status === 'Pending Approval');
    const pendingCount = pendingApprovals.length;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsNotificationOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleReviewTask = (task: any) => {
        setIsNotificationOpen(false);
        setFilters({
            status: [],
            dateRange: { start: null, end: null },
            searchQuery: ''
        });
        setSelectedTask(task);
        if (location.pathname !== '/') {
            navigate('/');
        }
    };

    return (
        <header className="flex-none flex items-center justify-between whitespace-nowrap border-b-2 border-solid border-primary bg-surface-light dark:bg-surface-dark px-6 py-3 z-20 transition-colors duration-300">
            <div className="flex items-center gap-4">
                <Link to="/" className="flex items-center gap-4 hover:opacity-80 transition-opacity">
                    <div className="size-8 flex items-center justify-center rounded bg-primary text-slate-900 shadow-sm shadow-primary/20">
                        <span className="material-symbols-outlined font-bold">grid_view</span>
                    </div>
                    <h2 className="text-text-main dark:text-text-main-dark text-lg font-bold leading-tight tracking-wide">Designer Task Tracker</h2>
                </Link>
            </div>
            <div className="flex items-center gap-6">
                <nav className="hidden md:flex items-center gap-6">
                    {role === 'Manager' && (
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                                className="relative p-1.5 rounded-lg text-text-muted dark:text-text-muted-dark hover:text-text-main dark:hover:text-text-main-dark hover:bg-surface-dark/10 dark:hover:bg-surface-light/10 transition-all flex items-center justify-center group"
                                title={`${pendingCount} tasks pending approval`}
                            >
                                <span className={`material-symbols-outlined text-[24px] transition-colors ${pendingCount > 0 ? 'text-red-500 animate-pulse' : ''}`}>
                                    notifications
                                </span>
                                {pendingCount > 0 && (
                                    <span className="absolute -top-1 -right-1 size-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-surface-light dark:border-surface-dark shadow-sm">
                                        {pendingCount}
                                    </span>
                                )}
                            </button>

                            {/* Notifications Dropdown */}
                            {isNotificationOpen && (
                                <div className="absolute right-0 mt-2 w-80 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="px-4 py-3 border-b border-border-light dark:border-border-dark bg-gray-50 dark:bg-slate-800/50 flex items-center justify-between">
                                        <span className="text-xs font-bold text-text-main dark:text-text-main-dark uppercase tracking-wider">Pending Approvals</span>
                                        <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full">{pendingCount}</span>
                                    </div>
                                    <div className="max-h-96 overflow-y-auto">
                                        {pendingApprovals.length > 0 ? (
                                            pendingApprovals.map((task) => (
                                                <button
                                                    key={task.id}
                                                    onClick={() => handleReviewTask(task)}
                                                    className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-800/50 border-b border-border-light/50 dark:border-border-dark/50 last:border-0 transition-colors group"
                                                >
                                                    <div className="flex flex-col gap-1">
                                                        <div className="text-sm font-bold text-text-main dark:text-text-main-dark group-hover:text-primary transition-colors flex items-center justify-between">
                                                            {task.title}
                                                            <span className="material-symbols-outlined text-xs">arrow_forward</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="px-1.5 py-0.5 bg-primary/10 text-primary dark:text-primary-dark text-[9px] font-bold uppercase rounded">
                                                                {task.brand || 'No Brand'}
                                                            </span>
                                                            <span className="text-[10px] text-text-muted dark:text-text-muted-dark font-medium uppercase tracking-tight italic">
                                                                By Designer #{task.designerId}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </button>
                                            ))
                                        ) : (
                                            <div className="px-4 py-8 text-center bg-white dark:bg-slate-800/30">
                                                <span className="material-symbols-outlined text-3xl text-slate-300 mb-2">check_circle</span>
                                                <p className="text-xs font-bold text-text-muted dark:text-text-muted-dark">No tasks pending review</p>
                                            </div>
                                        )}
                                    </div>
                                    {pendingCount > 0 && (
                                        <div className="px-4 py-2 bg-gray-50 dark:bg-slate-800/30 border-t border-border-light dark:border-border-dark text-center">
                                            <button
                                                onClick={() => {
                                                    setIsNotificationOpen(false);
                                                    navigate('/dashboard', { state: { tab: 'pending' } });
                                                }}
                                                className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline"
                                            >
                                                View All in Dashboard
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    <Link
                        to="/dashboard"
                        className={`text-l font-bold tracking-wide transition-colors ${isDashboardActive ? 'text-text-main dark:text-text-main-dark' : 'text-text-muted dark:text-text-muted-dark hover:text-text-main dark:hover:text-text-main-dark'}`}
                    >
                        Dashboard
                    </Link>

                    <Link
                        to="/"
                        className={`text-l font-bold tracking-wide transition-colors ${location.pathname === '/' ? 'text-text-main dark:text-text-main-dark' : 'text-text-muted dark:text-text-muted-dark hover:text-text-main dark:hover:text-text-main-dark'}`}
                    >
                        Board
                    </Link>

                    <Link
                        to="/categories"
                        className={`text-l font-bold  tracking-wide transition-colors ${location.pathname === '/categories' ? 'text-text-main dark:text-text-main-dark' : 'text-text-muted dark:text-text-muted-dark hover:text-text-main dark:hover:text-text-main-dark'}`}
                    >
                        Onboarding
                    </Link>
                    <div className="h-4 w-px bg-border-light dark:border-border-dark mx-2"></div>
                    <button
                        onClick={toggleTheme}
                        className="p-1.5 rounded-lg text-text-muted dark:text-text-muted-dark hover:text-text-main dark:hover:text-text-main-dark hover:bg-surface-dark/10 dark:hover:bg-surface-light/10 transition-all flex items-center justify-center"
                        title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
                    >
                        <span className="material-symbols-outlined text-[20px]">
                            {theme === 'light' ? 'dark_mode' : 'light_mode'}
                        </span>
                    </button>
                    <div className="h-4 w-px bg-border-light dark:border-border-dark mx-2"></div>
                    <button
                        onClick={() => logout()}
                        className="text-text-muted dark:text-text-muted-dark text-l font-bold tracking-wide hover:text-red-500 transition-colors cursor-pointer"
                    >
                        Logout
                    </button>
                </nav>
                <div className="h-6 w-px bg-border-dark"></div>
                {user?.photoURL ? (
                    <img
                        src={user.photoURL}
                        alt={user.displayName || "User"}
                        className="rounded-full size-9 border border-border-dark object-cover"
                    />
                ) : (
                    <div className="bg-primary text-slate-900 rounded-full size-9 flex items-center justify-center border-2 border-primary shadow-sm font-bold">
                        {user?.displayName?.[0] || "U"}
                    </div>
                )}
            </div>
        </header>
    );
};
