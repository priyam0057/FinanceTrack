import { cn } from '@/lib/utils';
import { 
  Monitor, 
  Server, 
  Database, 
  Cog, 
  Cloud,
  type LucideIcon 
} from 'lucide-react';

export type NodeType = 'client' | 'server' | 'database' | 'service' | 'external';

interface DiagramNodeProps {
  type: NodeType;
  label: string;
  sublabel?: string;
  className?: string;
}

const nodeIcons: Record<NodeType, LucideIcon> = {
  client: Monitor,
  server: Server,
  database: Database,
  service: Cog,
  external: Cloud,
};

export function DiagramNode({ type, label, sublabel, className }: DiagramNodeProps) {
  const Icon = nodeIcons[type];
  
  return (
    <div className={cn('diagram-node', `node-${type}`, className)}>
      <Icon className="diagram-node-icon" />
      <span className="diagram-node-label">{label}</span>
      {sublabel && <span className="diagram-node-sublabel">{sublabel}</span>}
    </div>
  );
}
