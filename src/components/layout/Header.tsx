

export const Header = () => {
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
                    <a className="text-text-main text-sm font-medium hover:text-primary transition-colors" href="#">Dashboard</a>
                </nav>
                <div className="h-6 w-px bg-border-dark"></div>
                <div
                    className="bg-center bg-no-repeat bg-cover rounded-full size-9 border border-border-dark"
                    style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBi8jXjNHhpaSwAWq9eMb3PRCIDCEXQeEImVr_E23PKVLvU-z0X5Lc4NcReNInJLpF9GOZ2i8CUSOwSHJYovmZMuCZlKLxCWTG4qjZS2bRn_W6VmbrY52vXTAfQSKb7c2DXCiFrZ22sBQ3OMKIBuGlQvrZ-SlROI-Mn4vM7A32ou9-JuL_ScTIVVLdYJ2qX0SumycaKFOkOa8R8h_gbfmg6MtbT2nvaDGXVe4WJDr0Z4ONgcg9kbuO39xrkHKZRH1KSRA8fSCFs-OA")' }}
                ></div>
            </div>
        </header>
    );
};
