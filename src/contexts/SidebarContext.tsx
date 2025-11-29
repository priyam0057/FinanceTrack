import { createContext, useContext, useState, ReactNode } from "react";

interface SidebarContextType {
  isCalculatorOpen: boolean;
  isSidebarOpen: boolean;
  setIsCalculatorOpen: (isOpen: boolean) => void;
  setIsSidebarOpen: (isOpen: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SidebarProvider = ({ children }: { children: ReactNode }) => {
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <SidebarContext.Provider value={{ 
      isCalculatorOpen, 
      isSidebarOpen,
      setIsCalculatorOpen,
      setIsSidebarOpen
    }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebarContext = () => {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error("useSidebarContext must be used within a SidebarProvider");
  }
  return context;
};