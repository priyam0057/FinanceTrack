import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";

interface TransactionListProps {
  searchQuery: string;
  categoryFilter: string;
}

export function TransactionList({ searchQuery, categoryFilter }: TransactionListProps) {

  const { data: transactions, isLoading } = useQuery({
    queryKey: ["transactions", searchQuery, categoryFilter],
    queryFn: async () => {
      let query = supabase
        .from("transactions")
        .select("*, categories(name, color, icon)")
        .order("date_time", { ascending: false })
        .limit(50);

      if (categoryFilter !== "all") {
        query = query.eq("category_id", categoryFilter);
      }

      if (searchQuery) {
        query = query.ilike("note", `%${searchQuery}%`);
      }

      const { data } = await query;
      return data || [];
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-glow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-2 h-2 bg-secondary rounded-full animate-glow-pulse" />
          Recent Transactions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="space-y-3">
            {transactions?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No transactions yet. Start by adding your first transaction!
              </div>
            ) : (
              transactions?.map((transaction, index) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 bg-card/50 rounded-lg border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg animate-fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${transaction.categories?.color}20` }}
                    >
                      <span className="text-lg">
                        {transaction.categories?.icon || "📝"}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{transaction.categories?.name || "Uncategorized"}</p>
                      <p className="text-sm text-muted-foreground">
                        {transaction.note || "No description"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(transaction.date_time), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-lg font-semibold ${
                        transaction.type === "income" ? "text-success" : "text-destructive"
                      }`}
                    >
                      {transaction.type === "income" ? "+" : "-"}₹
                      {Number(transaction.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </p>
                    <Badge variant={transaction.type === "income" ? "default" : "secondary"}>
                      {transaction.type}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}