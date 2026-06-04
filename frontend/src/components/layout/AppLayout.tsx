import { useState, useRef } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { useAuthStore } from "../../store/authStore";
import { cn } from "@/lib/utils";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { HelpdeskWidget } from "../ui/HelpdeskWidget";

// Minimal page metadata map (keeps layout typesafe)
const pageMeta: Record<string, { title: string; subtitle?: string }> = {
  "/dashboard": { title: "Dashboard", subtitle: "" },
  "/users": { title: "Users", subtitle: "" },
  "/documents": { title: "Documents", subtitle: "" },
};

export function AppLayout() {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const mainRef = useRef<HTMLElement>(null);

  // Animate page transitions on route change
  useGSAP(() => {
    if (mainRef.current) {
      gsap.fromTo(
        mainRef.current,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" },
      );
    }
  }, [location.pathname]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const meta = pageMeta[location.pathname] ?? { title: "EUMS", subtitle: "" };

  return (
    <div
      className={cn("flex h-screen overflow-hidden bg-background/95 relative")}
    >
      {/* Decorative Background Blob for modern feel */}
      <div className="absolute top-0 rounded-full pointer-events-none left-60 w-96 h-96 bg-primary/5 blur-3xl -z-10" />

      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((v) => !v)}
      />
      <div className="z-10 flex flex-col flex-1 min-w-0 overflow-hidden">
        <Navbar title={meta.title} subtitle={meta.subtitle} />

        {/* Animated Main Container */}
        <main ref={mainRef} className="flex-1 p-6 overflow-y-auto lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* Helpdesk Widget — floats over all authenticated pages */}
      <HelpdeskWidget />
    </div>
  );
}
