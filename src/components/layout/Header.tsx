import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export const Header = () => {
    const { logout, user } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const location = useLocation();

    const isDashboardActive = location.pathname === '/dashboard';

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
