import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Wallet, DollarSign, PiggyBank } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend } from "recharts";

export function IncomeDashboard() {
  const { data: incomes } = useQuery({
    queryKey: ["incomes"],
    queryFn: async () => {
      const { data } = await supabase
        .from("transactions")
        .select("*")
        .eq("type", "income")
        .order("date_time", { ascending: false });
      return data || [];
    },
  });

  const totalIncome = incomes?.reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0) || 0;
  const thisMonthIncome = incomes?.filter(t => {
    const date = new Date(t.date_time);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }).reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0) || 0;

  const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="card-glow border-success/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <DollarSign className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">₹{totalIncome.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card className="card-glow border-primary/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">₹{thisMonthIncome.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card className="card-glow border-secondary/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Income</CardTitle>
            <Wallet className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">₹{thisMonthIncome.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card className="card-glow border-chart-4/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Passive Income</CardTitle>
            <PiggyBank className="h-4 w-4 text-chart-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: 'hsl(var(--chart-4))' }}>₹0.00</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="card-glow">
          <CardHeader>
            <CardTitle>Income by Source</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[{ name: 'Salary', value: thisMonthIncome }]}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="hsl(var(--success))"
                  dataKey="value"
                  label
                >
                  <Cell fill="hsl(var(--success))" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="card-glow">
          <CardHeader>
            <CardTitle>Income Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={incomes?.slice(0, 7).reverse() || []}>
                <XAxis dataKey="date_time" tickFormatter={(date) => new Date(date).toLocaleDateString()} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="amount" stroke="hsl(var(--success))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Income List */}
      <Card className="card-glow">
        <CardHeader>
          <CardTitle>Recent Income</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {incomes?.slice(0, 5).map((income) => (
              <div key={income.id} className="flex items-center justify-between p-3 bg-success/10 rounded-lg">
                <div>
                  <p className="font-medium">{income.note || 'Income'}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(income.date_time).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-lg font-bold text-success">+₹{parseFloat(income.amount.toString()).toFixed(2)}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
