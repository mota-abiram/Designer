
import { useAuth } from '../../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';

export const Header = () => {
    const { logout, user } = useAuth();
    const location = useLocation();

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
                    <Link
                        to="/"
                        className={`text-sm font-medium transition-colors ${location.pathname === '/' ? 'text-text-main font-bold' : 'text-text-muted hover:text-text-main'}`}
                    >
                        Board
                    </Link>
                    <Link
                        to="/dashboard"
                        className={`text-sm font-medium transition-colors ${location.pathname === '/dashboard' ? 'text-text-main font-bold' : 'text-text-muted hover:text-text-main'}`}
                    >
                        Dashboard
                    </Link>
                    <Link
                        to="/scope"
                        className={`text-sm font-medium transition-colors ${location.pathname === '/scope' ? 'text-text-main font-bold' : 'text-text-muted hover:text-text-main'}`}
                    >
                        Scope
                    </Link>
                    <Link
                        to="/categories"
                        className={`text-sm font-medium transition-colors ${location.pathname === '/categories' ? 'text-text-main font-bold' : 'text-text-muted hover:text-text-main'}`}
                    >
                        Categories
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
