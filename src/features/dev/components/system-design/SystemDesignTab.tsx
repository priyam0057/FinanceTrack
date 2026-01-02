import { useState, useEffect } from 'react';
import { ArchitectureEditor } from './ArchitectureEditor';
import { DatabaseEditor } from './DatabaseEditor';
import { FrontendEditor } from './FrontendEditor';
import { ApiDocsTab } from './ApiDocsTab';
import { TechStackTab } from './TechStackTab';
import { EnvConfigTab } from './EnvConfigTab';
import { ProjectHealth } from './ProjectHealth';
import { 
  Network, Database, Palette, X, MousePointer2, Code, Layers, Settings, Activity,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type DesignView = 'architecture' | 'database' | 'frontend' | 'api-docs' | 'tech-stack' | 'env-config' | 'health';

interface SystemDesignTabProps {
  projectId: string;
}

const tabs = [
  { id: 'health' as const, label: 'Health', icon: Activity },
  { id: 'architecture' as const, label: 'Backend', icon: Network },
  { id: 'database' as const, label: 'Database', icon: Database },
  { id: 'frontend' as const, label: 'Frontend', icon: Palette },
  { id: 'api-docs' as const, label: 'API Docs', icon: Code },
  { id: 'tech-stack' as const, label: 'Tech Stack', icon: Layers },
  { id: 'env-config' as const, label: 'Env Config', icon: Settings },
];

export function SystemDesignTab({ projectId }: SystemDesignTabProps) {
  const [activeView, setActiveView] = useState<DesignView>('health');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) setIsFullscreen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  // Fullscreen mode
  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
          <div className="flex gap-1">
            {tabs.filter(t => ['architecture', 'database', 'frontend'].includes(t.id)).map((tab) => (
              <button
                key={tab.id}
                className={cn(
                  "px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2",
                  activeView === tab.id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
                )}
                onClick={() => setActiveView(tab.id)}
              >
                <tab.icon className="w-4 h-4" /> {tab.label}
              </button>
            ))}
          </div>
          <Button variant="ghost" size="sm" onClick={() => setIsFullscreen(false)} className="gap-2">
            <X className="w-4 h-4" /> Exit (ESC)
          </Button>
        </div>
        <div className="flex-1 p-4">
          {activeView === 'architecture' && <ArchitectureEditor projectId={projectId} isFullscreen onToggleFullscreen={() => setIsFullscreen(false)} />}
          {activeView === 'database' && <DatabaseEditor projectId={projectId} isFullscreen onToggleFullscreen={() => setIsFullscreen(false)} />}
          {activeView === 'frontend' && <FrontendEditor projectId={projectId} isFullscreen onToggleFullscreen={() => setIsFullscreen(false)} />}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-4 animate-fade-in">
      {/* Sidebar Navigation */}
      <div className={cn(
        "transition-all duration-200 flex-shrink-0",
        showSidebar ? "w-48" : "w-10"
      )}>
        <div className="sticky top-4">
          <div className="flex items-center justify-between mb-2">
            {showSidebar && <span className="text-xs font-medium text-muted-foreground">Sections</span>}
            <Button variant="ghost" size="icon" onClick={() => setShowSidebar(!showSidebar)} className="h-6 w-6">
              {showSidebar ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </Button>
          </div>
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all",
                  activeView === tab.id 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  !showSidebar && "justify-center px-2"
                )}
                onClick={() => setActiveView(tab.id)}
                title={tab.label}
              >
                <tab.icon className="w-4 h-4 flex-shrink-0" />
                {showSidebar && <span>{tab.label}</span>}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {/* Quick Tips for diagrams */}
        {['architecture', 'database', 'frontend'].includes(activeView) && (
          <div className="bg-muted/30 rounded-lg px-4 py-2 text-sm flex items-center gap-3 mb-4">
            <MousePointer2 className="w-4 h-4 text-primary flex-shrink-0" />
            <span className="text-muted-foreground text-xs">
              <strong>Double-click</strong> to edit • <strong>Drag handles</strong> to connect • Use toolbar for Templates, Export, History
            </span>
          </div>
        )}

        {/* Content */}
        {activeView === 'health' && <ProjectHealth projectId={projectId} />}
        {activeView === 'architecture' && <ArchitectureEditor projectId={projectId} isFullscreen={false} onToggleFullscreen={() => setIsFullscreen(true)} />}
        {activeView === 'database' && <DatabaseEditor projectId={projectId} isFullscreen={false} onToggleFullscreen={() => setIsFullscreen(true)} />}
        {activeView === 'frontend' && <FrontendEditor projectId={projectId} isFullscreen={false} onToggleFullscreen={() => setIsFullscreen(true)} />}
        {activeView === 'api-docs' && <ApiDocsTab projectId={projectId} />}
        {activeView === 'tech-stack' && <TechStackTab projectId={projectId} />}
        {activeView === 'env-config' && <EnvConfigTab projectId={projectId} />}
      </div>
    </div>
  );
}
