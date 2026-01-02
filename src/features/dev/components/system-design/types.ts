export type CustomNodeType = 
  // Backend
  | 'client' | 'server' | 'database' | 'service' | 'external' 
  | 'auth' | 'queue' | 'notification' | 'cache' | 'storage' | 'worker' | 'container' | 'webhook'
  // Services
  | 'supabase' | 'mongodb' | 'stripe' | 'firebase' | 'postgres' | 'redis' | 'aws' | 'vercel' | 'google'
  // Database
  | 'table'
  // Frontend
  | 'page' | 'component' | 'layout' | 'state' | 'hook' | 'apiClient' | 'form' | 'modal' | 'context' | 'router' | 'utility' | 'style';

export interface CustomNodeData {
  label: string;
  sublabel?: string;
  nodeType: CustomNodeType;
  description?: string;
  notes?: string[];
  fields?: { name: string; type: string; isPK?: boolean; isFK?: boolean }[];
  [key: string]: unknown;
}
