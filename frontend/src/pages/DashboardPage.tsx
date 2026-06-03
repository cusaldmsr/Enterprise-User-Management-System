import { useDashboard, useAuditLogs } from '../hooks/useApi';
import {
  Users, ShieldCheck, Briefcase, UserCheck,
  Activity, TrendingUp, Clock, ArrowUp,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { Progress } from '../components/ui/progress';
import { ScrollArea } from '../components/ui/scroll-area';
import { Separator } from '../components/ui/separator';

const ACTION_COLORS: Record<string, { dot: string; badge: 'success' | 'muted' | 'indigo' | 'warning' | 'destructive' | 'violet' | 'cyan' }> = {
  LOGIN:           { dot: 'bg-emerald-400',  badge: 'success' },
  LOGOUT:          { dot: 'bg-slate-400',    badge: 'muted' },
  CREATE_USER:     { dot: 'bg-indigo-400',   badge: 'indigo' },
  EDIT_USER:       { dot: 'bg-amber-400',    badge: 'warning' },
  DELETE_USER:     { dot: 'bg-red-400',      badge: 'destructive' },
  PASSWORD_RESET:  { dot: 'bg-orange-400',   badge: 'warning' },
  UPLOAD_PROFILE:  { dot: 'bg-violet-400',   badge: 'violet' },
  UPLOAD_DOCUMENT: { dot: 'bg-cyan-400',     badge: 'cyan' },
};

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  trend?: string;
  gradient?: string;
}

function StatCard({ label, value, icon: Icon, iconColor, iconBg, trend, gradient }: StatCardProps) {
  return (
    <Card className={`hover:border-primary/30 hover:-translate-y-0.5 transition-all duration-200 group overflow-hidden relative ${gradient ?? ''}`}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="mb-2 text-xs font-medium tracking-wider uppercase text-muted-foreground">{label}</p>
            <p className="text-3xl font-bold text-foreground">{value}</p>
            {trend && (
              <div className="flex items-center gap-1 mt-2">
                <ArrowUp size={12} className="text-emerald-500" />
                <span className="text-xs font-medium text-emerald-500">{trend}</span>
              </div>
            )}
          </div>
          <div className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200`}>
            <Icon size={20} className={iconColor} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SkeletonStatCard() {
  return (
    <Card>
      <CardContent className="p-5">
        <Skeleton className="w-20 h-3 mb-3" />
        <Skeleton className="w-16 h-8" />
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { data: analytics, isLoading } = useDashboard();
  const { data: auditData } = useAuditLogs(1);
  const logs = auditData?.data ?? [];

  const total = analytics?.totalUsers ?? 0;
  const activeRate = total ? Math.round(((analytics?.activeAccounts ?? 0) / total) * 100) : 0;

  const roleData = [
    { label: 'Admins',   value: analytics?.totalAdmins ?? 0,        pct: total ? ((analytics?.totalAdmins ?? 0) / total) * 100 : 0,        color: 'bg-indigo-500',  progressColor: 'from-indigo-500 to-violet-500',  badge: 'indigo' as const },
    { label: 'Managers', value: analytics?.totalManagers ?? 0,       pct: total ? ((analytics?.totalManagers ?? 0) / total) * 100 : 0,       color: 'bg-amber-500',   progressColor: 'from-amber-500 to-orange-500',   badge: 'warning' as const },
    { label: 'Users',    value: analytics?.totalRegularUsers ?? 0,   pct: total ? ((analytics?.totalRegularUsers ?? 0) / total) * 100 : 0,   color: 'bg-emerald-500', progressColor: 'from-emerald-500 to-teal-500',   badge: 'success' as const },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Page header ─────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Analytics Overview</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <Badge variant="success" className="gap-1.5 px-3 py-1.5 text-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Live
        </Badge>
      </div>

      {/* ── Stat cards ──────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-5">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => <SkeletonStatCard key={i} />)
        ) : (
          <>
            <StatCard label="Total Users"     value={analytics?.totalUsers ?? 0}        icon={Users}       iconColor="text-indigo-500"  iconBg="bg-indigo-500/10"  trend="+12%" />
            <StatCard label="Admins"          value={analytics?.totalAdmins ?? 0}       icon={ShieldCheck} iconColor="text-violet-500"  iconBg="bg-violet-500/10"  />
            <StatCard label="Managers"        value={analytics?.totalManagers ?? 0}     icon={Briefcase}   iconColor="text-amber-500"   iconBg="bg-amber-500/10"   />
            <StatCard label="Regular Users"   value={analytics?.totalRegularUsers ?? 0} icon={UserCheck}   iconColor="text-emerald-500" iconBg="bg-emerald-500/10" />
            <StatCard label="Active Accounts" value={analytics?.activeAccounts ?? 0}    icon={Activity}    iconColor="text-cyan-500"    iconBg="bg-cyan-500/10"    />
          </>
        )}
      </div>

      {/* ── Bottom row ──────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">

        {/* Account health */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <TrendingUp size={16} className="text-primary" />
              Account Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <div className="flex justify-between mb-2 text-xs text-muted-foreground">
                <span>Active rate</span>
                <span className="font-semibold text-emerald-500">{activeRate}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full transition-all duration-700 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400"
                  style={{ width: `${activeRate}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 border bg-emerald-500/8 border-emerald-500/20 rounded-xl dark:bg-emerald-500/10">
                <p className="text-xs text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-emerald-500 mt-0.5">{analytics?.activeAccounts ?? 0}</p>
              </div>
              <div className="p-3 border bg-destructive/5 border-destructive/20 rounded-xl">
                <p className="text-xs text-muted-foreground">Inactive</p>
                <p className="text-2xl font-bold text-destructive mt-0.5">{analytics?.inactiveAccounts ?? 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Role distribution */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Users size={16} className="text-primary" />
              Role Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {roleData.map(({ label, value, pct, progressColor, badge }) => (
              <div key={label}>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant={badge} className="text-xs">{label}</Badge>
                  <span className="text-sm font-bold text-foreground">
                    {value}
                    <span className="ml-1 text-xs font-normal text-muted-foreground">({Math.round(pct)}%)</span>
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${progressColor} transition-all duration-700`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent activity */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Clock size={16} className="text-primary" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="px-6 pb-4 max-h-52">
              {logs.length === 0 ? (
                <p className="py-6 text-xs text-center text-muted-foreground">No recent activity</p>
              ) : (
                <div className="space-y-3">
                  {logs.slice(0, 10).map((log) => {
                    const style = ACTION_COLORS[log.action] ?? { dot: 'bg-muted-foreground', badge: 'muted' as const };
                    return (
                      <div key={log._id} className="flex items-start gap-2.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${style.dot} mt-1.5 flex-shrink-0`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs leading-relaxed">
                            <Badge variant={style.badge} className="text-[10px] px-1.5 py-0 mr-1">{log.action}</Badge>
                            {log.userId && (
                              <span className="text-muted-foreground">
                                {log.userId.firstName} {log.userId.lastName}
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground/60 mt-0.5">
                            {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}