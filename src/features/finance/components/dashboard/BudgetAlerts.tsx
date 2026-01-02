import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, TrendingUp } from "lucide-react";

export const BudgetAlerts = () => {
  const { data: alerts = [] } = useQuery({
    queryKey: ["budget-alerts"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data: budgets, error } = await supabase
        .from("budgets")
        .select("*, categories(name, icon)")
        .eq("user_id", user.id);

      if (error || !budgets) return [];

      const alerts = [];

      for (const budget of budgets) {
        const { data: transactions } = await supabase
          .from("transactions")
          .select("amount")
          .eq("type", "expense")
          .eq("category_id", budget.category_id)
          .gte("date_time", budget.start_date)
          .lte("date_time", budget.end_date);

        if (transactions) {
          const spent = transactions.reduce((sum, txn) => sum + parseFloat(txn.amount.toString()), 0);
          const budgetAmount = parseFloat(budget.amount.toString());
          const percentage = (spent / budgetAmount) * 100;

          if (percentage >= 80) {
            alerts.push({
              id: budget.id,
              categoryName: budget.categories?.name || "Overall",
              categoryIcon: budget.categories?.icon || "💰",
              spent,
              budget: budgetAmount,
              percentage,
              isOverBudget: percentage >= 100,
            });
          }
        }
      }

      return alerts;
    },
  });

  if (alerts.length === 0) return null;

  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <Alert
          key={alert.id}
          variant={alert.isOverBudget ? "destructive" : "default"}
          className={alert.isOverBudget ? "" : "border-yellow-500 bg-yellow-50 dark:bg-yellow-950"}
        >
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle className="flex items-center gap-2">
            <span>{alert.categoryIcon}</span>
            {alert.isOverBudget ? "Budget Exceeded!" : "Approaching Budget Limit"}
          </AlertTitle>
          <AlertDescription>
            {alert.categoryName}: ₹{alert.spent.toLocaleString("en-IN")} / ₹{alert.budget.toLocaleString("en-IN")} ({alert.percentage.toFixed(1)}%)
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
};