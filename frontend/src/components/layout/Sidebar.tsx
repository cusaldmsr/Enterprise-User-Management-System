import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Upload, FileText,
  LogOut, ShieldCheck, ChevronRight, Menu, X,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { authApi } from '../../services/api';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '../ui/tooltip';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/users',     icon: Users,           label: 'Users' },
  { to: '/uploads',   icon: Upload,          label: 'Uploads' },
  { to: '/documents', icon: FileText,        label: 'Documents' },
];

const roleBadgeVariant: Record<string, 'indigo' | 'warning' | 'success'> = {
  ADMIN:   'indigo',
  MANAGER: 'warning',
  USER:    'success',
};

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try { await authApi.logout(); } catch { /* swallow */ }
    clearAuth();
    navigate('/login');
  };

  const roleName = (user?.role as { name?: string })?.name ?? 'USER';
  const avatar = user?.profileImage || `https://api.dicebear.com/8.x/avataaars/svg?seed=${user?.firstName}`;
  const initials = `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`;

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          'flex flex-col h-full border-r border-border bg-sidebar-background text-sidebar-foreground transition-all duration-300 ease-in-out',
          collapsed ? 'w-16' : 'w-64'
        )}
      >
        {/* ── Logo ─────────────────────────────────────── */}
        <div className={cn(
          'flex items-center gap-3 border-b border-sidebar-border transition-all duration-300',
          collapsed ? 'px-3 py-4 justify-center' : 'px-4 py-4'
        )}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/30">
            <ShieldCheck size={18} className="text-white" />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                EUMS
              </p>
              <p className="text-xs text-muted-foreground truncate">Enterprise System</p>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onToggle}
            className={cn('flex-shrink-0', collapsed && 'mt-0')}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <Menu size={16} /> : <X size={16} />}
          </Button>
        </div>

        {/* ── Navigation ────────────────────────────────── */}
        <ScrollArea className="flex-1 py-3">
          <nav className="px-2 space-y-1">
            {navItems.map(({ to, icon: Icon, label }) => (
              collapsed ? (
                <Tooltip key={to}>
                  <TooltipTrigger asChild>
                    <NavLink
                      to={to}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center justify-center w-full p-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                          isActive
                            ? 'bg-sidebar-primary/15 text-sidebar-primary border border-sidebar-primary/30 shadow-sm'
                            : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent'
                        )
                      }
                    >
                      <Icon size={18} className="flex-shrink-0" />
                    </NavLink>
                  </TooltipTrigger>
                  <TooltipContent side="right">{label}</TooltipContent>
                </Tooltip>
              ) : (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group',
                      isActive
                        ? 'bg-sidebar-primary/15 text-sidebar-primary border border-sidebar-primary/30 shadow-sm'
                        : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent'
                    )
                  }
                >
                  <Icon size={18} className="flex-shrink-0" />
                  <span className="flex-1">{label}</span>
                  <ChevronRight size={14} className="opacity-30 group-hover:opacity-60 transition-opacity" />
                </NavLink>
              )
            ))}
          </nav>
        </ScrollArea>

        <Separator className="bg-sidebar-border" />

        {/* ── User profile ──────────────────────────────── */}
        <div className="p-3 space-y-2">
          {!collapsed && (
            <div className="flex items-center gap-3 px-2 py-2.5 rounded-xl bg-sidebar-accent/60">
              <Avatar className="h-8 w-8 border-2 border-sidebar-border flex-shrink-0">
                <AvatarImage src={avatar} alt={user?.firstName} />
                <AvatarFallback className="text-xs bg-indigo-500/20 text-indigo-400">{initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <Badge variant={roleBadgeVariant[roleName] ?? 'muted'} className="text-[10px] px-1.5 py-0 mt-0.5">
                  {roleName}
                </Badge>
              </div>
            </div>
          )}

          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={handleLogout}
                  className="w-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                >
                  <LogOut size={16} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Logout</TooltipContent>
            </Tooltip>
          ) : (
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 border border-transparent hover:border-destructive/20 transition-all"
              onClick={handleLogout}
            >
              <LogOut size={16} className="flex-shrink-0" />
              Logout
            </Button>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}
