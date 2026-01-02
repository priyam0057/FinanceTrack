import { 
  Plus, ZoomIn, ZoomOut, Maximize2, Save, RotateCcw, Trash2,
  Monitor, Server, Database, Cog, Cloud, Shield, MessageSquare, Bell, Layers, HardDrive, Workflow, Container, Webhook, Table,
  FileCode, Component, Layout, GitBranch, Link2, FormInput, Square, Palette,
  RefreshCw, Fullscreen
} from 'lucide-react';
import { 
  SupabaseIcon, MongoDBIcon, StripeIcon, FirebaseIcon, 
  PostgresIcon, RedisIcon, AWSIcon, VercelIcon, GoogleIcon 
} from './BrandIcons';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { cn } from '@/lib/utils';
import type { CustomNodeType } from './types';

interface DiagramToolbarProps {
  onAddNode: (type: CustomNodeType) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
  onSave: () => void;
  onReset: () => void;
  onDeleteSelected: () => void;
  onToggleFullscreen?: () => void;
  hasSelection?: boolean;
  autoSave?: boolean;
  onAutoSaveChange?: (enabled: boolean) => void;
  isFullscreen?: boolean;
  mode: 'architecture' | 'database' | 'frontend';
}

const backendNodes = [
  { type: 'client' as CustomNodeType, label: 'Client/Browser', icon: Monitor, color: 'text-blue-500' },
  { type: 'server' as CustomNodeType, label: 'Server/API', icon: Server, color: 'text-emerald-500' },
  { type: 'database' as CustomNodeType, label: 'Database', icon: Database, color: 'text-violet-500' },
  { type: 'service' as CustomNodeType, label: 'Service', icon: Cog, color: 'text-amber-500' },
  { type: 'external' as CustomNodeType, label: 'External API', icon: Cloud, color: 'text-rose-500' },
  { type: 'auth' as CustomNodeType, label: 'Auth/Security', icon: Shield, color: 'text-indigo-500' },
  { type: 'queue' as CustomNodeType, label: 'Message Queue', icon: MessageSquare, color: 'text-orange-500' },
  { type: 'notification' as CustomNodeType, label: 'Notifications', icon: Bell, color: 'text-pink-500' },
  { type: 'cache' as CustomNodeType, label: 'Cache (Redis)', icon: Layers, color: 'text-cyan-500' },
  { type: 'storage' as CustomNodeType, label: 'File Storage', icon: HardDrive, color: 'text-slate-500' },
  { type: 'worker' as CustomNodeType, label: 'Background Worker', icon: Workflow, color: 'text-teal-500' },
  { type: 'container' as CustomNodeType, label: 'Docker/Container', icon: Container, color: 'text-sky-500' },
  { type: 'webhook' as CustomNodeType, label: 'Webhook', icon: Webhook, color: 'text-lime-500' },
  // Services
  { type: 'supabase' as CustomNodeType, label: 'Supabase', icon: SupabaseIcon, color: 'text-emerald-500' },
  { type: 'mongodb' as CustomNodeType, label: 'MongoDB', icon: MongoDBIcon, color: 'text-green-500' },
  { type: 'postgres' as CustomNodeType, label: 'PostgreSQL', icon: PostgresIcon, color: 'text-blue-500' },
  { type: 'redis' as CustomNodeType, label: 'Redis', icon: RedisIcon, color: 'text-red-500' },
  { type: 'stripe' as CustomNodeType, label: 'Stripe', icon: StripeIcon, color: 'text-indigo-500' },
  { type: 'firebase' as CustomNodeType, label: 'Firebase', icon: FirebaseIcon, color: 'text-orange-500' },
  { type: 'aws' as CustomNodeType, label: 'AWS', icon: AWSIcon, color: 'text-orange-500' },
  { type: 'vercel' as CustomNodeType, label: 'Vercel', icon: VercelIcon, color: 'text-foreground' },
  { type: 'google' as CustomNodeType, label: 'Google Cloud', icon: GoogleIcon, color: 'text-blue-500' },
];

const databaseNodes = [
  { type: 'table' as CustomNodeType, label: 'Table', icon: Table, color: 'text-violet-500' },
];

const frontendNodes = [
  { type: 'page' as CustomNodeType, label: 'Page/View', icon: FileCode, color: 'text-blue-500' },
  { type: 'component' as CustomNodeType, label: 'Component', icon: Component, color: 'text-purple-500' },
  { type: 'layout' as CustomNodeType, label: 'Layout', icon: Layout, color: 'text-green-500' },
  { type: 'state' as CustomNodeType, label: 'State (Zustand/Redux)', icon: GitBranch, color: 'text-yellow-600' },
  { type: 'hook' as CustomNodeType, label: 'Custom Hook', icon: Link2, color: 'text-cyan-500' },
  { type: 'apiClient' as CustomNodeType, label: 'API Client', icon: Cloud, color: 'text-red-500' },
  { type: 'form' as CustomNodeType, label: 'Form', icon: FormInput, color: 'text-emerald-500' },
  { type: 'modal' as CustomNodeType, label: 'Modal/Dialog', icon: Square, color: 'text-fuchsia-500' },
  { type: 'context' as CustomNodeType, label: 'Context Provider', icon: Layers, color: 'text-orange-500' },
  { type: 'router' as CustomNodeType, label: 'Router', icon: GitBranch, color: 'text-teal-500' },
  { type: 'utility' as CustomNodeType, label: 'Utility', icon: Cog, color: 'text-gray-500' },
  { type: 'style' as CustomNodeType, label: 'Styles (CSS)', icon: Palette, color: 'text-pink-500' },
];

