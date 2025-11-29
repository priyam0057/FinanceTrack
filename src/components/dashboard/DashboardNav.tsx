import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingDown, TrendingUp, Heart, Calculator } from "lucide-react";

interface DashboardNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function DashboardNav({ activeTab, onTabChange }: DashboardNavProps) {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-4 bg-card/50 backdrop-blur-sm">
        <TabsTrigger value="outcome" className="data-[state=active]:bg-destructive/20">
          <TrendingDown className="w-4 h-4 mr-2" />
          Outcome
        </TabsTrigger>
        <TabsTrigger value="income" className="data-[state=active]:bg-success/20">
          <TrendingUp className="w-4 h-4 mr-2" />
          Income
        </TabsTrigger>
        <TabsTrigger value="wishlist" className="data-[state=active]:bg-secondary/20">
          <Heart className="w-4 h-4 mr-2" />
          Wishlist
        </TabsTrigger>
        <TabsTrigger value="tools" className="data-[state=active]:bg-primary/20">
          <Calculator className="w-4 h-4 mr-2" />
          Tools
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
