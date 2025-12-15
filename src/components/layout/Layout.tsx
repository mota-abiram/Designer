import type { ReactNode } from 'react';
import { Header } from './Header';

export const Layout = ({ children }: { children: ReactNode }) => {
    return (
        <div className="relative flex h-screen w-full flex-col overflow-hidden bg-background-light font-display text-text-main">
            <Header />
            <div className="flex flex-1 overflow-hidden">
                <main className="flex-1 flex flex-col min-w-0">
                    {children}
                </main>
            </div>
        </div>
    );
};