export function DiagramToolbar({
  onAddNode, onZoomIn, onZoomOut, onFitView, onSave, onReset, onDeleteSelected,
  onToggleFullscreen, hasSelection, autoSave, onAutoSaveChange, isFullscreen, mode
}: DiagramToolbarProps) {
  const nodeOptions = mode === 'architecture' ? backendNodes : mode === 'database' ? databaseNodes : frontendNodes;

  return (
    <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-background/95 backdrop-blur-sm border border-border rounded-lg p-2 shadow-lg">
      {/* Add Node */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="default" size="sm" className="gap-2">
            <Plus className="w-4 h-4" /> Add Node
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="max-h-[400px] overflow-y-auto">
          {mode === 'architecture' && (
            <>
              <DropdownMenuLabel className="text-xs">Core</DropdownMenuLabel>
              {nodeOptions.slice(0, 5).map((n) => (
                <DropdownMenuItem key={n.type} onClick={() => onAddNode(n.type)} className="gap-2 cursor-pointer">
                  <n.icon className={cn('w-4 h-4', n.color)} /> {n.label}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs">Developer Tools</DropdownMenuLabel>
              {nodeOptions.slice(5).map((n) => (
                <DropdownMenuItem key={n.type} onClick={() => onAddNode(n.type)} className="gap-2 cursor-pointer">
                  <n.icon className={cn('w-4 h-4', n.color)} /> {n.label}
                </DropdownMenuItem>
              ))}
            </>
          )}
          {mode === 'database' && nodeOptions.map((n) => (
            <DropdownMenuItem key={n.type} onClick={() => onAddNode(n.type)} className="gap-2 cursor-pointer">
              <n.icon className={cn('w-4 h-4', n.color)} /> {n.label}
            </DropdownMenuItem>
          ))}
          {mode === 'frontend' && (
            <>
              <DropdownMenuLabel className="text-xs">Core UI</DropdownMenuLabel>
              {nodeOptions.slice(0, 4).map((n) => (
                <DropdownMenuItem key={n.type} onClick={() => onAddNode(n.type)} className="gap-2 cursor-pointer">
                  <n.icon className={cn('w-4 h-4', n.color)} /> {n.label}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs">Logic & Data</DropdownMenuLabel>
              {nodeOptions.slice(4, 8).map((n) => (
                <DropdownMenuItem key={n.type} onClick={() => onAddNode(n.type)} className="gap-2 cursor-pointer">
                  <n.icon className={cn('w-4 h-4', n.color)} /> {n.label}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs">Utilities</DropdownMenuLabel>
              {nodeOptions.slice(8).map((n) => (
                <DropdownMenuItem key={n.type} onClick={() => onAddNode(n.type)} className="gap-2 cursor-pointer">
                  <n.icon className={cn('w-4 h-4', n.color)} /> {n.label}
                </DropdownMenuItem>
              ))}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="w-px h-6 bg-border" />

      {/* Zoom */}
      <Button variant="ghost" size="icon" onClick={onZoomIn} title="Zoom In"><ZoomIn className="w-4 h-4" /></Button>
      <Button variant="ghost" size="icon" onClick={onZoomOut} title="Zoom Out"><ZoomOut className="w-4 h-4" /></Button>
      <Button variant="ghost" size="icon" onClick={onFitView} title="Fit View"><Maximize2 className="w-4 h-4" /></Button>

      <div className="w-px h-6 bg-border" />

      {/* Delete */}
      {hasSelection && (
        <Button variant="ghost" size="icon" onClick={onDeleteSelected} title="Delete Selected" className="text-destructive hover:text-destructive">
          <Trash2 className="w-4 h-4" />
        </Button>
      )}

      {/* Save & Reset */}
      <Button variant="ghost" size="icon" onClick={onSave} title="Save Diagram"><Save className="w-4 h-4" /></Button>
      <Button variant="ghost" size="icon" onClick={onReset} title="Reset"><RotateCcw className="w-4 h-4" /></Button>

      <div className="w-px h-6 bg-border" />

      {/* Auto-save */}
      {onAutoSaveChange && (
        <div className="flex items-center gap-2 px-2">
          <Switch id="autosave" checked={autoSave} onCheckedChange={onAutoSaveChange} className="scale-75" />
          <Label htmlFor="autosave" className="text-xs cursor-pointer flex items-center gap-1">
            <RefreshCw className={cn("w-3 h-3", autoSave && "text-green-500")} />
            Auto
          </Label>
        </div>
      )}

      {/* Fullscreen */}
      {onToggleFullscreen && (
        <Button variant={isFullscreen ? "secondary" : "ghost"} size="icon" onClick={onToggleFullscreen} title="Fullscreen">
          <Fullscreen className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}
