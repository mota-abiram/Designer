import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';

export const Header = () => {
    const { logout, user } = useAuth();
    const location = useLocation();
    const [isDashboardOpen, setIsDashboardOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDashboardOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const isDashboardActive = location.pathname === '/dashboard' || location.pathname === '/scope';

    return (
        <header className="flex-none flex items-center justify-between whitespace-nowrap border-b border-solid border-border-dark bg-background-dark px-6 py-3 z-20">
            <div className="flex items-center gap-4">
                <Link to="/" className="flex items-center gap-4 hover:opacity-80 transition-opacity">
                    <div className="size-8 flex items-center justify-center rounded bg-primary/20 text-primary">
                        <span className="material-symbols-outlined">grid_view</span>
                    </div>
                    <h2 className="text-text-main text-lg font-bold leading-tight tracking-tight">Designer Task Tracker</h2>
                </Link>
            </div>
            <div className="flex items-center gap-6">
                <nav className="hidden md:flex items-center gap-6">
                    {/* Dashboard Dropdown */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setIsDashboardOpen(!isDashboardOpen)}
                            className={`flex items-center gap-1 text-sm font-medium transition-colors ${isDashboardActive ? 'text-text-main font-bold' : 'text-text-muted hover:text-text-main'}`}
                        >
                            Dashboard
                            <span className={`material-symbols-outlined text-[18px] transition-transform duration-200 ${isDashboardOpen ? 'rotate-180' : ''}`}>
                                expand_more
                            </span>
                        </button>

                        {isDashboardOpen && (
                            <div className="absolute top-full left-0 mt-2 w-48 bg-surface-dark border border-border-dark rounded-xl shadow-xl py-2 z-30 animate-in fade-in zoom-in-95 duration-200">
                                <Link
                                    to="/dashboard"
                                    onClick={() => setIsDashboardOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-2 text-sm transition-colors ${location.pathname === '/dashboard' ? 'bg-primary/10 text-primary font-bold' : 'text-text-muted hover:bg-white/5 hover:text-text-main'}`}
                                >
                                    <span className="material-symbols-outlined text-[18px]">monitoring</span>
                                    Performance
                                </Link>
                                <Link
                                    to="/scope"
                                    onClick={() => setIsDashboardOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-2 text-sm transition-colors ${location.pathname === '/scope' ? 'bg-primary/10 text-primary font-bold' : 'text-text-muted hover:bg-white/5 hover:text-text-main'}`}
                                >
                                    <span className="material-symbols-outlined text-[18px]">analytics</span>
                                    Scope Tracking
                                </Link>
                            </div>
                        )}
                    </div>

                    <Link
                        to="/"
                        className={`text-sm font-medium transition-colors ${location.pathname === '/' ? 'text-text-main font-bold' : 'text-text-muted hover:text-text-main'}`}
                    >
                        Board
                    </Link>

                    <Link
                        to="/categories"
                        className={`text-sm font-medium transition-colors ${location.pathname === '/categories' ? 'text-text-main font-bold' : 'text-text-muted hover:text-text-main'}`}
                    >
                        Onboarding
                    </Link>
                    <div className="h-4 w-px bg-border-dark mx-2"></div>
                    <button
                        onClick={() => logout()}
                        className="text-text-muted text-sm font-medium hover:text-red-500 transition-colors cursor-pointer"
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
                    <div className="bg-primary/20 text-primary rounded-full size-9 flex items-center justify-center border border-border-dark font-semibold">
                        {user?.displayName?.[0] || "U"}
                    </div>
                )}
            </div>
        </header>
    );
};
