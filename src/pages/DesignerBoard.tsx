import { Layout } from '../components/layout/Layout';
import { DesignerTabs } from '../components/common/DesignerTabs';
import { TaskToolbar } from '../components/task/TaskToolbar';
import { TaskGrid } from '../components/task/TaskGrid';
import { TaskDrawer } from '../components/task/TaskDrawer';
import { useTaskContext } from '../context/TaskContext';

export const DesignerBoard = () => {
    const { role, setRole } = useTaskContext();

    return (
        <Layout>
            <DesignerTabs />
            <TaskToolbar />
            <TaskGrid />
            <TaskDrawer />

            {/* Dev Tool: Role Switcher */}
            <div className="fixed bottom-4 left-4 z-50 bg-surface-dark border border-border-dark p-2 rounded-lg shadow-xl flex gap-2 backdrop-blur-sm bg-opacity-90">
                <span className="text-white text-xs font-bold uppercase self-center mr-2">Mode:</span>
                <button
                    onClick={() => setRole('Designer')}
                    className={`px-3 py-1.5 text-xs font-bold rounded transition-colors ${role === 'Designer' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-[#92adc9] hover:text-white hover:bg-[#233648]'}`}
                >
                    Designer
                </button>
                <button
                    onClick={() => setRole('Manager')}
                    className={`px-3 py-1.5 text-xs font-bold rounded transition-colors ${role === 'Manager' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-[#92adc9] hover:text-white hover:bg-[#233648]'}`}
                >
                    Manager
                </button>
            </div>
        </Layout>
    );
};
