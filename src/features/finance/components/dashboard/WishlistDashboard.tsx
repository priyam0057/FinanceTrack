import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Heart, Trash2, CheckCircle, Save, PartyPopper } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

interface WishlistItem {
  id: string;
  name: string;
  cost: number;
  priority: string;
  note: string | null;
  saved: number;
  purchased: boolean;
  created_at: string;
  updated_at: string;
}

export function WishlistDashboard() {
  const [open, setOpen] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [saveAmount, setSaveAmount] = useState("");
  const [newItem, setNewItem] = useState({
    name: "",
    cost: "",
    priority: "medium",
    note: "",
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch wishlist items
  const { data: items = [], isLoading, isError, error } = useQuery({
    queryKey: ["wishlist-items"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");
      
      const { data, error } = await supabase
        .from("wishlist_items")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      
      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }
      return data as WishlistItem[];
    },
    retry: 1, // Retry once on failure
  });

  // Add wishlist item mutation
  const addItemMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");
      
      const { data, error } = await supabase
        .from("wishlist_items")
        .insert({
          user_id: user.id,
          name: newItem.name,
          cost: parseFloat(newItem.cost),
          priority: newItem.priority,
          note: newItem.note || null,
          saved: 0,
          purchased: false,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as WishlistItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist-items"] });
      setNewItem({ name: "", cost: "", priority: "medium", note: "" });
      setOpen(false);
      toast({ title: "Item added to wishlist successfully" });
    },
    onError: (error) => {
      toast({ title: "Failed to add item", variant: "destructive" });
      console.error("Error adding wishlist item:", error);
    },
  });

  // Delete wishlist item mutation
  const deleteItemMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("wishlist_items")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist-items"] });
      toast({ title: "Item removed from wishlist" });
    },
    onError: (error) => {
      toast({ title: "Failed to remove item", variant: "destructive" });
      console.error("Error deleting wishlist item:", error);
    },
  });

  // Save amount mutation
  const saveAmountMutation = useMutation({
    mutationFn: async ({ id, amount }: { id: string; amount: number }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Get current item to calculate new saved amount
      const { data: currentItem, error: fetchError } = await supabase
        .from("wishlist_items")
        .select("saved")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;

      const newSavedAmount = currentItem.saved + amount;

      const { data, error } = await supabase
        .from("wishlist_items")
        .update({
          saved: newSavedAmount,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as WishlistItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist-items"] });
      setSaveDialogOpen(false);
      setSaveAmount("");
      setSelectedItemId(null);
      toast({ title: "Amount saved successfully!" });
    },
    onError: (error) => {
      toast({ title: "Failed to save amount", variant: "destructive" });
      console.error("Error saving amount:", error);
    },
  });

  // Mark as purchased mutation
  const markAsPurchasedMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from("wishlist_items")
        .update({
          purchased: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as WishlistItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist-items"] });
      setCompleteDialogOpen(false);
      setSelectedItemId(null);
      toast({ title: "Congratulations! Item marked as purchased!" });
    },
    onError: (error) => {
      toast({ title: "Failed to mark as purchased", variant: "destructive" });
      console.error("Error marking as purchased:", error);
    },
  });

  const addItem = () => {
    if (!newItem.name || !newItem.cost) return;
    addItemMutation.mutate();
  };

  const deleteItem = (id: string) => {
    deleteItemMutation.mutate(id);
  };

  const openSaveDialog = (id: string) => {
    setSelectedItemId(id);
    setSaveDialogOpen(true);
  };

  const openCompleteDialog = (id: string) => {
    setSelectedItemId(id);
    setCompleteDialogOpen(true);
  };

  const handleSaveAmount = () => {
    if (!selectedItemId || !saveAmount) return;
    saveAmountMutation.mutate({ id: selectedItemId, amount: parseFloat(saveAmount) });
  };

  const handleMarkAsPurchased = () => {
    if (!selectedItemId) return;
    markAsPurchasedMutation.mutate(selectedItemId);
  };

  const totalWishlistCost = items.reduce((sum, item) => sum + item.cost, 0);
  const totalSaved = items.reduce((sum, item) => sum + item.saved, 0);
  const activeItems = items.filter(item => !item.purchased);
  const purchasedItems = items.filter(item => item.purchased);

  if (isLoading) {
    return <div className="p-4">Loading wishlist...</div>;
  }

  if (isError) {
    console.error("Wishlist error:", error);
    return (
      <div className="space-y-6">
        {/* Error Message */}
        <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
          <h3 className="font-bold text-destructive">Error loading wishlist</h3>
          <p className="text-sm text-destructive/80 mt-1">
            {error?.message || "Please try again later."}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            This could be due to database connection issues or missing table setup.
          </p>
        </div>
        
        {/* Still show the Add Button even when there's an error */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="w-full md:w-auto bg-gradient-to-r from-secondary to-secondary/80 hover:from-secondary/90 hover:to-secondary/70">
              <Plus className="w-4 h-4 mr-2" />
              Add Wishlist Item
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card">
            <DialogHeader>
              <DialogTitle>Add to Wishlist</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Item Name</Label>
                <Input
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  placeholder="iPhone 15 Pro"
                />
              </div>
              <div>
                <Label>Estimated Cost (INR)</Label>
                <Input
                  type="number"
                  value={newItem.cost}
                  onChange={(e) => setNewItem({ ...newItem, cost: e.target.value })}
                  placeholder="120000"
                />
              </div>
              <div>
                <Label>Priority</Label>
                <select
                  className="w-full p-2 bg-background border border-border rounded-lg"
                  value={newItem.priority}
                  onChange={(e) => setNewItem({ ...newItem, priority: e.target.value })}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea
                  value={newItem.note}
                  onChange={(e) => setNewItem({ ...newItem, note: e.target.value })}
                  placeholder="Why do you want this?"
                />
              </div>
              <Button 
                onClick={addItem} 
                className="w-full" 
                disabled={!newItem.name || !newItem.cost || addItemMutation.isPending}
              >
                {addItemMutation.isPending ? "Adding..." : "Add Item"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        
        {/* Empty state */}
        <Card className="card-glow">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Heart className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              Unable to load wishlist items.<br />Try adding items or check your connection.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="card-glow border-secondary/30">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Wishlist Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">₹{totalWishlistCost.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card className="card-glow border-success/30">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Saved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">₹{totalSaved.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card className="card-glow border-primary/30">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Items on List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{activeItems.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Add Button */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="w-full md:w-auto bg-gradient-to-r from-secondary to-secondary/80 hover:from-secondary/90 hover:to-secondary/70">
            <Plus className="w-4 h-4 mr-2" />
            Add Wishlist Item
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-card">
          <DialogHeader>
            <DialogTitle>Add to Wishlist</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Item Name</Label>
              <Input
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                placeholder="iPhone 15 Pro"
              />
            </div>
            <div>
              <Label>Estimated Cost (INR)</Label>
              <Input
                type="number"
                value={newItem.cost}
                onChange={(e) => setNewItem({ ...newItem, cost: e.target.value })}
                placeholder="120000"
              />
            </div>
            <div>
              <Label>Priority</Label>
              <select
                className="w-full p-2 bg-background border border-border rounded-lg"
                value={newItem.priority}
                onChange={(e) => setNewItem({ ...newItem, priority: e.target.value })}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea
                value={newItem.note}
                onChange={(e) => setNewItem({ ...newItem, note: e.target.value })}
                placeholder="Why do you want this?"
              />
            </div>
            <Button 
              onClick={addItem} 
              className="w-full" 
              disabled={!newItem.name || !newItem.cost || addItemMutation.isPending}
            >
              {addItemMutation.isPending ? "Adding..." : "Add Item"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Active Wishlist Items */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {activeItems.map((item) => {
          const progress = (item.saved / item.cost) * 100;
          return (
            <Card key={item.id} className="card-glow relative overflow-hidden">
              <div className="absolute top-2 right-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteItem(item.id)}
                  className="hover:bg-destructive/20"
                  disabled={deleteItemMutation.isPending}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
              <CardHeader>
                <div className="flex items-start gap-2">
                  <Heart className="w-5 h-5 text-secondary mt-1" />
                  <div>
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                    <p className="text-sm text-muted-foreground capitalize">{item.priority} priority</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Progress</span>
                    <span className="text-primary">{progress.toFixed(0)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Target:</span>
                  <span className="font-bold text-secondary">₹{item.cost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Saved:</span>
                  <span className="font-bold text-success">₹{item.saved.toFixed(2)}</span>
                </div>
                {item.note && (
                  <p className="text-sm text-muted-foreground italic">{item.note}</p>
                )}
                <div className="flex gap-2 pt-2">
                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={() => openSaveDialog(item.id)}
                  >
                    <Save className="w-4 h-4 mr-1" />
                    Save
                  </Button>
                  <Button 
                    size="sm" 
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => openCompleteDialog(item.id)}
                    disabled={progress < 100}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Complete
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {activeItems.length === 0 && (
        <Card className="card-glow">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Heart className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              No items in your wishlist yet.<br />Start adding items you wish to purchase!
            </p>
          </CardContent>
        </Card>
      )}

      {/* Purchased Items Section */}
      {purchasedItems.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
            Completed Purchases
          </h2>
          <div className="space-y-2">
            {purchasedItems.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/20 rounded-lg"
              >
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span className="font-medium">{item.name}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  ₹{item.cost.toFixed(2)}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Save Amount Dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent className="bg-card">
          <DialogHeader>
            <DialogTitle>Save Amount</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Enter the amount you want to save for this item:</p>
            <div>
              <Label>Amount (INR)</Label>
              <Input
                type="number"
                value={saveAmount}
                onChange={(e) => setSaveAmount(e.target.value)}
                placeholder="Enter amount"
              />
            </div>
            <Button 
              onClick={handleSaveAmount} 
              className="w-full" 
              disabled={!saveAmount || saveAmountMutation.isPending}
            >
              {saveAmountMutation.isPending ? "Saving..." : "Save Amount"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Complete Purchase Dialog */}
      <Dialog open={completeDialogOpen} onOpenChange={setCompleteDialogOpen}>
        <DialogContent className="bg-card text-center">
          <AnimatePresence>
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", duration: 0.5 }}
            >
              <PartyPopper className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <DialogHeader>
                <DialogTitle className="text-2xl">Congratulations!</DialogTitle>
              </DialogHeader>
              <p className="mb-6 text-muted-foreground">
                You've successfully purchased this item! Great job on achieving your goal.
              </p>
              <Button 
                onClick={handleMarkAsPurchased} 
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Mark as Purchased
              </Button>
            </motion.div>
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </div>
  );
}