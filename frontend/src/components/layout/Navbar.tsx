import { useState, useRef, useEffect } from 'react';
import { Bell, Search, CheckCheck, Moon, Sun, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNotifications, useMarkAllNotificationsRead, useMarkNotificationRead } from '../../hooks/useApi';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { useThemeStore } from '../../store/themeStore';
import { cn } from '@/lib/utils';

interface NavbarProps {
  title: string;
  subtitle?: string;
}

export function Navbar({ title, subtitle }: NavbarProps) {
  const [showNotifs, setShowNotifs] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const { theme, toggleTheme } = useThemeStore();

  const { data } = useNotifications();
  const notifications = data?.data ?? [];
  const unreadCount = data?.meta?.unreadCount ?? 0;

  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header className="flex items-center justify-between h-16 px-6 bg-card border-b border-border flex-shrink-0 gap-4">
      {/* Title */}
      <div className="min-w-0">
        <h1 className="text-lg font-semibold text-foreground truncate">{title}</h1>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Search */}
        <div className="relative hidden md:flex items-center">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            placeholder="Quick search..."
            className="w-52 pl-9 h-9 bg-muted/50 border-border focus-visible:ring-primary/30"
          />
        </div>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          className="h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground"
        >
          {theme === 'dark'
            ? <Sun size={16} className="rotate-0 scale-100 transition-transform" />
            : <Moon size={16} className="rotate-0 scale-100 transition-transform" />
          }
        </Button>

        {/* Notifications */}
        <div className="relative" ref={panelRef}>
          <Button
            id="notif-btn"
            variant="ghost"
            size="icon"
            onClick={() => setShowNotifs(v => !v)}
            className="relative h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground"
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <Badge
                variant="default"
                className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] p-0 flex items-center justify-center bg-primary"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </Badge>
            )}
          </Button>

          {/* Notification Panel */}
          {showNotifs && (
            <div className={cn(
              "absolute right-0 top-11 w-80 z-50 animate-slide-up",
              "bg-card border border-border rounded-2xl shadow-2xl shadow-black/20 overflow-hidden"
            )}>
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <Bell size={14} className="text-primary" />
                  <span className="text-sm font-semibold">Notifications</span>
                  {unreadCount > 0 && (
                    <Badge variant="indigo" className="text-[10px] px-1.5 py-0">
                      {unreadCount} new
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markAllRead.mutate()}
                      className="h-7 text-xs text-primary hover:text-primary px-2"
                    >
                      <CheckCheck size={12} className="mr-1" />
                      Mark all read
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setShowNotifs(false)}
                    className="h-7 w-7 text-muted-foreground"
                  >
                    <X size={12} />
                  </Button>
                </div>
              </div>

              {/* List */}
              <ScrollArea className="max-h-80">
                {notifications.length === 0 ? (
                  <div className="py-10 text-center">
                    <Bell size={28} className="text-muted mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No notifications</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {notifications.map((n) => (
                      <div
                        key={n._id}
                        onClick={() => !n.isRead && markRead.mutate(n._id)}
                        className={cn(
                          'px-4 py-3 cursor-pointer transition-colors hover:bg-muted/50',
                          !n.isRead && 'bg-primary/5'
                        )}
                      >
                        <div className="flex items-start gap-3">
                          {!n.isRead && (
                            <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 mt-2" />
                          )}
                          <div className={cn('min-w-0', n.isRead && 'pl-4')}>
                            <p className="text-sm font-medium text-foreground truncate">{n.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                            <p className="text-xs text-muted-foreground/60 mt-1">
                              {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
              <Separator />
              <div className="px-4 py-2.5 text-center">
                <span className="text-xs text-muted-foreground">
                  {notifications.length} total notifications
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
