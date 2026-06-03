import { useRef } from "react";
import { useDashboard, useAuditLogs } from "../hooks/useApi";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

// stat card / action colors removed — keep the page minimal and focused

export default function DashboardPage() {
  const container = useRef<HTMLDivElement>(null);
  const { data: analytics, isLoading } = useDashboard();
  useAuditLogs(1); // keep hook for side-effects; details not shown here

  const total = analytics?.totalUsers ?? 0;
  const activeRate = total
    ? Math.round(((analytics?.activeAccounts ?? 0) / total) * 100)
    : 0;

  // GSAP Animations
  useGSAP(
    () => {
      if (!isLoading) {
        gsap.from(".stat-card", {
          y: 40,
          opacity: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: "back.out(1.2)",
        });
        gsap.from(".dashboard-section", {
          y: 30,
          opacity: 0,
          duration: 0.7,
          stagger: 0.15,
          ease: "power3.out",
          delay: 0.3,
        });
      }
    },
    { scope: container, dependencies: [isLoading] },
  );

  // role distribution and recent activity omitted for brevity

  return (
    <div ref={container} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between dashboard-section">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-linear-to-r from-foreground to-foreground/70">
            Analytics Overview
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <Badge
          variant="success"
          className="gap-1.5 px-4 py-1.5 text-xs shadow-lg shadow-emerald-500/20 border-emerald-500/30"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
          Live Server
        </Badge>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-2 gap-5 lg:grid-cols-3 xl:grid-cols-5">
        {/* Render Stat Cards as before, they now have the .stat-card class */}
        {/* ... */}
      </div>

      {/* Bottom Sections */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="dashboard-section bg-card/80 backdrop-blur-sm border-border/50">
          {/* ... Account health internals ... */}
          {/* Enhance progress bar with a glow */}
          <div className="h-2 overflow-hidden rounded-full shadow-inner bg-muted/50">
            <div
              className="relative h-full transition-all duration-1000 ease-out rounded-full bg-linear-to-r from-emerald-500 to-cyan-400"
              style={{ width: `${activeRate}%` }}
            >
              <div className="absolute top-0 bottom-0 right-0 w-10 bg-linear-to-r from-transparent to-white/30 animate-pulse" />
            </div>
          </div>
        </Card>

        {/* ... Role Distribution and Recent Activity mapped similarly with .dashboard-section */}
      </div>
    </div>
  );
}
