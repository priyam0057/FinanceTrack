import { Home, TrendingUp, Settings, Calculator, Scale, DollarSign, Shield, ArrowLeft, Wallet } from "lucide-react";
import { NavLink } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { useState, useEffect } from "react";
import { useSidebarContext } from "@/contexts/SidebarContext";

// Import the tool components
import CalculatorComponent from "@/pages/Calculator";
import UnitConverterComponent from "@/pages/UnitConverter";
import TipCalculatorComponent from "@/pages/TipCalculator";

// Remove the router dependencies from the tool components since we're not routing anymore
const CalculatorTool = () => {
  const CalculatorContent = CalculatorComponent as any;
  return <CalculatorContent />;
};

const UnitConverterTool = () => {
  const UnitConverterContent = UnitConverterComponent as any;
  return <UnitConverterContent />;
};

const TipCalculatorTool = () => {
  const TipCalculatorContent = TipCalculatorComponent as any;
  return <TipCalculatorContent />;
};

const mainItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Transactions", url: "/transactions", icon: TrendingUp },
  { title: "Budget Management", url: "/budget-management", icon: Wallet },
  { title: "Settings", url: "/settings", icon: Settings },
];

const toolItems = [
  { title: "Calculator", icon: Calculator, component: CalculatorTool },
  { title: "Unit Converter", icon: Scale, component: UnitConverterTool },
  { title: "Tip Calculator", icon: DollarSign, component: TipCalculatorTool },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [activeTool, setActiveTool] = useState<{title: string, component: React.ComponentType} | null>(null);
  const { setIsCalculatorOpen, setIsSidebarOpen } = useSidebarContext();

  // Update the calculator open state and sidebar state in context
  useEffect(() => {
    setIsCalculatorOpen(activeTool?.title === "Calculator");
    setIsSidebarOpen(!isCollapsed);
  }, [activeTool, isCollapsed, setIsCalculatorOpen, setIsSidebarOpen]);

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-sidebar-accent text-sidebar-primary font-medium" 
      : "hover:bg-sidebar-accent/50";

  const handleToolClick = (tool: {title: string, component: React.ComponentType}) => {
    setActiveTool(tool);
  };

  const closeTool = () => {
    setActiveTool(null);
  };

  // Render the active tool if one is selected
  if (activeTool) {
    const ToolComponent = activeTool.component;
    return (
      <Sidebar className="w-80">
        <div className="p-4 flex items-center justify-between border-b">
          <button 
            onClick={closeTool}
            className="flex items-center gap-2 text-sm font-medium hover:bg-sidebar-accent px-2 py-1 rounded"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Menu
          </button>
          <SidebarTrigger />
        </div>
        <SidebarContent className="p-0">
          <div className="h-full overflow-auto">
            <ToolComponent />
          </div>
        </SidebarContent>
      </Sidebar>
    );
  }

  // Render the standard navigation menu
  return (
    <Sidebar className={isCollapsed ? "w-14" : "w-60"}>
      <div className="p-4 flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-sm font-semibold">FinanceTracker</h2>
              <p className="text-xs text-muted-foreground">Personal</p>
            </div>
          </div>
        )}
        <SidebarTrigger className="ml-auto" />
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon className="h-4 w-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator className="my-2" />

        <SidebarGroup>
          <SidebarGroupLabel>Tools</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {toolItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton onClick={() => handleToolClick(item)}>
                    <item.icon className="h-4 w-4" />
                    {!isCollapsed && <span>{item.title}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}