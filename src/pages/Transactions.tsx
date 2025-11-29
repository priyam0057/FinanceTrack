import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { AddTransactionDialog } from "@/components/dashboard/AddTransactionDialog";
import { ReportDownloadDialog } from "@/components/dashboard/ReportDownloadDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TransactionFilters } from "@/components/dashboard/TransactionFilters";
import { Edit, Trash2, Calendar, MapPin, CreditCard } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function Transactions() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("*").order("name");
      return data || [];
    },
  });

  const { data: transactions, isLoading } = useQuery({
    queryKey: ["all-transactions", searchQuery, categoryFilter],
    queryFn: async () => {
      let query = supabase
        .from("transactions")
        .select("*, categories(name, color, icon)")
        .order("date_time", { ascending: false });

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

  const updateMutation = useMutation({
    mutationFn: async (values: any) => {
      const { error } = await supabase
        .from("transactions")
        .update(values)
        .eq("id", editingTransaction.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-transactions"] });
      toast.success("Transaction updated successfully");
      setEditingTransaction(null);
    },
    onError: () => {
      toast.error("Failed to update transaction");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("transactions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-transactions"] });
      toast.success("Transaction deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete transaction");
    },
  });

  const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    updateMutation.mutate({
      amount: formData.get("amount"),
      category_id: formData.get("category_id"),
      note: formData.get("note"),
      type: formData.get("type"),
      payment_method: formData.get("payment_method"),
    });
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          <DashboardHeader 
            onAddTransaction={() => setIsAddDialogOpen(true)} 
            onDownloadReport={() => setIsReportDialogOpen(true)}
          />
          
          <main className="flex-1 p-6 space-y-6 overflow-auto">
            <div className="max-w-7xl mx-auto space-y-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">All Transactions</h1>
                <p className="text-muted-foreground">View and manage all your transactions</p>
              </div>

        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <TransactionFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              categoryFilter={categoryFilter}
              onCategoryFilterChange={setCategoryFilter}
              categories={categories || []}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Transactions ({transactions?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : transactions?.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No transactions found
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions?.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="p-4 border rounded-lg hover:border-primary/50 transition-all"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          <div
                            className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: `${transaction.categories?.color}20` }}
                          >
                            <span className="text-xl">{transaction.categories?.icon || "📝"}</span>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">{transaction.categories?.name || "Uncategorized"}</h3>
                              <Badge variant={transaction.type === "income" ? "default" : "secondary"}>
                                {transaction.type}
                              </Badge>
                            </div>
                            
                            <p className="text-sm text-muted-foreground mb-2">
                              {transaction.note || "No description"}
                            </p>
                            
                            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-yellow-500" />
                                {format(new Date(transaction.date_time), "PPp")}
                              </div>
                              {transaction.payment_method && (
                                <div className="flex items-center gap-1">
                                  <CreditCard className="w-3 h-3" />
                                  {transaction.payment_method}
                                </div>
                              )}
                              {transaction.place_name && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {transaction.place_name}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <p
                            className={`text-xl font-bold ${
                              transaction.type === "income" ? "text-success" : "text-destructive"
                            }`}
                          >
                            {transaction.type === "income" ? "+" : "-"}₹
                            {Number(transaction.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                          </p>
                          
                          <div className="flex gap-1">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setEditingTransaction(transaction)}
                                >
                                  <Edit className="w-3 h-3" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Edit Transaction</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleUpdate} className="space-y-4">
                                  <div>
                                    <Label>Amount</Label>
                                    <Input
                                      name="amount"
                                      type="number"
                                      step="0.01"
                                      defaultValue={transaction.amount}
                                      required
                                    />
                                  </div>
                                  <div>
                                    <Label>Type</Label>
                                    <Select name="type" defaultValue={transaction.type}>
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="income">Income</SelectItem>
                                        <SelectItem value="expense">Expense</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div>
                                    <Label>Category</Label>
                                    <Select name="category_id" defaultValue={transaction.category_id}>
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {categories?.map((cat) => (
                                          <SelectItem key={cat.id} value={cat.id}>
                                            {cat.icon} {cat.name}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div>
                                    <Label>Payment Method</Label>
                                    <Select name="payment_method" defaultValue={transaction.payment_method}>
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="cash">Cash</SelectItem>
                                        <SelectItem value="card">Card</SelectItem>
                                        <SelectItem value="upi">UPI</SelectItem>
                                        <SelectItem value="netbanking">Net Banking</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div>
                                    <Label>Note</Label>
                                    <Textarea
                                      name="note"
                                      defaultValue={transaction.note}
                                      rows={3}
                                    />
                                  </div>
                                  <Button type="submit" className="w-full">
                                    Save Changes
                                  </Button>
                                </form>
                              </DialogContent>
                            </Dialog>
                            
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                if (confirm("Are you sure you want to delete this transaction?")) {
                                  deleteMutation.mutate(transaction.id);
                                }
                              }}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
            </div>
          </main>
        </div>

        <AddTransactionDialog 
          open={isAddDialogOpen} 
          onOpenChange={setIsAddDialogOpen}
        />

        <ReportDownloadDialog 
          open={isReportDialogOpen} 
          onOpenChange={setIsReportDialogOpen}
        />
      </div>
    </SidebarProvider>
  );
}