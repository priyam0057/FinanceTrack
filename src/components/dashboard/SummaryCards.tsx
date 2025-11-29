import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, TrendingDown, TrendingUp, DollarSign } from "lucide-react";

export function SummaryCards() {
  const { data: summary, isLoading } = useQuery({
    queryKey: ["summary"],
    queryFn: async () => {
      const { data: transactions } = await supabase
        .from("transactions")
        .select("*");

      if (!transactions) return { balance: 0, todayExpense: 0, monthExpense: 0, monthIncome: 0 };

      const now = new Date();
      const startOfDay = new Date(now.setHours(0, 0, 0, 0));
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const totalIncome = transactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const totalExpense = transactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const todayExpense = transactions
        .filter((t) => t.type === "expense" && new Date(t.date_time) >= startOfDay)
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const monthExpense = transactions
        .filter((t) => t.type === "expense" && new Date(t.date_time) >= startOfMonth)
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const monthIncome = transactions
        .filter((t) => t.type === "income" && new Date(t.date_time) >= startOfMonth)
        .reduce((sum, t) => sum + Number(t.amount), 0);

      return {
        balance: totalIncome - totalExpense,
        todayExpense,
        monthExpense,
        monthIncome,
      };
    },
  });

  const cards = [
    {
      title: "Current Balance",
      value: summary?.balance || 0,
      icon: Wallet,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Today's Expenses",
      value: summary?.todayExpense || 0,
      icon: TrendingDown,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
    },
    {
      title: "This Month Expenses",
      value: summary?.monthExpense || 0,
      icon: DollarSign,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      title: "This Month Income",
      value: summary?.monthIncome || 0,
      icon: TrendingUp,
      color: "text-success",
      bgColor: "bg-success/10",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse glass-effect rounded-2xl border-white/10 h-32">
            <CardHeader className="h-20 bg-muted/20 rounded-t-2xl" />
            <CardContent className="h-16 bg-muted/20 rounded-b-2xl" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <Card 
            key={card.title} 
            className="card-glow animate-fade-in glass-effect rounded-2xl border-white/10 hover:border-white/20 transition-all duration-300"
            style={{ animationDelay: `${idx * 0.1}s` }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-base font-medium text-foreground">{card.title}</CardTitle>
              <div className={`${card.bgColor} p-3 rounded-xl`}>
                <Icon className={`h-5 w-5 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${card.color} mt-2`}>
                ₹{card.value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {card.title === "Today's Expenses" && "Cash + Online + Cards"}
                {card.title === "This Month Expenses" && "Monthly total"}
                {card.title === "This Month Income" && "All sources"}
                {card.title === "Current Balance" && "Available balance"}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
