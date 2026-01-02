import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, FolderKanban, Settings, Terminal, Calendar, Lightbulb, Monitor,
  Sun, Moon, FileText, PanelLeftClose, PanelLeft, Zap, ZapOff, ChevronLeft, ChevronRight, Star
} from 'lucide-react';
import { useTheme } from '@/components/theme-provider';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useStore } from '@/features/dev/lib/store';
import { useState } from 'react';

const navigation = [
  { name: 'Dashboard', href: '/dev', icon: LayoutDashboard },
  { name: 'Projects', href: '/dev/projects', icon: FolderKanban },
  { name: 'Tasks', href: '/dev/tasks', icon: FileText },
  { name: 'Daily Board', href: '/dev/daily', icon: Calendar },
  { name: 'Scratchpad', href: '/dev/ideas', icon: Lightbulb },
  { name: 'Focus Mode', href: '/dev/focus', icon: Monitor },
  { name: 'Settings', href: '/dev/settings', icon: Settings },
];

interface SidebarProps {
  isVisible: boolean;
  autoHide: boolean;
  onToggle: () => void;
  onAutoHideChange: (value: boolean) => void;
}

export function Sidebar({ isVisible, autoHide, onToggle, onAutoHideChange }: SidebarProps) {
  const location = useLocation();
  const { theme } = useTheme(); // Keeping theme for icon calculation if needed, but removing toggle
  const { projects } = useStore();
  const importantProjects = projects.filter(p => p.isFavorite);
  const [isProjectsOpen, setIsProjectsOpen] = useState(false);

  return (
    <>
      {/* Collapsed sidebar toggle (shown when hidden) */}
      {!isVisible && (
        <div className="w-12 border-r border-sidebar-border bg-sidebar flex flex-col items-center py-4 gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={onToggle} className="h-9 w-9">
                <PanelLeft className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Show Sidebar</TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant={autoHide ? "secondary" : "ghost"} 
                size="icon" 
                onClick={() => onAutoHideChange(!autoHide)}
                className="h-9 w-9"
              >
                {autoHide ? <Zap className="h-4 w-4 text-yellow-500" /> : <ZapOff className="h-4 w-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              {autoHide ? 'Auto-hide ON' : 'Auto-hide OFF'}
            </TooltipContent>
          </Tooltip>
        </div>
      )}

      {/* Full sidebar */}
      <aside className={cn(
        "border-r border-sidebar-border bg-sidebar flex-shrink-0 flex flex-col transition-all duration-200",
        isVisible ? "w-52" : "w-0 overflow-hidden"
      )}>
        <div className="flex h-full w-52 flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <Terminal className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-mono text-xl font-bold text-foreground">Dev</span>
            </div>
            <Button variant="ghost" size="icon" onClick={onToggle} className="h-8 w-8">
              <PanelLeftClose className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href ||
                (item.href !== '/dev' && location.pathname.startsWith(item.href) && item.href !== '/dev/projects');

              if (item.name === 'Projects') {
                return (
                  <Collapsible
                    key={item.name}
                    open={isProjectsOpen}
                    onOpenChange={setIsProjectsOpen}
                    className="space-y-1"
                  >
                    <div className="flex items-center gap-1">
                       <Link
                        to={item.href}
                        className={cn(
                          'flex-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                          isActive
                            ? 'bg-sidebar-accent text-primary'
                            : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                        )}
                      >
                        <item.icon className={cn('h-5 w-5', isActive && 'text-primary')} />
                        {item.name}
                      </Link>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <ChevronRight className={cn("h-4 w-4 transition-transform", isProjectsOpen && "rotate-90")} />
                        </Button>
                      </CollapsibleTrigger>
                    </div>
                   
                    <CollapsibleContent className="pl-4 space-y-1">
                      {importantProjects.length > 0 && (
                        <>
                          <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">Important</div>
                          {importantProjects.map(project => (
                            <Link
                              key={project.id}
                              to={`/dev/projects/${project.id}`}
                              className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                            >
                              <Star className="h-3 w-3 text-warning fill-warning" />
                              <span className="truncate">{project.name}</span>
                            </Link>
                          ))}
                        </>
                      )}
                    </CollapsibleContent>
                  </Collapsible>
                );
              }

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-sidebar-accent text-primary'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  )}
                >
                  <item.icon className={cn('h-5 w-5', isActive && 'text-primary')} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="border-t border-sidebar-border p-4 space-y-3">
            {/* Auto-hide toggle */}
            <div className="flex items-center justify-between px-2">
              <span className="text-xs font-medium text-muted-foreground">Auto-hide</span>
              <Button
                variant={autoHide ? "secondary" : "ghost"}
                size="sm"
                className="h-7 text-xs gap-1"
                onClick={() => onAutoHideChange(!autoHide)}
              >
                {autoHide ? <Zap className="h-3 w-3 text-yellow-500" /> : <ZapOff className="h-3 w-3" />}
                {autoHide ? 'ON' : 'OFF'}
              </Button>
            </div>

            <div className="rounded-lg bg-sidebar-accent p-3">
              <p className="font-mono text-sm text-foreground text-center font-bold">v2.0.0</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
