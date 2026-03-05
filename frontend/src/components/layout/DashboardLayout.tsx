import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard, Bot, Users, Play, BarChart3, Shield, FileText,
  CreditCard, Settings, LogOut, Menu, X, ChevronRight, Zap,
  Target, Bell, Link2, ClipboardCheck, Calendar, DownloadCloud
} from "lucide-react";
import clsx from "clsx";
import { api } from "@/lib/api";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Agents", icon: Bot, path: "/agents" },
  { label: "Agent Builder", icon: Zap, path: "/agents/new" },
  { label: "Teams", icon: Users, path: "/teams" },
  { label: "Executions", icon: Play, path: "/executions" },
  { label: "Confidence & Risk", icon: BarChart3, path: "/confidence" },
  { label: "Governance", icon: Shield, path: "/governance" },
  { label: "Integrations", icon: Link2, path: "/integrations" },
  { label: "Review Queue", icon: ClipboardCheck, path: "/reviews", badge: "reviews" },
  { label: "Schedules", icon: Calendar, path: "/schedules" },
  { label: "Reports", icon: DownloadCloud, path: "/reports" },
  { label: "Audit Log", icon: FileText, path: "/audit" },
  { label: "KPI Builder", icon: Target, path: "/kpi" },
  { label: "Billing", icon: CreditCard, path: "/billing" },
  { label: "Settings", icon: Settings, path: "/settings" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingReviews, setPendingReviews] = useState(0);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Poll for pending review count every 60 seconds
  useEffect(() => {
    const fetchPendingCount = async () => {
      try {
        const res = await api.get("/api/reviews?status=pending&limit=1");
        setPendingReviews(res.data?.total ?? 0);
      } catch {
        // silently ignore — badge is non-critical
      }
    };
    fetchPendingCount();
    const interval = setInterval(fetchPendingCount, 60000);
    return () => clearInterval(interval);
  }, []);

  const planColors: Record<string, string> = {
    starter: "text-gray-400",
    professional: "text-brand-400",
    enterprise: "text-yellow-400",
  };

  return (
    <div className="flex h-screen bg-[hsl(var(--background))] overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          "fixed lg:static inset-y-0 left-0 z-30 w-64 flex flex-col bg-surface-DEFAULT border-r border-[hsl(var(--border))] transition-transform duration-300",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-[hsl(var(--border))]">
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-bold text-white text-sm">WorkforceAutomated</div>
            <div className="text-xs text-gray-500">AI Operating System</div>
          </div>
          <button
            className="ml-auto lg:hidden text-gray-400 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {navItems.map((item) => {
            const active = location.pathname === item.path ||
              (item.path !== "/dashboard" && location.pathname.startsWith(item.path));
            const showBadge = item.badge === "reviews" && pendingReviews > 0;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={clsx("sidebar-link", active && "active")}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1">{item.label}</span>
                {showBadge && (
                  <span className="ml-auto min-w-[20px] h-5 px-1.5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {pendingReviews > 99 ? "99+" : pendingReviews}
                  </span>
                )}
                {active && !showBadge && <ChevronRight className="w-3 h-3 ml-auto" />}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="px-3 py-4 border-t border-[hsl(var(--border))]">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-surface-100">
            <div className="w-8 h-8 bg-brand-600/30 rounded-full flex items-center justify-center text-brand-400 font-semibold text-sm">
              {user?.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-200 truncate">{user?.name}</div>
              <div className={clsx("text-xs capitalize", planColors[user?.plan || "starter"])}>
                {user?.plan} plan
              </div>
            </div>
            <button
              onClick={logout}
              className="text-gray-500 hover:text-red-400 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center gap-4 px-6 py-4 border-b border-[hsl(var(--border))] bg-surface-DEFAULT/80 backdrop-blur-sm">
          <button
            className="lg:hidden text-gray-400 hover:text-white"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          {/* Bell with pending review indicator */}
          <button className="btn-ghost p-2 relative" onClick={() => navigate("/reviews")}>
            <Bell className="w-4 h-4" />
            {pendingReviews > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </button>
          <button
            className="btn-primary text-sm"
            onClick={() => navigate("/agents/new")}
          >
            <Zap className="w-3.5 h-3.5" />
            New Agent
          </button>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
