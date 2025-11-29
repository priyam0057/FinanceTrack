import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { TransactionList } from "@/components/dashboard/TransactionList";
import { ChartsSection } from "@/components/dashboard/ChartsSection";
import { IncomeDashboard } from "@/components/dashboard/IncomeDashboard";
import { WishlistDashboard } from "@/components/dashboard/WishlistDashboard";
import { ToolsPanel } from "@/components/dashboard/ToolsPanel";
import { AddTransactionDialog } from "@/components/dashboard/AddTransactionDialog";
import { ReportDownloadDialog } from "@/components/dashboard/ReportDownloadDialog";
import { TransactionFilters } from "@/components/dashboard/TransactionFilters";
import { EnhancedBudgetAlerts } from "@/components/dashboard/EnhancedBudgetAlerts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("outcome");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await supabase
        .from("categories")
        .select("*")
        .order("name");
      return data || [];
    },
  });

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          <DashboardHeader 
            onAddTransaction={() => setIsAddDialogOpen(true)} 
            onDownloadReport={() => setIsReportDialogOpen(true)}
          />
          
          <div className="p-6 pb-4 space-y-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Financial Dashboard</h1>
              <p className="text-muted-foreground">Track your income, expenses, and financial goals</p>
            </div>
            <DashboardNav activeTab={activeTab} onTabChange={setActiveTab} />
            
            {activeTab === "outcome" && (
              <TransactionFilters
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                categoryFilter={categoryFilter}
                onCategoryFilterChange={setCategoryFilter}
                categories={categories || []}
              />
            )}
          </div>
          
          <main className="flex-1 px-6 pb-6 space-y-6 overflow-auto">
            {activeTab === "outcome" && (
              <>
                <EnhancedBudgetAlerts />
                <SummaryCards />
                <ChartsSection />
                <TransactionList 
                  searchQuery={searchQuery}
                  categoryFilter={categoryFilter}
                />
              </>
            )}
            {activeTab === "income" && <IncomeDashboard />}
            {activeTab === "wishlist" && <WishlistDashboard />}
            {activeTab === "tools" && <ToolsPanel />}
          </main>
        </div>

        <AddTransactionDialog 
          open={isAddDialogOpen} 
          onOpenChange={setIsAddDialogOpen}
        />

        <ReportDownloadDialog 
          open={isReportDialogOpen} 
          onOpenChange={setIsReportDialogOpen}
        />
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
