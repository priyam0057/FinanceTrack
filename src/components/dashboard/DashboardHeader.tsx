import { Plus, LogOut, FileDown, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface DashboardHeaderProps {
  onAddTransaction: () => void;
  onDownloadReport?: () => void;
}

export function DashboardHeader({ onAddTransaction, onDownloadReport }: DashboardHeaderProps) {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({ title: "Logged out successfully" });
    navigate("/login");
  };

  return (
    <header className="border-b border-border/50 px-6 py-4 backdrop-blur-sm bg-background/80">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              Financial Dashboard
            </h1>
            <p className="text-sm text-muted-foreground">
              {new Date().toLocaleDateString("en-IN", { 
                weekday: "long", 
                year: "numeric", 
                month: "long", 
                day: "numeric" 
              })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => navigate("/")}
            className="hover:bg-primary/10"
          >
            <Home className="w-4 h-4 mr-2" />
            Home
          </Button>
          {onDownloadReport && (
            <Button 
              onClick={onDownloadReport}
              variant="outline"
              className="hover:bg-accent/10 hover:border-accent/50"
            >
              <FileDown className="w-4 h-4 mr-2" />
              Download Report
            </Button>
          )}
          <Button 
            onClick={onAddTransaction}
            className="bg-gradient-to-r from-primary to-primary-glow hover:shadow-lg hover:shadow-primary/50 transition-all duration-300"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Transaction
          </Button>
          <Button 
            onClick={handleLogout}
            variant="outline"
            className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
