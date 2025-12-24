import { Layout } from '../components/layout/Layout';
import { ScopeTrackingTab } from '../components/dashboard/ScopeTrackingTab';

export const ScopeDashboard = () => {
    return (
        <Layout>
            <div className="flex flex-col h-full bg-[#f8fafc] overflow-hidden">
                <div className="flex-none px-8 py-6 border-b border-gray-200 bg-white shadow-sm z-10">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded uppercase tracking-wider">Social Media</span>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Scope Dashboard</h1>
                    </div>
                    <p className="text-sm text-slate-500">Tracking Statics & Reels distribution per Brand</p>
                </div>

                <div className="flex-1 overflow-auto p-8">
                    <div className="max-w-7xl mx-auto">
                        <ScopeTrackingTab />
                    </div>
                </div>
            </div>
        </Layout>
    );
};
