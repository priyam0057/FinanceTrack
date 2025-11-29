import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit2, Trash2, TrendingUp, AlertTriangle, Calendar } from "lucide-react";
import { format } from "date-fns";
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";

export const BudgetManager = () => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    category_id: "none",
    amount: "",
    period: "monthly",
    start_date: format(new Date(), "yyyy-MM-dd"),
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("type", "expense")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: budgets = [] } = useQuery({
    queryKey: ["budgets"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("budgets")
        .select("*, categories(name, color, icon)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: budgetProgress = {} } = useQuery({
    queryKey: ["budget-progress"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const progress: Record<string, { spent: number; budget: number }> = {};
      
      for (const budget of budgets) {
        const { data, error } = await supabase
          .from("transactions")
          .select("amount")
          .eq("type", "expense")
          .eq("category_id", budget.category_id)
          .gte("date_time", budget.start_date)
          .lte("date_time", budget.end_date);

        if (!error && data) {
          const spent = data.reduce((sum, txn) => sum + parseFloat(txn.amount.toString()), 0);
          progress[budget.id] = { spent, budget: parseFloat(budget.amount.toString()) };
        }
      }
      return progress;
    },
    enabled: budgets.length > 0,
  });

  const getDateRange = (period: string, startDate: string) => {
    const date = new Date(startDate);
    switch (period) {
      case "weekly":
        return { start: startOfWeek(date), end: endOfWeek(date) };
      case "monthly":
        return { start: startOfMonth(date), end: endOfMonth(date) };
      case "yearly":
        return { start: startOfYear(date), end: endOfYear(date) };
      default:
        return { start: date, end: date };
    }
  };

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { start, end } = getDateRange(data.period, data.start_date);
      const { error } = await supabase.from("budgets").insert({
        user_id: user.id,
        category_id: data.category_id === "none" ? null : data.category_id,
        amount: parseFloat(data.amount),
        period: data.period,
        start_date: format(start, "yyyy-MM-dd"),
        end_date: format(end, "yyyy-MM-dd"),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["budget-progress"] });
      toast({ title: "Budget created successfully" });
      resetForm();
    },
    onError: () => toast({ title: "Failed to create budget", variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { start, end } = getDateRange(data.period, data.start_date);
      const { error } = await supabase
        .from("budgets")
        .update({
          category_id: data.category_id === "none" ? null : data.category_id,
          amount: parseFloat(data.amount),
          period: data.period,
          start_date: format(start, "yyyy-MM-dd"),
          end_date: format(end, "yyyy-MM-dd"),
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["budget-progress"] });
      toast({ title: "Budget updated successfully" });
      resetForm();
    },
    onError: () => toast({ title: "Failed to update budget", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("budgets").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["budget-progress"] });
      toast({ title: "Budget deleted successfully" });
    },
    onError: () => toast({ title: "Failed to delete budget", variant: "destructive" }),
  });

  const resetForm = () => {
    setFormData({
      category_id: "none",
      amount: "",
      period: "monthly",
      start_date: format(new Date(), "yyyy-MM-dd"),
    });
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (budget: any) => {
    setEditingId(budget.id);
    setFormData({
      category_id: budget.category_id || "none",
      amount: budget.amount.toString(),
      period: budget.period,
      start_date: budget.start_date,
    });
  };

  const getProgressPercentage = (budgetId: string) => {
    const progress = budgetProgress[budgetId];
    if (!progress) return 0;
    return Math.min((progress.spent / progress.budget) * 100, 100);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return "bg-destructive";
    if (percentage >= 80) return "bg-yellow-500";
    return "bg-primary";
  };

  return (
    <Card className="card-glow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Budget Management
        </CardTitle>
        <CardDescription>Set and track spending limits by category</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category (Optional - leave empty for overall budget)</Label>
              <Select 
                value={formData.category_id} 
                onValueChange={(value) => setFormData({ ...formData, category_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category or leave empty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Category (Overall Budget)</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Budget Amount</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="e.g., 10000"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Period</Label>
              <Select 
                value={formData.period} 
                onValueChange={(value) => setFormData({ ...formData, period: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Start Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  required
                  className="pl-10"
                />
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
              {editingId ? <Edit2 className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
              {editingId ? "Update" : "Create"} Budget
            </Button>
            {editingId && (
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            )}
          </div>
        </form>

        <div className="space-y-4">
          {budgets.map((budget) => {
            const percentage = getProgressPercentage(budget.id);
            const progress = budgetProgress[budget.id];
            const isOverBudget = percentage >= 100;
            const isNearLimit = percentage >= 80 && percentage < 100;

            return (
              <div
                key={budget.id}
                className="p-4 border rounded-lg space-y-3 hover:bg-accent transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {budget.categories ? (
                      <>
                        <span className="text-2xl">{budget.categories.icon}</span>
                        <div>
                          <div className="font-medium">{budget.categories.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {format(new Date(budget.start_date), "MMM dd")} - {format(new Date(budget.end_date), "MMM dd, yyyy")}
                          </div>
                        </div>
                      </>
                    ) : (
                      <div>
                        <div className="font-medium">Overall Budget</div>
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(budget.start_date), "MMM dd")} - {format(new Date(budget.end_date), "MMM dd, yyyy")}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{budget.period}</Badge>
                    {isOverBudget && <AlertTriangle className="w-5 h-5 text-destructive" />}
                    {isNearLimit && <AlertTriangle className="w-5 h-5 text-yellow-500" />}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>
                      ₹{progress?.spent.toLocaleString("en-IN") || 0} / ₹{parseFloat(budget.amount.toString()).toLocaleString("en-IN")}
                    </span>
                    <span className={isOverBudget ? "text-destructive font-medium" : isNearLimit ? "text-yellow-500 font-medium" : ""}>
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={percentage} className={getProgressColor(percentage)} />
                </div>

                <div className="flex gap-2 justify-end">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(budget)}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteMutation.mutate(budget.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })}
          {budgets.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No budgets created yet. Create one to start tracking your spending limits.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};