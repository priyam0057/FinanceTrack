import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { 
  Monitor, Server, Database, Cog, Cloud, Table, Shield, MessageSquare, Bell,
  Layers, HardDrive, Workflow, Container, Webhook, Info,
  FileCode, Component, Layout, GitBranch, Palette, Link2, FormInput, Square,
  type LucideIcon 
} from 'lucide-react';
import { cn } from '@/lib/utils';

import { CustomNodeData, CustomNodeType } from './types';
import { 
  SupabaseIcon, MongoDBIcon, StripeIcon, FirebaseIcon, 
  PostgresIcon, RedisIcon, AWSIcon, VercelIcon, GoogleIcon 
} from './BrandIcons';

const nodeIcons: Record<CustomNodeType, LucideIcon> = {
  // Backend
  client: Monitor, server: Server, database: Database, service: Cog,
  external: Cloud, auth: Shield, queue: MessageSquare, notification: Bell,
  cache: Layers, storage: HardDrive, worker: Workflow, container: Container, webhook: Webhook,
  // Services
  supabase: SupabaseIcon, mongodb: MongoDBIcon, stripe: StripeIcon, firebase: FirebaseIcon,
  postgres: PostgresIcon, redis: RedisIcon, aws: AWSIcon, vercel: VercelIcon, google: GoogleIcon,
  // Database
  table: Table,
  // Frontend
  page: FileCode, component: Component, layout: Layout, state: GitBranch,
  hook: Link2, apiClient: Cloud, form: FormInput, modal: Square,
  context: Layers, router: GitBranch, utility: Cog, style: Palette,
};

const nodeColors: Record<CustomNodeType, string> = {
  // Backend
  client: 'border-blue-400 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900',
  server: 'border-emerald-400 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900',
  database: 'border-violet-400 bg-gradient-to-br from-violet-50 to-violet-100 dark:from-violet-950 dark:to-violet-900',
  service: 'border-amber-400 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900',
  external: 'border-rose-400 bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-950 dark:to-rose-900',
  auth: 'border-indigo-400 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900',
  queue: 'border-orange-400 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900',
  notification: 'border-pink-400 bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-950 dark:to-pink-900',
  cache: 'border-cyan-400 bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-950 dark:to-cyan-900',
  storage: 'border-slate-400 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900',
  worker: 'border-teal-400 bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-950 dark:to-teal-900',
  container: 'border-sky-400 bg-gradient-to-br from-sky-50 to-sky-100 dark:from-sky-950 dark:to-sky-900',
  webhook: 'border-lime-400 bg-gradient-to-br from-lime-50 to-lime-100 dark:from-lime-950 dark:to-lime-900',
  // Services
  supabase: 'border-emerald-500 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900',
  mongodb: 'border-green-500 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900',
  stripe: 'border-indigo-500 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900',
  firebase: 'border-orange-500 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900',
  postgres: 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900',
  redis: 'border-red-500 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900',
  aws: 'border-orange-400 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900',
  vercel: 'border-slate-800 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900',
  google: 'border-blue-400 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900',
  // Database
  table: 'border-violet-400',
  // Frontend
  page: 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-900',
  component: 'border-purple-400 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900',
  layout: 'border-green-400 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900',
  state: 'border-yellow-400 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900',
  hook: 'border-cyan-400 bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-950 dark:to-cyan-900',
  apiClient: 'border-red-400 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900',
  form: 'border-emerald-400 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900',
  modal: 'border-fuchsia-400 bg-gradient-to-br from-fuchsia-50 to-fuchsia-100 dark:from-fuchsia-950 dark:to-fuchsia-900',
  context: 'border-orange-400 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900',
  router: 'border-teal-400 bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-950 dark:to-teal-900',
  utility: 'border-gray-400 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900',
  style: 'border-pink-400 bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-950 dark:to-pink-900',
};

const iconColors: Record<CustomNodeType, string> = {
  client: 'text-blue-500', server: 'text-emerald-500', database: 'text-violet-500',
  service: 'text-amber-500', external: 'text-rose-500', auth: 'text-indigo-500',
  queue: 'text-orange-500', notification: 'text-pink-500', cache: 'text-cyan-500',
  storage: 'text-slate-500', worker: 'text-teal-500', container: 'text-sky-500', webhook: 'text-lime-500',
  supabase: 'text-emerald-600', mongodb: 'text-green-600', stripe: 'text-indigo-600', firebase: 'text-orange-600',
  postgres: 'text-blue-600', redis: 'text-red-600', aws: 'text-orange-600', vercel: 'text-foreground', google: 'text-blue-600',
  table: 'text-violet-500',
  page: 'text-blue-500', component: 'text-purple-500', layout: 'text-green-500',
  state: 'text-yellow-600', hook: 'text-cyan-500', apiClient: 'text-red-500',
  form: 'text-emerald-500', modal: 'text-fuchsia-500', context: 'text-orange-500',
  router: 'text-teal-500', utility: 'text-gray-500', style: 'text-pink-500',
};

const handleStyle = { 
  width: 14, 
  height: 14, 
  border: '3px solid #fff', 
  background: '#8b5cf6',
  cursor: 'crosshair',
};

