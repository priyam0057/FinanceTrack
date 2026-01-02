import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DollarSign } from "lucide-react";

const TipCalculator = () => {
  const [tipAmount, setTipAmount] = useState({ bill: "", tip: "15", people: "1" });

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

  return (
    <div className="p-4">
      <div className="flex items-center gap-3 mb-4">
        <DollarSign className="w-6 h-6 text-primary" />
        <h2 className="text-xl font-bold">Tip Calculator</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Calculate Tip & Split Bill</CardTitle>
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
    </div>
  );
};

export default TipCalculator;