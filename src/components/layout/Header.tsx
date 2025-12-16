
import { useAuth } from '../../context/AuthContext';

export const Header = () => {
    const { logout, user } = useAuth();

    return (
        <header className="flex-none flex items-center justify-between whitespace-nowrap border-b border-solid border-border-dark bg-background-dark px-6 py-3 z-20">
            <div className="flex items-center gap-4">
                <div className="size-8 flex items-center justify-center rounded bg-primary/20 text-primary">
                    <span className="material-symbols-outlined">grid_view</span>
                </div>
                <h2 className="text-text-main text-lg font-bold leading-tight tracking-tight">Design Tracker</h2>
            </div>
            <div className="flex items-center gap-6">
                <nav className="hidden md:flex items-center gap-6">
                    <button
                        onClick={() => logout()}
                        className="text-text-main text-sm font-medium hover:text-red-500 transition-colors cursor-pointer"
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
