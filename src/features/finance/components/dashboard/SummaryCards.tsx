import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, TrendingDown, TrendingUp, DollarSign, AlertTriangle } from "lucide-react";
import { format, isWithinInterval, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";

export function SummaryCards() {
  const { data: summary, isLoading } = useQuery({
    queryKey: ["summary"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { balance: 0, todayExpense: 0, monthExpense: 0, monthIncome: 0, overBudgetCount: 0 };

      // Get transactions
      const { data: transactions } = await supabase
        .from("transactions")
        .select("*");

      if (!transactions) return { balance: 0, todayExpense: 0, monthExpense: 0, monthIncome: 0, overBudgetCount: 0 };

      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfMonthDate = new Date(now.getFullYear(), now.getMonth(), 1);

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
        .filter((t) => t.type === "expense" && new Date(t.date_time) >= startOfMonthDate)
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const monthIncome = transactions
        .filter((t) => t.type === "income" && new Date(t.date_time) >= startOfMonthDate)
        .reduce((sum, t) => sum + Number(t.amount), 0);

      // Get over-budget count
      let overBudgetCount = 0;
      try {
        const { data: budgets } = await supabase
          .from("budgets")
          .select("*, categories(name, icon)")
          .eq("user_id", user.id);

        if (budgets) {
          for (const budget of budgets) {
            // Check if current date is within the budget period
            const budgetStartDate = new Date(budget.start_date);
            const budgetEndDate = new Date(budget.end_date);
            
            // Determine if we're currently in this budget's period
            let isInCurrentPeriod = false;
            
            switch (budget.period) {
              case "weekly":
                const weekStart = startOfWeek(now, { weekStartsOn: 1 });
                const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
                isInCurrentPeriod = isWithinInterval(now, { start: weekStart, end: weekEnd });
                break;
              case "monthly":
                const monthStart = startOfMonth(now);
                const monthEnd = endOfMonth(now);
                isInCurrentPeriod = isWithinInterval(now, { start: monthStart, end: monthEnd });
                break;
              case "yearly":
                const yearStart = startOfYear(now);
                const yearEnd = endOfYear(now);
                isInCurrentPeriod = isWithinInterval(now, { start: yearStart, end: yearEnd });
                break;
            }

            // Only check budgets that are currently active
            if (isInCurrentPeriod && isWithinInterval(now, { start: budgetStartDate, end: budgetEndDate })) {
              let query = supabase
                .from("transactions")
                .select("amount, date_time")
                .eq("type", "expense")
                .gte("date_time", budget.start_date)
                .lte("date_time", budget.end_date);

              // If budget has a category, filter by that category
              if (budget.category_id) {
                query = query.eq("category_id", budget.category_id);
              }

              const { data: budgetTransactions } = await query;

              if (budgetTransactions) {
                // Filter transactions to only those in the current period
                const periodTransactions = budgetTransactions.filter(txn => {
                  const txnDate = new Date(txn.date_time);
                  switch (budget.period) {
                    case "weekly":
                      const weekStart = startOfWeek(now, { weekStartsOn: 1 });
                      const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
                      return isWithinInterval(txnDate, { start: weekStart, end: weekEnd });
                    case "monthly":
                      const monthStart = startOfMonth(now);
                      const monthEnd = endOfMonth(now);
                      return isWithinInterval(txnDate, { start: monthStart, end: monthEnd });
                    case "yearly":
                      const yearStart = startOfYear(now);
                      const yearEnd = endOfYear(now);
                      return isWithinInterval(txnDate, { start: yearStart, end: yearEnd });
                    default:
                      return true;
                  }
                });

                const spent = periodTransactions.reduce((sum, txn) => sum + parseFloat(txn.amount.toString()), 0);
                const budgetAmount = parseFloat(budget.amount.toString());
                const percentage = (spent / budgetAmount) * 100;

                // Count over-budget
                if (percentage >= 100) {
                  overBudgetCount++;
                }
              }
            }
          }
        }
      } catch (error) {
        console.error("Error calculating over-budget count:", error);
      }

      return {
        balance: totalIncome - totalExpense,
        todayExpense,
        monthExpense,
        monthIncome,
        overBudgetCount,
      };
    },
    // Refresh every 10 seconds for more responsive updates
    refetchInterval: 10000,
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
    {
      title: "Over Budget",
      value: summary?.overBudgetCount || 0,
      icon: AlertTriangle,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i} className="animate-pulse glass-effect rounded-2xl border-white/10 h-32">
            <CardHeader className="h-20 bg-muted/20 rounded-t-2xl" />
            <CardContent className="h-16 bg-muted/20 rounded-b-2xl" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-5">
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
                {typeof card.value === 'number' ? 
                  (card.title === "Over Budget" ? 
                    card.value : 
                    `₹${card.value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`) : 
                  card.value}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {card.title === "Today's Expenses" && "Cash + Online + Cards"}
                {card.title === "This Month Expenses" && "Monthly total"}
                {card.title === "This Month Income" && "All sources"}
                {card.title === "Current Balance" && "Available balance"}
                {card.title === "Over Budget" && "Categories exceeding limits"}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}