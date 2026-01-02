import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";

export function ChartsSection() {
  const { data: categoryData } = useQuery({
    queryKey: ["category-data"],
    queryFn: async () => {
      const { data: transactions } = await supabase
        .from("transactions")
        .select("*, categories(name, color)")
        .eq("type", "expense");

      if (!transactions) return [];

      const categoryMap = new Map();
      transactions.forEach((t) => {
        const category = t.categories?.name || "Others";
        const color = t.categories?.color || "#9CA3AF";
        const current = categoryMap.get(category) || { name: category, value: 0, color };
        current.value += Number(t.amount);
        categoryMap.set(category, current);
      });

      return Array.from(categoryMap.values());
    },
  });

  const { data: trendData } = useQuery({
    queryKey: ["trend-data"],
    queryFn: async () => {
      const { data: transactions } = await supabase
        .from("transactions")
        .select("*")
        .order("date_time", { ascending: true });

      if (!transactions) return [];

      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return date.toISOString().split("T")[0];
      });

      return last7Days.map((date) => {
        const dayTransactions = transactions.filter((t) => t.date_time.startsWith(date));
        const expense = dayTransactions
          .filter((t) => t.type === "expense")
          .reduce((sum, t) => sum + Number(t.amount), 0);
        const income = dayTransactions
          .filter((t) => t.type === "income")
          .reduce((sum, t) => sum + Number(t.amount), 0);

        return {
          date: new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
          expense,
          income,
        };
      });
    },
  });

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="card-glow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-glow-pulse" />
            Expenses by Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => `₹${value.toFixed(2)}`}
                contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="card-glow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-2 h-2 bg-destructive rounded-full animate-glow-pulse" />
            7-Day Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip 
                formatter={(value: number) => `₹${value.toFixed(2)}`}
                contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
              />
              <Legend />
              <Line type="monotone" dataKey="expense" stroke="hsl(var(--destructive))" strokeWidth={2} />
              <Line type="monotone" dataKey="income" stroke="hsl(var(--success))" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}