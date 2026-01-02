import { ReactNode, useState, useEffect, createContext, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useStore } from '@/features/dev/lib/store';

interface SidebarContextType {
  isVisible: boolean;
  autoHide: boolean;
  toggle: () => void;
  setAutoHide: (value: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | null>(null);

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error('useSidebar must be used within MainLayout');
  return ctx;
}

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const location = useLocation();
  const { initialize } = useStore();
  
  // Load saved preferences
  const [isVisible, setIsVisible] = useState(() => {
    const saved = localStorage.getItem('sidebar-visible');
    return saved ? saved === 'true' : true;
  });
  
  const [autoHide, setAutoHideState] = useState(() => {
    const saved = localStorage.getItem('sidebar-auto-hide');
    return saved === 'true';
  });

  // Ensure store is initialized when layout mounts
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Check if on project detail page (has project ID in URL)
  const isProjectDetail = /^\/dev\/projects\/[a-zA-Z0-9-]+$/.test(location.pathname);

  // Auto-hide logic
  useEffect(() => {
    if (autoHide) {
      if (isProjectDetail) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
    }
  }, [location.pathname, autoHide, isProjectDetail]);

  const toggle = () => {
    const next = !isVisible;
    setIsVisible(next);
    localStorage.setItem('sidebar-visible', String(next));
  };

  const setAutoHide = (value: boolean) => {
    setAutoHideState(value);
    localStorage.setItem('sidebar-auto-hide', String(value));
  };

  return (
    <SidebarContext.Provider value={{ isVisible, autoHide, toggle, setAutoHide }}>
      <div className="flex h-screen bg-background overflow-hidden">
        <Sidebar isVisible={isVisible} autoHide={autoHide} onToggle={toggle} onAutoHideChange={setAutoHide} />
        <main className="flex-1 min-w-0 overflow-auto">
          {children}
        </main>
      </div>
    </SidebarContext.Provider>
  );
}
