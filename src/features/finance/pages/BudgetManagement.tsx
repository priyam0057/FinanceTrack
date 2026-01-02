import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/features/finance/components/dashboard/AppSidebar";
import { DashboardHeader } from "@/features/finance/components/dashboard/DashboardHeader";
import { BudgetManager } from "@/features/finance/components/dashboard/BudgetManager";

const BudgetManagement = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />

        <div className="flex-1 flex flex-col">
          <DashboardHeader
            onAddTransaction={() => setIsAddDialogOpen(true)}
          />

          <main className="flex-1 p-6 space-y-6 overflow-auto">
            <div className="max-w-4xl mx-auto space-y-6">
              <div>
                <h1 className="text-3xl font-bold">Budget Management</h1>
                <p className="text-muted-foreground">
                  Set and track your spending limits
                </p>
              </div>

              <BudgetManager />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default BudgetManagement;