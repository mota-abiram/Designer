import { Layout } from '../components/layout/Layout';
import { DesignerTabs } from '../components/common/DesignerTabs';
import { TaskToolbar } from '../components/task/TaskToolbar';
import { TaskGrid } from '../components/task/TaskGrid';
import { TaskDrawer } from '../components/task/TaskDrawer';
import { AddTaskModal } from '../components/task/AddTaskModal';
import { AddDesignerModal } from '../components/common/AddDesignerModal';

export const DesignerBoard = () => {
    return (
        <Layout>
            <DesignerTabs />
            <TaskToolbar />
            <TaskGrid />
            <TaskDrawer />
            <AddTaskModal />
            <AddDesignerModal />


        </Layout>
    );
};
