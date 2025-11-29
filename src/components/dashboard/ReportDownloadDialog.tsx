import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Download, Loader2, Calendar } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";

interface ReportDownloadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReportDownloadDialog({ open, onOpenChange }: ReportDownloadDialogProps) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [transactionType, setTransactionType] = useState<"all" | "income" | "expense">("all");
  const [paymentMethod, setPaymentMethod] = useState<"all" | "cash" | "online">("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isGenerating, setIsGenerating] = useState(false);
  
  const { toast } = useToast();

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await supabase
        .from("categories")
        .select("*")
        .order("name");
      return data || [];
    },
  });

  // Helper function to format currency for PDF - using plain text approach
  const formatCurrencyForPDF = (amount: number) => {
    // Format as plain text without special Unicode characters that might cause issues
    return "Rs. " + Number(amount).toFixed(2);
  };

  const generatePDFReport = async () => {
    if (!startDate || !endDate) {
      toast({ 
        title: "Missing dates", 
        description: "Please select start and end dates",
        variant: "destructive" 
      });
      return;
    }

    setIsGenerating(true);

    try {
      // Fetch transactions with filters
      let query = supabase
        .from("transactions")
        .select("*, categories(name, icon, color)")
        .gte("date_time", new Date(startDate).toISOString())
        .lte("date_time", new Date(endDate).toISOString())
        .order("date_time", { ascending: false });

      if (transactionType !== "all") {
        query = query.eq("type", transactionType);
      }

      if (paymentMethod !== "all") {
        query = query.eq("payment_method", paymentMethod);
      }

      if (categoryFilter !== "all") {
        query = query.eq("category_id", categoryFilter);
      }

      const { data: transactions, error } = await query;

      if (error) throw error;

      if (!transactions || transactions.length === 0) {
        toast({ 
          title: "No data", 
          description: "No transactions found for the selected filters",
          variant: "destructive" 
        });
        setIsGenerating(false);
        return;
      }

      // Fetch budgets for the period
      const { data: budgets } = await supabase
        .from("budgets")
        .select("*, categories(name, icon)")
        .gte("start_date", startDate)
        .lte("end_date", endDate);

      // Calculate totals
      const totalIncome = transactions
        .filter(t => t.type === "income")
        .reduce((sum, t) => sum + Number(t.amount), 0);
      
      const totalExpense = transactions
        .filter(t => t.type === "expense")
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const cashTotal = transactions
        .filter(t => t.payment_method === "cash")
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const onlineTotal = transactions
        .filter(t => t.payment_method === "online")
        .reduce((sum, t) => sum + Number(t.amount), 0);

      // Create PDF
      const doc = new jsPDF();
      
      // Set font to handle special characters properly
      doc.setFont("helvetica");
      
      // Header
      doc.setFillColor(18, 18, 18);
      doc.rect(0, 0, 210, 40, 'F');
      
      doc.setTextColor(0, 173, 181);
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.text("Financial Report", 105, 20, { align: "center" });
      
      doc.setTextColor(150, 150, 150);
      doc.setFontSize(10);
      doc.text(`Generated on ${format(new Date(), "PPP")}`, 105, 28, { align: "center" });
      doc.text(`Period: ${format(new Date(startDate), "PP")} - ${format(new Date(endDate), "PP")}`, 105, 34, { align: "center" });

      // Summary Section
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Summary", 14, 50);

      const summaryData = [
        ["Total Income", formatCurrencyForPDF(totalIncome)],
        ["Total Expense", formatCurrencyForPDF(totalExpense)],
        ["Net Balance", formatCurrencyForPDF(totalIncome - totalExpense)],
        ["Cash Transactions", formatCurrencyForPDF(cashTotal)],
        ["Online Transactions", formatCurrencyForPDF(onlineTotal)],
        ["Total Transactions", transactions.length.toString()],
      ];

      autoTable(doc, {
        startY: 55,
        head: [["Metric", "Value"]],
        body: summaryData,
        theme: "grid",
        headStyles: { fillColor: [0, 173, 181], textColor: [255, 255, 255] },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        margin: { left: 14, right: 14 },
      });

      // Budget Section
      const budgetSectionY = (doc as any).lastAutoTable.finalY || 120;
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Budget Overview", 14, budgetSectionY + 10);

      if (budgets && budgets.length > 0) {
        // Calculate budget usage
        const budgetUsageData = [];
        for (const budget of budgets) {
          // Get transactions for this budget's category in the period
          const budgetTransactions = transactions.filter(t => 
            t.category_id === budget.category_id && 
            t.type === "expense" &&
            new Date(t.date_time) >= new Date(budget.start_date) &&
            new Date(t.date_time) <= new Date(budget.end_date)
          );

          const spent = budgetTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
          const budgetAmount = Number(budget.amount);
          const percentage = ((spent / budgetAmount) * 100).toFixed(1);

          budgetUsageData.push([
            budget.categories?.name || "Overall Budget",
            budget.period,
            formatCurrencyForPDF(budgetAmount),
            formatCurrencyForPDF(spent),
            `${percentage}%`
          ]);
        }

        autoTable(doc, {
          startY: budgetSectionY + 15,
          head: [["Category", "Period", "Budget", "Spent", "Used"]],
          body: budgetUsageData,
          theme: "grid",
          headStyles: { fillColor: [0, 173, 181], textColor: [255, 255, 255] },
          alternateRowStyles: { fillColor: [245, 245, 245] },
          margin: { left: 14, right: 14 },
        });
      } else {
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 100, 100);
        doc.text("No budgets defined for this period", 14, budgetSectionY + 20);
      }

      // Transactions Table
      const finalY = (doc as any).lastAutoTable?.finalY || budgetSectionY + 30;
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Transactions", 14, finalY + 10);

      const tableData = transactions.map(t => [
        format(new Date(t.date_time), "PPp"),
        t.categories?.name || "Uncategorized",
        t.type.charAt(0).toUpperCase() + t.type.slice(1),
        t.payment_method?.charAt(0).toUpperCase() + t.payment_method?.slice(1) || "N/A",
        formatCurrencyForPDF(Number(t.amount)),
        t.note || "-",
      ]);

      autoTable(doc, {
        startY: finalY + 15,
        head: [["Date & Time", "Category", "Type", "Payment", "Amount", "Note"]],
        body: tableData,
        theme: "striped",
        headStyles: { fillColor: [0, 173, 181], textColor: [255, 255, 255] },
        columnStyles: {
          0: { cellWidth: 35 },
          1: { cellWidth: 30 },
          2: { cellWidth: 20 },
          3: { cellWidth: 20 },
          4: { cellWidth: 25 },
          5: { cellWidth: 'auto' },
        },
        margin: { left: 14, right: 14 },
        styles: { fontSize: 8 },
      });

      // Save PDF
      const fileName = `financial-report-${format(new Date(startDate), "yyyy-MM-dd")}-to-${format(new Date(endDate), "yyyy-MM-dd")}.pdf`;
      doc.save(fileName);

      toast({ 
        title: "Report generated", 
        description: `Downloaded ${fileName}` 
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error("Error generating report:", error);
      toast({ 
        title: "Error", 
        description: "Failed to generate report",
        variant: "destructive" 
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Download Financial Report
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Transaction Type</Label>
              <Select value={transactionType} onValueChange={(v) => setTransactionType(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Transactions</SelectItem>
                  <SelectItem value="income">Income Only</SelectItem>
                  <SelectItem value="expense">Expense Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  <SelectItem value="cash">Cash Only</SelectItem>
                  <SelectItem value="online">Online Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Category Filter</Label>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories?.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            className="w-full bg-gradient-to-r from-primary to-accent"
            onClick={generatePDFReport}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Generate PDF Report
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}