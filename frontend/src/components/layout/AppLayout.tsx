import { useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { useAuthStore } from '../../store/authStore';
import { cn } from '@/lib/utils';

const pageMeta: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': { title: 'Dashboard',        subtitle: 'Analytics overview and recent activity' },
  '/users':     { title: 'User Management',  subtitle: 'Create, edit and manage user accounts' },
  '/uploads':   { title: 'Profile Upload',   subtitle: 'Upload profile images to Cloudinary' },
  '/documents': { title: 'Documents',        subtitle: 'Manage files stored on AWS S3' },
};

export function AppLayout() {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const meta = pageMeta[location.pathname] ?? { title: 'EUMS', subtitle: '' };

  return (
    <div className={cn("flex h-screen overflow-hidden bg-background")}>
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(v => !v)}
      />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Navbar title={meta.title} subtitle={meta.subtitle} />
        <main className="flex-1 overflow-y-auto p-6 bg-background">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