function ArchitectureNode({ data, selected }: NodeProps) {
  const nodeData = data as unknown as CustomNodeData;
  const Icon = nodeIcons[nodeData.nodeType] || Cog;
  const hasDetails = nodeData.description || (nodeData.notes && nodeData.notes.length > 0);
  
  return (
    <div className={cn(
      'px-4 py-3 rounded-xl border-2 shadow-lg transition-all min-w-[140px] cursor-grab active:cursor-grabbing relative',
      nodeColors[nodeData.nodeType], selected && 'ring-2 ring-primary ring-offset-2'
    )}>
      <Handle type="target" position={Position.Top} id="top" style={{ ...handleStyle, top: -6 }} isConnectable={true} />
      {hasDetails && (
        <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full p-1">
          <Info className="w-3 h-3" />
        </div>
      )}
      <div className="flex flex-col items-center gap-1">
        <Icon className={cn('w-8 h-8', iconColors[nodeData.nodeType])} />
        <span className="text-sm font-semibold text-foreground text-center">{nodeData.label}</span>
        {nodeData.sublabel && <span className="text-xs text-muted-foreground text-center">{nodeData.sublabel}</span>}
      </div>
      <Handle type="source" position={Position.Bottom} id="bottom" style={{ ...handleStyle, bottom: -6 }} isConnectable={true} />
      <Handle type="source" position={Position.Right} id="right" style={{ ...handleStyle, right: -6 }} isConnectable={true} />
      <Handle type="target" position={Position.Left} id="left" style={{ ...handleStyle, left: -6 }} isConnectable={true} />
    </div>
  );
}

function TableNode({ data, selected }: NodeProps) {
  const nodeData = data as unknown as CustomNodeData;
  const hasDetails = nodeData.description || (nodeData.notes && nodeData.notes.length > 0);
  
  return (
    <div className={cn(
      'rounded-lg border-2 shadow-lg transition-all min-w-[180px] overflow-hidden bg-card cursor-grab active:cursor-grabbing relative',
      'border-violet-400', selected && 'ring-2 ring-primary ring-offset-2'
    )}>
      <Handle type="target" position={Position.Top} id="top" style={{ ...handleStyle, top: -6, background: '#8b5cf6' }} isConnectable={true} />
      {hasDetails && (
        <div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-1 z-10">
          <Info className="w-3 h-3" />
        </div>
      )}
      <div className="px-3 py-2 bg-gradient-to-r from-violet-100 to-violet-50 dark:from-violet-900 dark:to-violet-800 border-b border-violet-200 dark:border-violet-700 flex items-center gap-2">
        <Database className="w-4 h-4 text-violet-500" />
        <span className="text-sm font-bold text-foreground">{nodeData.label}</span>
      </div>
      {nodeData.fields && nodeData.fields.length > 0 && (
        <div className="p-2 space-y-1">
          {nodeData.fields.map((field, idx) => (
            <div key={idx} className="flex items-center gap-2 text-xs px-1">
              <span className={cn('w-4 text-center', field.isPK && 'text-yellow-500 font-bold', field.isFK && 'text-blue-500')}>
                {field.isPK ? '🔑' : field.isFK ? '🔗' : ''}
              </span>
              <span className="font-mono text-foreground">{field.name}</span>
              <span className="ml-auto text-muted-foreground">{field.type}</span>
            </div>
          ))}
        </div>
      )}
      <Handle type="source" position={Position.Bottom} id="bottom" style={{ ...handleStyle, bottom: -6, background: '#8b5cf6' }} isConnectable={true} />
      <Handle type="source" position={Position.Right} id="right" style={{ ...handleStyle, right: -6, background: '#3b82f6' }} isConnectable={true} />
      <Handle type="target" position={Position.Left} id="left" style={{ ...handleStyle, left: -6, background: '#3b82f6' }} isConnectable={true} />
    </div>
  );
}

function FrontendNode({ data, selected }: NodeProps) {
  const nodeData = data as unknown as CustomNodeData;
  const Icon = nodeIcons[nodeData.nodeType] || Component;
  const hasDetails = nodeData.description || (nodeData.notes && nodeData.notes.length > 0);
  
  return (
    <div className={cn(
      'px-4 py-3 rounded-xl border-2 shadow-lg transition-all min-w-[140px] cursor-grab active:cursor-grabbing relative',
      nodeColors[nodeData.nodeType] || 'border-purple-400 bg-gradient-to-br from-purple-50 to-purple-100',
      selected && 'ring-2 ring-primary ring-offset-2'
    )}>
      <Handle type="target" position={Position.Top} id="top" style={{ ...handleStyle, top: -6, background: '#a855f7' }} isConnectable={true} />
      {hasDetails && (
        <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full p-1">
          <Info className="w-3 h-3" />
        </div>
      )}
      <div className="flex flex-col items-center gap-1">
        <Icon className={cn('w-8 h-8', iconColors[nodeData.nodeType] || 'text-purple-500')} />
        <span className="text-sm font-semibold text-foreground text-center">{nodeData.label}</span>
        {nodeData.sublabel && <span className="text-xs text-muted-foreground text-center">{nodeData.sublabel}</span>}
      </div>
      <Handle type="source" position={Position.Bottom} id="bottom" style={{ ...handleStyle, bottom: -6, background: '#a855f7' }} isConnectable={true} />
      <Handle type="source" position={Position.Right} id="right" style={{ ...handleStyle, right: -6, background: '#a855f7' }} isConnectable={true} />
      <Handle type="target" position={Position.Left} id="left" style={{ ...handleStyle, left: -6, background: '#a855f7' }} isConnectable={true} />
    </div>
  );
}

export const customNodeTypes = {
  architecture: memo(ArchitectureNode),
  table: memo(TableNode),
  frontend: memo(FrontendNode),
};


