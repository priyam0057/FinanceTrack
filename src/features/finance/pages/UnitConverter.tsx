import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Scale } from "lucide-react";

const UnitConverter = () => {
  const [converter, setConverter] = useState({ value: "", from: "USD", to: "INR" });

  const convertCurrency = () => {
    const rates: Record<string, number> = { USD: 1, INR: 83, EUR: 0.92, GBP: 0.79 };
    const value = parseFloat(converter.value) || 0;
    const from = rates[converter.from] || 1;
    const to = rates[converter.to] || 1;
    return ((value / from) * to).toFixed(2);
  };

  return (
    <div className="p-4">
      <div className="flex items-center gap-3 mb-4">
        <Scale className="w-6 h-6 text-primary" />
        <h2 className="text-xl font-bold">Unit Converter</h2>
      </div>

      <Card>
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
              <p className="text-2xl font-bold text-primary">
                {converter.to} {convertCurrency()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UnitConverter;