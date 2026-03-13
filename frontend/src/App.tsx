import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { Toaster } from "sonner";
import DashboardLayout from "@/components/layout/DashboardLayout";

// Pages
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import Agents from "@/pages/Agents";
import AgentBuilder from "@/pages/AgentBuilder";
import AgentDetail from "@/pages/AgentDetail";
import Teams from "@/pages/Teams";
import TeamBuilder from "@/pages/TeamBuilder";
import Executions from "@/pages/Executions";
import ExecutionConsole from "@/pages/ExecutionConsole";
import ConfidenceMonitor from "@/pages/ConfidenceMonitor";
import Governance from "@/pages/Governance";
import AuditLog from "@/pages/AuditLog";
import KPIBuilder from "@/pages/KPIBuilder";
import Billing from "@/pages/Billing";
import Settings from "@/pages/Settings";
import Integrations from "@/pages/Integrations";
import TeamExecutionHistory from "@/pages/TeamExecutionHistory";
import ReviewQueue from "@/pages/ReviewQueue";
import Schedules from "@/pages/Schedules";
import Reports from "@/pages/Reports";
import AccountRecovery from "@/pages/AccountRecovery";
import SecurityAudit from "@/pages/SecurityAudit";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return <DashboardLayout>{children}</DashboardLayout>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/agents" element={<ProtectedRoute><Agents /></ProtectedRoute>} />
      <Route path="/agents/new" element={<ProtectedRoute><AgentBuilder /></ProtectedRoute>} />
      <Route path="/agents/:id" element={<ProtectedRoute><AgentDetail /></ProtectedRoute>} />
      <Route path="/agents/:id/edit" element={<ProtectedRoute><AgentBuilder /></ProtectedRoute>} />
      <Route path="/agents/:id/run" element={<ProtectedRoute><ExecutionConsole /></ProtectedRoute>} />
      <Route path="/teams" element={<ProtectedRoute><Teams /></ProtectedRoute>} />
      <Route path="/teams/new" element={<ProtectedRoute><TeamBuilder /></ProtectedRoute>} />
      <Route path="/teams/:id/edit" element={<ProtectedRoute><TeamBuilder /></ProtectedRoute>} />
      <Route path="/teams/:id/history" element={<ProtectedRoute><TeamExecutionHistory /></ProtectedRoute>} />
      <Route path="/executions" element={<ProtectedRoute><Executions /></ProtectedRoute>} />
      <Route path="/executions/:id" element={<ProtectedRoute><ExecutionConsole /></ProtectedRoute>} />
      <Route path="/confidence" element={<ProtectedRoute><ConfidenceMonitor /></ProtectedRoute>} />
      <Route path="/governance" element={<ProtectedRoute><Governance /></ProtectedRoute>} />
      <Route path="/audit" element={<ProtectedRoute><AuditLog /></ProtectedRoute>} />
      <Route path="/kpi" element={<ProtectedRoute><KPIBuilder /></ProtectedRoute>} />
      <Route path="/billing" element={<ProtectedRoute><Billing /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="/integrations" element={<ProtectedRoute><Integrations /></ProtectedRoute>} />
      <Route path="/reviews" element={<ProtectedRoute><ReviewQueue /></ProtectedRoute>} />
      <Route path="/schedules" element={<ProtectedRoute><Schedules /></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
      <Route path="/security/audit" element={<ProtectedRoute><SecurityAudit /></ProtectedRoute>} />
      <Route path="/recover" element={<AccountRecovery />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "hsl(222, 47%, 10%)",
            border: "1px solid hsl(216, 34%, 17%)",
            color: "hsl(213, 31%, 91%)",
          },
        }}
      />
      <AppRoutes />
    </AuthProvider>
  );
}
