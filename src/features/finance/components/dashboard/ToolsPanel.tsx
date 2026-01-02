import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator, DollarSign, Percent, Ruler } from "lucide-react";

export function ToolsPanel() {
  const [calcDisplay, setCalcDisplay] = useState("0");
  const [tipAmount, setTipAmount] = useState({ bill: "", tip: "15", people: "1" });
  const [converter, setConverter] = useState({ value: "", from: "USD", to: "INR" });

  const calculate = (val: string) => {
    try {
      if (val === "=") {
        setCalcDisplay(eval(calcDisplay).toString());
      } else if (val === "C") {
        setCalcDisplay("0");
      } else {
        setCalcDisplay(calcDisplay === "0" ? val : calcDisplay + val);
      }
    } catch {
      setCalcDisplay("Error");
    }
  };

  const calculateTip = () => {
    const bill = parseFloat(tipAmount.bill) || 0;
    const tipPercent = parseFloat(tipAmount.tip) || 0;
    const people = parseFloat(tipAmount.people) || 1;
    const tip = (bill * tipPercent) / 100;
    const total = bill + tip;
    const perPerson = total / people;
    return { tip, total, perPerson };
  };

  const tipResult = calculateTip();

  const convertCurrency = () => {
    const rates: Record<string, number> = { USD: 1, INR: 83, EUR: 0.92, GBP: 0.79 };
    const value = parseFloat(converter.value) || 0;
    const from = rates[converter.from] || 1;
    const to = rates[converter.to] || 1;
    return ((value / from) * to).toFixed(2);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Tabs defaultValue="calculator" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-card/50">
          <TabsTrigger value="calculator">
            <Calculator className="w-4 h-4 mr-2" />
            Calculator
          </TabsTrigger>
          <TabsTrigger value="tip">
            <Percent className="w-4 h-4 mr-2" />
            Tip Calc
          </TabsTrigger>
          <TabsTrigger value="currency">
            <DollarSign className="w-4 h-4 mr-2" />
            Currency
          </TabsTrigger>
          <TabsTrigger value="unit">
            <Ruler className="w-4 h-4 mr-2" />
            Units
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calculator">
          <Card className="card-glow">
            <CardHeader>
              <CardTitle>Calculator</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-background p-4 rounded-lg text-right text-2xl font-mono border border-primary/30">
                {calcDisplay}
              </div>
              <div className="grid grid-cols-4 gap-2">
                {["7", "8", "9", "/", "4", "5", "6", "*", "1", "2", "3", "-", "0", ".", "=", "+"].map((btn) => (
                  <Button
                    key={btn}
                    onClick={() => calculate(btn)}
                    variant={btn === "=" ? "default" : "outline"}
                    className="h-14 text-lg"
                  >
                    {btn}
                  </Button>
                ))}
                <Button onClick={() => calculate("C")} variant="destructive" className="h-14 text-lg col-span-4">
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tip">
          <Card className="card-glow">
            <CardHeader>
              <CardTitle>Tip Calculator</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm">Bill Amount (₹)</label>
                <Input
                  type="number"
                  value={tipAmount.bill}
                  onChange={(e) => setTipAmount({ ...tipAmount, bill: e.target.value })}
                  placeholder="1000"
                />
              </div>
              <div>
                <label className="text-sm">Tip Percentage (%)</label>
                <Input
                  type="number"
                  value={tipAmount.tip}
                  onChange={(e) => setTipAmount({ ...tipAmount, tip: e.target.value })}
                  placeholder="15"
                />
              </div>
              <div>
                <label className="text-sm">Split Between (People)</label>
                <Input
                  type="number"
                  value={tipAmount.people}
                  onChange={(e) => setTipAmount({ ...tipAmount, people: e.target.value })}
                  placeholder="1"
                />
              </div>
              <div className="bg-success/10 p-4 rounded-lg space-y-2 border border-success/30">
                <div className="flex justify-between">
                  <span>Tip Amount:</span>
                  <span className="font-bold text-success">₹{tipResult.tip.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total:</span>
                  <span className="font-bold text-primary">₹{tipResult.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Per Person:</span>
                  <span className="font-bold text-secondary">₹{tipResult.perPerson.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="currency">
          <Card className="card-glow">
            <CardHeader>
              <CardTitle>Currency Converter</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm">Amount</label>
                <Input
                  type="number"
                  value={converter.value}
                  onChange={(e) => setConverter({ ...converter, value: e.target.value })}
                  placeholder="100"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm">From</label>
                  <select
                    className="w-full p-2 bg-background border border-border rounded-lg"
                    value={converter.from}
                    onChange={(e) => setConverter({ ...converter, from: e.target.value })}
                  >
                    <option value="USD">USD</option>
                    <option value="INR">INR</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm">To</label>
                  <select
                    className="w-full p-2 bg-background border border-border rounded-lg"
                    value={converter.to}
                    onChange={(e) => setConverter({ ...converter, to: e.target.value })}
                  >
                    <option value="USD">USD</option>
                    <option value="INR">INR</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                  </select>
                </div>
              </div>
              <div className="bg-primary/10 p-4 rounded-lg border border-primary/30">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Converted Amount</p>
                  <p className="text-3xl font-bold text-primary">
                    {converter.to} {convertCurrency()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="unit">
          <Card className="card-glow">
            <CardHeader>
              <CardTitle>Unit Converter</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-8">
                Unit converter coming soon!<br />
                Will support length, weight, temperature, and more.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
