import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "lucide-react";
import { useSidebarContext } from "@/contexts/SidebarContext";
import { useSidebar } from "@/components/ui/sidebar";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { TimePicker } from "@/components/ui/time-picker";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface AddTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddTransactionDialog({ open, onOpenChange }: AddTransactionDialogProps) {
  const [type, setType] = useState<"expense" | "income">("expense");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [note, setNote] = useState("");
  const [dateTime, setDateTime] = useState(new Date());
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "online">("cash");
  
  const { isCalculatorOpen } = useSidebarContext();
  const { state } = useSidebar(); // Get the sidebar state
  const isSidebarOpen = state !== "collapsed"; // Check if sidebar is open
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: categories } = useQuery({
    queryKey: ["categories", type],
    queryFn: async () => {
      const { data } = await supabase
        .from("categories")
        .select("*")
        .eq("type", type)
        .order("name");
      return data || [];
    },
  });

  // Auto-select first category when categories load
  // useEffect(() => {
  //   if (categories && categories.length > 0 && !categoryId) {
  //     setCategoryId(categories[0].id);
  //   }
  // }, [categories, categoryId]);

  const addTransaction = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");
      
      const { error } = await supabase.from("transactions").insert({
        type,
        amount: parseFloat(amount),
        category_id: categoryId || null,
        note,
        date_time: dateTime.toISOString(),
        payment_method: paymentMethod,
        user_id: user.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      // Invalidate all relevant queries for immediate updates
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["summary"] });
      queryClient.invalidateQueries({ queryKey: ["category-data"] });
      queryClient.invalidateQueries({ queryKey: ["trend-data"] });
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["budget-progress"] });
      queryClient.invalidateQueries({ queryKey: ["enhanced-budget-alerts"] });
      queryClient.invalidateQueries({ queryKey: ["header-budget-alerts"] });
      
      // Also refetch to ensure latest data
      queryClient.refetchQueries({ queryKey: ["budget-progress"] });
      queryClient.refetchQueries({ queryKey: ["summary"] });
      
      toast({ title: "Transaction added successfully" });
      onOpenChange(false);
      resetForm();
    },
    onError: () => {
      toast({ title: "Failed to add transaction", variant: "destructive" });
    },
  });

  const resetForm = () => {
    setAmount("");
    setCategoryId("");
    setNote("");
    setDateTime(new Date());
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={`sm:max-w-[1600px]`}
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => {
          // Check if the click is on the sidebar or calculator
          const target = e.target as HTMLElement;
          if (target.closest('[data-sidebar="sidebar"]') || target.closest('.sidebar-calculator')) {
            e.preventDefault();
          }
        }}
        onInteractOutside={(e) => {
          // Check if the interaction is with the sidebar or calculator
          const target = e.target as HTMLElement;
          if (target.closest('[data-sidebar="sidebar"]') || target.closest('.sidebar-calculator')) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>Add Transaction</DialogTitle>
        </DialogHeader>

        <Tabs value={type} onValueChange={(v) => setType(v as "expense" | "income")}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="expense">Expense</TabsTrigger>
            <TabsTrigger value="income">Income</TabsTrigger>
          </TabsList>

          <TabsContent value={type} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-[380px_minmax(360px,1fr)_280px] gap-y-6 gap-x-4">
              <div className="space-y-4 bg-card rounded-lg p-4 border">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (INR)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    step="0.01"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <ToggleGroup type="single" value={paymentMethod} onValueChange={(v) => v && setPaymentMethod(v as any)} className="flex flex-wrap gap-2">
                    <ToggleGroupItem value="cash">Cash</ToggleGroupItem>
                    <ToggleGroupItem value="card">Card</ToggleGroupItem>
                    <ToggleGroupItem value="online">Online</ToggleGroupItem>
                  </ToggleGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="note">Note</Label>
                  <Textarea
                    id="note"
                    placeholder="What was this for?"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>

              <div className="space-y-2 bg-card rounded-lg p-4 border">
                <DateTimePicker value={dateTime} onChange={setDateTime} showDate={true} showTime={false} />
              </div>

              <div className="space-y-6 bg-card rounded-lg p-4 border">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={categoryId} onValueChange={setCategoryId} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map((cat) => (
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
                  <Label>Time</Label>
                  <TimePicker value={dateTime} onChange={setDateTime} />
                </div>
              </div>
            </div>

          <Button
            className="w-full"
            onClick={() => {
              if (!amount || !categoryId) {
                toast({ title: "Please fill all required fields", variant: "destructive" });
                return;
              }
              addTransaction.mutate();
            }}
            disabled={!amount || !categoryId || addTransaction.isPending}
          >
            {addTransaction.isPending ? "Adding..." : "Add Transaction"}
          </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}