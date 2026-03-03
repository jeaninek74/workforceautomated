import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Agents from "./pages/Agents";
import AgentBuilder from "./pages/AgentBuilder";
import ExecutionConsole from "./pages/ExecutionConsole";
import Teams from "./pages/Teams";
import TeamBuilder from "./pages/TeamBuilder";
import TeamExecutionConsole from "./pages/TeamExecutionConsole";
import ConfidenceMonitor from "./pages/ConfidenceMonitor";
import AuditLog from "./pages/AuditLog";
import Billing from "./pages/Billing";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/agents" component={Agents} />
      <Route path="/agents/new" component={AgentBuilder} />
      <Route path="/agents/:id/edit" component={AgentBuilder} />
      <Route path="/execute/:id" component={ExecutionConsole} />
      <Route path="/teams" component={Teams} />
      <Route path="/teams/new" component={TeamBuilder} />
      <Route path="/teams/:id/edit" component={TeamBuilder} />
      <Route path="/team-execute/:id" component={TeamExecutionConsole} />
      <Route path="/monitor" component={ConfidenceMonitor} />
      <Route path="/audit" component={AuditLog} />
      <Route path="/billing" component={Billing} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
