import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";

// Landing
import Landing from "@/pages/Landing";

// Finance Pages
import FinanceDashboard from "@/features/finance/pages/Dashboard";
import Settings from "@/features/finance/pages/Settings";
import Transactions from "@/features/finance/pages/Transactions";
import Calculator from "@/features/finance/pages/Calculator";
import UnitConverter from "@/features/finance/pages/UnitConverter";
import TipCalculator from "@/features/finance/pages/TipCalculator";
import BudgetManagement from "@/features/finance/pages/BudgetManagement";
import Login from "@/features/finance/pages/Login";
import NotFound from "@/features/finance/pages/NotFound";

// Dev Pages
import DevDashboard from "@/features/dev/pages/Dashboard";
import ProjectDetail from "@/features/dev/pages/ProjectDetail";

import { MainLayout } from "@/features/dev/components/layout/MainLayout";
import { DailyBoard } from "@/features/dev/components/pro-features/DailyBoard";
import { IdeaScratchpad } from "@/features/dev/components/pro-features/IdeaScratchpad";
import { FocusMode } from "@/features/dev/components/pro-features/FocusMode";

import { SettingsPage } from "@/features/dev/pages/SettingsPage";
import TasksPage from "@/features/dev/pages/TasksPage";

// ...



import { SidebarProvider } from "@/contexts/SidebarContext";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return session ? <>{children}</> : <Navigate to="/login" replace />;
};

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <SidebarProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />

                {/* Landing */}
                <Route path="/" element={<ProtectedRoute><Landing /></ProtectedRoute>} />

                {/* Finance Routes */}
                <Route path="/finance" element={<ProtectedRoute><FinanceDashboard /></ProtectedRoute>} />
                <Route path="/finance/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
                <Route path="/finance/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                <Route path="/finance/budget-management" element={<ProtectedRoute><BudgetManagement /></ProtectedRoute>} />
                <Route path="/finance/calculator" element={<ProtectedRoute><Calculator /></ProtectedRoute>} />
                <Route path="/finance/converter" element={<ProtectedRoute><UnitConverter /></ProtectedRoute>} />
                <Route path="/finance/tip-calculator" element={<ProtectedRoute><TipCalculator /></ProtectedRoute>} />

                {/* Dev Routes */}
                <Route path="/dev" element={<DevDashboard />} />
                <Route path="/dev/projects" element={<DevDashboard />} />
                <Route path="/dev/projects/:id" element={<ProjectDetail />} />
                <Route path="/dev/tasks" element={<TasksPage />} />

                <Route path="/dev/daily" element={
                    <MainLayout><div className="p-8"><DailyBoard /></div></MainLayout>
                } />

                <Route path="/dev/ideas" element={
                    <MainLayout><div className="p-8"><IdeaScratchpad /></div></MainLayout>
                } />

                <Route path="/dev/focus" element={
                    <MainLayout><div className="p-8 flex items-center justify-center min-h-[80vh]"><FocusMode /></div></MainLayout>
                } />

                <Route path="/dev/settings" element={
                    <MainLayout><SettingsPage /></MainLayout>
                } />

                {/* Fallback */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </SidebarProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;