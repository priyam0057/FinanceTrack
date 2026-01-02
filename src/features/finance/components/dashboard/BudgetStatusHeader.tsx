import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, CheckCircle, Globe } from "lucide-react";
import { format, isWithinInterval, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";

export const BudgetStatusHeader = () => {
  const { data: budgetStatus } = useQuery({
    queryKey: ["budget-status-header"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { overBudgetCount: 0, nearLimitCount: 0 };

      const { data: budgets, error } = await supabase
        .from("budgets")
        .select("*, categories(name, icon)")
        .eq("user_id", user.id);

      if (error || !budgets) return { overBudgetCount: 0, nearLimitCount: 0 };

      let overBudgetCount = 0;
      let nearLimitCount = 0;
      const now = new Date();

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

          const { data: transactions } = await query;

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

            // Count over-budget and near-limit
            if (percentage >= 100) {
              overBudgetCount++;
            } else if (percentage >= 80) {
              nearLimitCount++;
            }
          }
        }
      }

      return { overBudgetCount, nearLimitCount };
    },
    // Refresh every 10 seconds for more responsive updates
    refetchInterval: 10000,
  });

  if (!budgetStatus) return null;

  const { overBudgetCount, nearLimitCount } = budgetStatus;

  if (overBudgetCount === 0 && nearLimitCount === 0) {
    return (
      <div className="flex items-center gap-1 text-xs bg-success/10 text-success px-2 py-1 rounded-full border border-success/30">
        <CheckCircle className="w-3 h-3" />
        <span>All budgets are within limits</span>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {overBudgetCount > 0 && (
        <div className="flex items-center gap-1 text-xs bg-destructive/10 text-destructive px-2 py-1 rounded-full border border-destructive/30">
          <AlertTriangle className="w-3 h-3" />
          <span>{overBudgetCount} budget{overBudgetCount > 1 ? 's' : ''} exceeded</span>
        </div>
      )}
      {nearLimitCount > 0 && (
        <div className="flex items-center gap-1 text-xs bg-warning/10 text-warning px-2 py-1 rounded-full border border-warning/30">
          <AlertTriangle className="w-3 h-3" />
          <span>{nearLimitCount} budget{nearLimitCount > 1 ? 's' : ''} near limit</span>
        </div>
      )}
    </div>
  );
};