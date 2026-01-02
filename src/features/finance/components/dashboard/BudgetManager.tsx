import { useState, useEffect } from "react";
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
import { Plus, Edit2, Trash2, TrendingUp, AlertTriangle, Calendar, Globe } from "lucide-react";
import { format } from "date-fns";
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";
import { Calendar as UICalendar } from "@/components/ui/calendar";

export const BudgetManager = () => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    category_id: "",
    amount: "",
    period: "monthly",
    start_date: format(new Date(), "yyyy-MM-dd"),
  });
  const [overallBudgetAmount, setOverallBudgetAmount] = useState("");
  const [overallBudgetPeriod, setOverallBudgetPeriod] = useState("monthly");
  const [overallBudgetStartDate, setOverallBudgetStartDate] = useState(format(new Date(), "yyyy-MM-dd"));
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

  const { data: budgets = [], refetch: refetchBudgets } = useQuery({
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
    // Refetch every 10 seconds for more responsive updates
    refetchInterval: 10000,
  });

  // Real-time subscription for budget updates
  useEffect(() => {
    const channel = supabase
      .channel('budgets-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'budgets',
        },
        (payload) => {
          refetchBudgets();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetchBudgets]);

  const { data: budgetProgress = {}, refetch: refetchBudgetProgress } = useQuery({
    queryKey: ["budget-progress"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const progress: Record<string, { spent: number; budget: number }> = {};
      
      for (const budget of budgets) {
        let query = supabase
          .from("transactions")
          .select("amount")
          .eq("type", "expense")
          .gte("date_time", budget.start_date)
          .lte("date_time", budget.end_date);

        // If budget has a category, filter by that category
        if (budget.category_id) {
          query = query.eq("category_id", budget.category_id);
        }

        const { data, error } = await query;
        
        if (!error && data) {
          const spent = data.reduce((sum, txn) => sum + parseFloat(txn.amount.toString()), 0);
          progress[budget.id] = { spent, budget: parseFloat(budget.amount.toString()) };
        }
      }
      return progress;
    },
    enabled: budgets.length > 0,
    // Refetch every 10 seconds for more responsive updates
    refetchInterval: 10000,
  });

  // Real-time subscription for transaction updates
  useEffect(() => {
    const channel = supabase
      .channel('transactions-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'transactions',
        },
        (payload) => {
          refetchBudgetProgress();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'transactions',
        },
        (payload) => {
          refetchBudgetProgress();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'transactions',
        },
        (payload) => {
          refetchBudgetProgress();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetchBudgetProgress]);

  // Auto-select first category when categories load
  useEffect(() => {
    if (categories.length > 0 && !formData.category_id) {
      setFormData(prev => ({
        ...prev,
        category_id: categories[0].id
      }));
    }
  }, [categories]);

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
        category_id: data.category_id || null,
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
      queryClient.invalidateQueries({ queryKey: ["header-budget-alerts"] });
      toast({ title: "Budget created successfully" });
      resetForm();
    },
    onError: (error) => {
      console.error("Budget creation error:", error);
      toast({ title: "Failed to create budget", variant: "destructive" });
    },
  });

  // Create overall budget (no category)
  const overallCreateMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { start, end } = getDateRange(overallBudgetPeriod, overallBudgetStartDate);
      const { error } = await supabase.from("budgets").insert({
        user_id: user.id,
        category_id: null, // No category = overall budget
        amount: parseFloat(overallBudgetAmount),
        period: overallBudgetPeriod,
        start_date: format(start, "yyyy-MM-dd"),
        end_date: format(end, "yyyy-MM-dd"),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["budget-progress"] });
      queryClient.invalidateQueries({ queryKey: ["header-budget-alerts"] });
      toast({ title: "Overall budget created successfully" });
      setOverallBudgetAmount("");
    },
    onError: (error: any) => {
      toast({ title: "Failed to create overall budget", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { start, end } = getDateRange(data.period, data.start_date);
      const { error } = await supabase
        .from("budgets")
        .update({
          category_id: data.category_id || null,
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
      queryClient.invalidateQueries({ queryKey: ["header-budget-alerts"] });
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
      queryClient.invalidateQueries({ queryKey: ["header-budget-alerts"] });
      toast({ title: "Budget deleted successfully" });
    },
    onError: () => toast({ title: "Failed to delete budget", variant: "destructive" }),
  });

  const resetForm = () => {
    setFormData({
      category_id: categories.length > 0 ? categories[0].id : "",
      amount: "",
      period: "monthly",
      start_date: format(new Date(), "yyyy-MM-dd"),
    });
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!formData.category_id && !editingId) || !formData.amount) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }
    
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleOverallSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!overallBudgetAmount) {
      toast({ title: "Please enter an amount for the overall budget", variant: "destructive" });
      return;
    }
    
    overallCreateMutation.mutate();
  };

  const handleEdit = (budget: any) => {
    setEditingId(budget.id);
    setFormData({
      category_id: budget.category_id || "",
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

  // Animated progress bar component
  const AnimatedProgressBar = ({ percentage, isOverBudget, isNearLimit }: { percentage: number; isOverBudget: boolean; isNearLimit: boolean }) => {
    return (
      <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 overflow-hidden">
        <div 
          className={`h-2.5 rounded-full transition-all duration-1000 ease-out ${
            isOverBudget ? "bg-destructive" : 
            isNearLimit ? "bg-yellow-500" : "bg-primary"
          }`}
          style={{ 
            width: `${Math.min(percentage, 100)}%`,
            boxShadow: isOverBudget ? "0 0 8px rgba(239, 68, 68, 0.5)" : 
                      isNearLimit ? "0 0 8px rgba(234, 179, 8, 0.5)" : 
                      "0 0 8px rgba(59, 130, 246, 0.5)"
          }}
        ></div>
      </div>
    );
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
        {/* Single Budget Form */}
        <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg">
          <h3 className="text-lg font-semibold">Create Individual Budget</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select 
                value={formData.category_id} 
                onValueChange={(value) => setFormData({ ...formData, category_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{cat.icon}</span>
                        <span>{cat.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Budget Amount *</Label>
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
              <UICalendar
                selected={new Date(formData.start_date)}
                onSelect={(d) => d && setFormData({ ...formData, start_date: format(d, "yyyy-MM-dd") })}
                mode="single"
              />
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

        {/* Overall Budget Form */}
        <form onSubmit={handleOverallSubmit} className="space-y-4 p-4 border rounded-lg bg-accent/5">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Create Overall Budget
          </h3>
          <p className="text-sm text-muted-foreground">
            Create a budget that covers all expense categories combined
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Overall Budget Amount *</Label>
              <Input
                type="number"
                step="0.01"
                value={overallBudgetAmount}
                onChange={(e) => setOverallBudgetAmount(e.target.value)}
                placeholder="e.g., 50000"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Period</Label>
              <Select 
                value={overallBudgetPeriod} 
                onValueChange={setOverallBudgetPeriod}
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
              <UICalendar
                selected={new Date(overallBudgetStartDate)}
                onSelect={(d) => d && setOverallBudgetStartDate(format(d, "yyyy-MM-dd"))}
                mode="single"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              type="submit" 
              disabled={overallCreateMutation.isPending || !overallBudgetAmount}
              variant="secondary"
            >
              {overallCreateMutation.isPending ? (
                <>
                  <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Globe className="w-4 h-4 mr-2" />
                  Create Overall Budget
                </>
              )}
            </Button>
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
                      <div className="flex items-center gap-3">
                        <Globe className="w-6 h-6 text-primary" />
                        <div>
                          <div className="font-medium">Overall Budget</div>
                          <div className="text-sm text-muted-foreground">
                            {format(new Date(budget.start_date), "MMM dd")} - {format(new Date(budget.end_date), "MMM dd, yyyy")}
                          </div>
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
                
                {/* Animated Progress Line */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>
                      ₹{progress?.spent.toLocaleString("en-IN") || 0} / ₹{parseFloat(budget.amount.toString()).toLocaleString("en-IN")}
                    </span>
                    <span className={isOverBudget ? "text-destructive font-medium" : isNearLimit ? "text-yellow-500 font-medium" : ""}>
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                  
                  {/* Enhanced Animated Progress Bar */}
                  <AnimatedProgressBar 
                    percentage={percentage} 
                    isOverBudget={isOverBudget} 
                    isNearLimit={isNearLimit} 
                  />
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