import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, TrendingUp } from "lucide-react";
import { format, isWithinInterval, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";

export const EnhancedBudgetAlerts = () => {
  const { data: alerts = [] } = useQuery({
    queryKey: ["enhanced-budget-alerts"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data: budgets, error } = await supabase
        .from("budgets")
        .select("*, categories(name, icon)")
        .eq("user_id", user.id);

      if (error || !budgets) return [];

      const alerts = [];
      const now = new Date();

      for (const budget of budgets) {
        // Check if current date is within the budget period
        const budgetStartDate = new Date(budget.start_date);
        const budgetEndDate = new Date(budget.end_date);
        
        // Determine if we're currently in this budget's period
        let isInCurrentPeriod = false;
        let periodLabel = "";
        
        switch (budget.period) {
          case "weekly":
            const weekStart = startOfWeek(now, { weekStartsOn: 1 });
            const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
            isInCurrentPeriod = isWithinInterval(now, { start: weekStart, end: weekEnd });
            periodLabel = "Weekly";
            break;
          case "monthly":
            const monthStart = startOfMonth(now);
            const monthEnd = endOfMonth(now);
            isInCurrentPeriod = isWithinInterval(now, { start: monthStart, end: monthEnd });
            periodLabel = "Monthly";
            break;
          case "yearly":
            const yearStart = startOfYear(now);
            const yearEnd = endOfYear(now);
            isInCurrentPeriod = isWithinInterval(now, { start: yearStart, end: yearEnd });
            periodLabel = "Yearly";
            break;
        }

        // Only check budgets that are currently active
        if (isInCurrentPeriod && isWithinInterval(now, { start: budgetStartDate, end: budgetEndDate })) {
          const { data: transactions } = await supabase
            .from("transactions")
            .select("amount, date_time")
            .eq("type", "expense")
            .eq("category_id", budget.category_id)
            .gte("date_time", budget.start_date)
            .lte("date_time", budget.end_date);

          if (transactions) {
            // Filter transactions to only those in the current period
            const periodTransactions = transactions.filter(txn => {
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

            // Only show alerts for budgets that are exceeded or close to being exceeded
            if (percentage >= 100) {
              alerts.push({
                id: budget.id,
                categoryName: budget.categories?.name || "Overall",
                categoryIcon: budget.categories?.icon || "💰",
                spent,
                budget: budgetAmount,
                percentage,
                period: periodLabel,
                isOverBudget: true,
              });
            }
          }
        }
      }

      return alerts;
    },
    // Refresh every 5 minutes
    refetchInterval: 5 * 60 * 1000,
  });

  if (alerts.length === 0) return null;

  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <Alert
          key={alert.id}
          variant="destructive"
          className="border-destructive bg-destructive/10"
        >
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle className="flex items-center gap-2">
            <span>{alert.categoryIcon}</span>
            {alert.period} Budget Exceeded!
          </AlertTitle>
          <AlertDescription>
            {alert.categoryName}: ₹{alert.spent.toLocaleString("en-IN")} / ₹{alert.budget.toLocaleString("en-IN")} ({alert.percentage.toFixed(1)}%)
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
};