import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calculator as CalculatorIcon, History, X } from "lucide-react";

interface Calculation {
  expression: string;
  result: string;
}

const Calculator = () => {
  const [display, setDisplay] = useState("0");
  const [history, setHistory] = useState<Calculation[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const displayRef = useRef<HTMLDivElement>(null);

  // Load history from sessionStorage on component mount
  useEffect(() => {
    const savedHistory = sessionStorage.getItem("calculatorHistory");
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch {
        setHistory([]);
      }
    }
  }, []);

  // Save history to sessionStorage whenever it changes
  useEffect(() => {
    sessionStorage.setItem("calculatorHistory", JSON.stringify(history));
  }, [history]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if an input or textarea is currently focused
      const activeElement = document.activeElement;
      const isInputFocused = activeElement?.tagName === 'INPUT' || activeElement?.tagName === 'TEXTAREA';
      
      // If an input/textarea is focused, don't intercept keystrokes
      if (isInputFocused) {
        return;
      }
      
      const key = e.key;
      
      // Prevent default behavior for keys we're handling
      if (/[0-9+\-*/.=]|Enter|Escape|Backspace/.test(key)) {
        e.preventDefault();
      }
      
      // Map keyboard keys to calculator functions
      switch (key) {
        case "0":
        case "1":
        case "2":
        case "3":
        case "4":
        case "5":
        case "6":
        case "7":
        case "8":
        case "9":
        case ".":
        case "+":
        case "-":
        case "*":
        case "/":
          calculate(key);
          break;
        case "Enter":
        case "=":
          calculate("=");
          break;
        case "Escape":
          calculate("C");
          break;
        case "Backspace":
          handleBackspace();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [display]);

  const handleBackspace = () => {
    setDisplay(prev => {
      if (prev.length <= 1) {
        return "0";
      }
      return prev.slice(0, -1);
    });
  };

  const calculate = (val: string) => {
    try {
      if (val === "=") {
        const result = eval(display).toString();
        // Add to history
        const newHistory = [{ expression: display, result }, ...history.slice(0, 9)]; // Keep last 10 items
        setHistory(newHistory);
        setDisplay(result);
      } else if (val === "C") {
        setDisplay("0");
      } else if (val === "CE") {
        // Clear entry - clear current display but keep history
        setDisplay("0");
      } else {
        setDisplay(display === "0" ? val : display + val);
      }
    } catch {
      setDisplay("Error");
    }
  };

  const useFromHistory = (expression: string, result: string) => {
    setDisplay(result);
    setShowHistory(false);
  };

  const clearHistory = () => {
    setHistory([]);
    sessionStorage.removeItem("calculatorHistory");
  };

  return (
    <div className="p-5 sidebar-calculator">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <CalculatorIcon className="w-7 h-7 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Calculator</h2>
        </div>
        <div className="flex gap-2">
          {history.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
              className="h-9 px-3 glass-effect border-white/10 hover:bg-white/10 rounded-xl"
            >
              <History className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>

      {showHistory ? (
        <Card className="mb-5 glass-effect border-white/10 rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between p-4">
            <CardTitle className="text-xl text-foreground">History</CardTitle>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={clearHistory} className="h-9 px-3 hover:bg-white/10 rounded-lg">
                <X className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowHistory(false)} className="h-9 px-3 hover:bg-white/10 rounded-lg">
                <X className="w-5 h-5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0 max-h-64 overflow-y-auto">
            {history.length === 0 ? (
              <div className="p-5 text-center text-muted-foreground">No history yet</div>
            ) : (
              <ul className="divide-y divide-white/10">
                {history.map((item, index) => (
                  <li 
                    key={index} 
                    className="p-4 hover:bg-white/5 cursor-pointer transition-colors duration-200"
                    onClick={() => useFromHistory(item.expression, item.result)}
                  >
                    <div className="text-sm text-muted-foreground">{item.expression}</div>
                    <div className="font-medium text-foreground">= {item.result}</div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      ) : null}

      <Card className="glass-effect border-white/10 rounded-3xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl text-foreground">Basic Calculator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div 
            ref={displayRef}
            className="bg-black/20 p-5 rounded-2xl text-right text-2xl font-mono border border-white/10 focus:outline-none focus:ring-2 focus:ring-primary/50 backdrop-blur-sm"
            tabIndex={0}
          >
            {display}
          </div>
          <div className="grid grid-cols-4 gap-3">
            <Button 
              onClick={() => calculate("C")} 
              variant="outline" 
              className="h-14 text-lg rounded-2xl bg-black/20 border-white/10 hover:bg-white/10 hover:border-primary"
            >
              C
            </Button>
            <Button 
              onClick={() => calculate("CE")} 
              variant="outline" 
              className="h-14 text-lg rounded-2xl bg-black/20 border-white/10 hover:bg-white/10 hover:border-primary"
            >
              CE
            </Button>
            <Button 
              onClick={handleBackspace} 
              variant="outline" 
              className="h-14 text-lg rounded-2xl bg-black/20 border-white/10 hover:bg-white/10 hover:border-primary"
            >
              ⌫
            </Button>
            <Button 
              onClick={() => calculate("/")} 
              variant="outline" 
              className="h-14 text-lg rounded-2xl bg-gradient-to-br from-primary to-blue-600 text-white hover:from-primary/90 hover:to-blue-700 shadow-lg hover:shadow-primary/20"
            >
              ÷
            </Button>
            
            <Button 
              onClick={() => calculate("7")} 
              variant="outline" 
              className="h-14 text-lg rounded-2xl bg-black/20 border-white/10 hover:bg-white/10"
            >
              7
            </Button>
            <Button 
              onClick={() => calculate("8")} 
              variant="outline" 
              className="h-14 text-lg rounded-2xl bg-black/20 border-white/10 hover:bg-white/10"
            >
              8
            </Button>
            <Button 
              onClick={() => calculate("9")} 
              variant="outline" 
              className="h-14 text-lg rounded-2xl bg-black/20 border-white/10 hover:bg-white/10"
            >
              9
            </Button>
            <Button 
              onClick={() => calculate("*")} 
              variant="outline" 
              className="h-14 text-lg rounded-2xl bg-gradient-to-br from-primary to-blue-600 text-white hover:from-primary/90 hover:to-blue-700 shadow-lg hover:shadow-primary/20"
            >
              ×
            </Button>
            
            <Button 
              onClick={() => calculate("4")} 
              variant="outline" 
              className="h-14 text-lg rounded-2xl bg-black/20 border-white/10 hover:bg-white/10"
            >
              4
            </Button>
            <Button 
              onClick={() => calculate("5")} 
              variant="outline" 
              className="h-14 text-lg rounded-2xl bg-black/20 border-white/10 hover:bg-white/10"
            >
              5
            </Button>
            <Button 
              onClick={() => calculate("6")} 
              variant="outline" 
              className="h-14 text-lg rounded-2xl bg-black/20 border-white/10 hover:bg-white/10"
            >
              6
            </Button>
            <Button 
              onClick={() => calculate("-")} 
              variant="outline" 
              className="h-14 text-lg rounded-2xl bg-gradient-to-br from-primary to-blue-600 text-white hover:from-primary/90 hover:to-blue-700 shadow-lg hover:shadow-primary/20"
            >
              -
            </Button>
            
            <Button 
              onClick={() => calculate("1")} 
              variant="outline" 
              className="h-14 text-lg rounded-2xl bg-black/20 border-white/10 hover:bg-white/10"
            >
              1
            </Button>
            <Button 
              onClick={() => calculate("2")} 
              variant="outline" 
              className="h-14 text-lg rounded-2xl bg-black/20 border-white/10 hover:bg-white/10"
            >
              2
            </Button>
            <Button 
              onClick={() => calculate("3")} 
              variant="outline" 
              className="h-14 text-lg rounded-2xl bg-black/20 border-white/10 hover:bg-white/10"
            >
              3
            </Button>
            <Button 
              onClick={() => calculate("+")} 
              variant="outline" 
              className="h-14 text-lg rounded-2xl bg-gradient-to-br from-primary to-blue-600 text-white hover:from-primary/90 hover:to-blue-700 shadow-lg hover:shadow-primary/20"
            >
              +
            </Button>
            
            <Button 
              onClick={() => calculate("0")} 
              variant="outline" 
              className="h-14 text-lg rounded-2xl bg-black/20 border-white/10 hover:bg-white/10 col-span-2"
            >
              0
            </Button>
            <Button 
              onClick={() => calculate(".")} 
              variant="outline" 
              className="h-14 text-lg rounded-2xl bg-black/20 border-white/10 hover:bg-white/10"
            >
              .
            </Button>
            <Button 
              onClick={() => calculate("=")} 
              variant="default" 
              className="h-14 text-lg rounded-2xl bg-gradient-to-br from-primary to-blue-600 text-white hover:from-primary/90 hover:to-blue-700 shadow-lg hover:shadow-primary/20"
            >
              =
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <div className="mt-3 text-sm text-muted-foreground text-center">
        Tip: Use keyboard for input
      </div>
    </div>
  );
};

export default Calculator;