import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { TaskProvider } from './context/TaskContext';
import { DesignerBoard } from './pages/DesignerBoard';
import { Dashboard } from './pages/Dashboard';
import { ScopeDashboard } from './pages/ScopeDashboard';
import { Categories } from './pages/Categories';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
      <ThemeProvider>
        <TaskProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={
                <DesignerBoard />
              } />
              <Route path="/dashboard" element={
                <Dashboard />
              } />
              <Route path="/scope" element={
                <ScopeDashboard />
              } />
              <Route path="/categories" element={
                <Categories />
              } />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#1e293b',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 500,
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </TaskProvider>
      </ThemeProvider>
  );
}

export default App;

