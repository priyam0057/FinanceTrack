import { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2, Key, Link } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Monitor, Server, Database, Cog, Cloud, Shield, MessageSquare, Bell,
  Layers, HardDrive, Workflow, Container, Webhook, Table,
  Layout, Component, FileCode, GitBranch, Palette, Link2, FormInput, Square
} from 'lucide-react';
import type { CustomNodeType, CustomNodeData } from './CustomNodes';
import { cn } from '@/lib/utils';

interface TableField {
  name: string;
  type: string;
  isPK?: boolean;
  isFK?: boolean;
}

const nodeIcons: Record<string, typeof Monitor> = {
  client: Monitor, server: Server, database: Database, service: Cog,
  external: Cloud, table: Table, auth: Shield, queue: MessageSquare,
  notification: Bell, cache: Layers, storage: HardDrive, worker: Workflow,
  container: Container, webhook: Webhook,
  page: FileCode, component: Component, layout: Layout, state: GitBranch,
  hook: Link2, apiClient: Cloud, form: FormInput, modal: Square,
  context: Layers, router: GitBranch, utility: Cog, style: Palette,
};

const nodeLabels: Record<string, string> = {
  client: 'Client/Browser', server: 'Server/API', database: 'Database',
  service: 'Service', external: 'External API', table: 'Database Table',
  auth: 'Auth/Security', queue: 'Message Queue', notification: 'Notifications',
  cache: 'Cache (Redis)', storage: 'File Storage', worker: 'Background Worker',
  container: 'Docker/Container', webhook: 'Webhook',
  page: 'Page/View', component: 'Component', layout: 'Layout',
  state: 'State Management', hook: 'Custom Hook', apiClient: 'API Client',
  form: 'Form', modal: 'Modal/Dialog', context: 'Context Provider',
  router: 'Router', utility: 'Utility', style: 'Styles',
};

interface NodeDetailsSidebarProps {
  open: boolean;
  onClose: () => void;
  nodeData: CustomNodeData | null;
  nodeId: string;
  onSave: (nodeId: string, updates: Partial<CustomNodeData>) => void;
}

export function NodeDetailsSidebar({ open, onClose, nodeData, nodeId, onSave }: NodeDetailsSidebarProps) {
  const [label, setLabel] = useState('');
  const [sublabel, setSublabel] = useState('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState<string[]>([]);
  const [newNote, setNewNote] = useState('');
  const [fields, setFields] = useState<TableField[]>([]);

  useEffect(() => {
    if (nodeData) {
      setLabel(nodeData.label || '');
      setSublabel(nodeData.sublabel || '');
      setDescription(nodeData.description || '');
      setNotes(nodeData.notes || []);
      setFields(nodeData.fields || []);
    }
  }, [nodeData, nodeId]);

  if (!open || !nodeData) return null;

  const Icon = nodeIcons[nodeData.nodeType] || Cog;
  const typeLabel = nodeLabels[nodeData.nodeType] || nodeData.nodeType;
  const isTableNode = nodeData.nodeType === 'table';

  const handleAddNote = () => {
    if (newNote.trim()) {
      const updatedNotes = [...notes, newNote.trim()];
      setNotes(updatedNotes);
      setNewNote('');
    }
  };

  const handleRemoveNote = (index: number) => {
    setNotes(notes.filter((_, i) => i !== index));
  };

  // Table field editing
  const handleAddField = () => {
    setFields([...fields, { name: 'new_field', type: 'text', isPK: false, isFK: false }]);
  };

  const handleUpdateField = (index: number, updates: Partial<TableField>) => {
    const updated = [...fields];
    updated[index] = { ...updated[index], ...updates };
    setFields(updated);
  };

  const handleDeleteField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onSave(nodeId, {
      ...nodeData,
      label,
      sublabel,
      description,
      notes,
      fields: isTableNode ? fields : nodeData.fields,
    });
    onClose();
  };

  return (
    <div className={cn(
      "absolute right-0 top-0 h-full w-[380px] bg-background border-l border-border shadow-xl z-20",
      "transition-transform duration-200",
      open ? "translate-x-0" : "translate-x-full"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border bg-muted/50">
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5 text-primary" />
          <span className="font-semibold text-sm">Edit Node</span>
          <Badge variant="outline" className="text-xs">{typeLabel}</Badge>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
          <X className="w-4 h-4" />
        </Button>
      </div>

      <ScrollArea className="h-[calc(100%-120px)]">
        <div className="p-4 space-y-4">
          {/* Name & Subtitle */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Name</Label>
              <Input value={label} onChange={(e) => setLabel(e.target.value)} className="h-8 text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Subtitle</Label>
              <Input value={sublabel} onChange={(e) => setSublabel(e.target.value)} className="h-8 text-sm" />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <Label className="text-xs">Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="text-sm resize-none" />
          </div>

          {/* TABLE FIELDS - EDITABLE */}
          {isTableNode && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">Table Fields</Label>
                <Button size="sm" variant="outline" onClick={handleAddField} className="h-7 text-xs gap-1">
                  <Plus className="w-3 h-3" /> Add Field
                </Button>
              </div>
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {fields.map((field, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg group">
                    {/* PK/FK Toggles */}
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => handleUpdateField(idx, { isPK: !field.isPK, isFK: false })}
                        className={cn("p-1 rounded", field.isPK ? "bg-yellow-500 text-white" : "bg-muted hover:bg-muted-foreground/20")}
                        title="Primary Key"
                      >
                        <Key className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleUpdateField(idx, { isFK: !field.isFK, isPK: false })}
                        className={cn("p-1 rounded", field.isFK ? "bg-blue-500 text-white" : "bg-muted hover:bg-muted-foreground/20")}
                        title="Foreign Key"
                      >
                        <Link className="w-3 h-3" />
                      </button>
                    </div>
                    {/* Field Name */}
                    <Input
                      value={field.name}
                      onChange={(e) => handleUpdateField(idx, { name: e.target.value })}
                      className="h-7 text-xs font-mono flex-1"
                      placeholder="field_name"
                    />
                    {/* Field Type */}
                    <select
                      value={field.type}
                      onChange={(e) => handleUpdateField(idx, { type: e.target.value })}
                      className="h-7 text-xs bg-background border border-input rounded px-2"
                    >
                      <option value="uuid">uuid</option>
                      <option value="text">text</option>
                      <option value="integer">integer</option>
                      <option value="boolean">boolean</option>
                      <option value="timestamp">timestamp</option>
                      <option value="date">date</option>
                      <option value="jsonb">jsonb</option>
                      <option value="enum">enum</option>
                      <option value="float">float</option>
                      <option value="array">array</option>
                    </select>
                    {/* Delete */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteField(idx)}
                      className="h-7 w-7 opacity-0 group-hover:opacity-100 text-destructive"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
                {fields.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-4">No fields. Click "Add Field" to create.</p>
                )}
              </div>
            </div>
          )}

          {/* Dev Notes */}
          <div className="space-y-2">
            <Label className="text-xs">Development Notes</Label>
            <div className="flex gap-2">
              <Input value={newNote} onChange={(e) => setNewNote(e.target.value)} className="h-8 text-sm" placeholder="Add note..."
                onKeyDown={(e) => e.key === 'Enter' && handleAddNote()} />
              <Button size="sm" onClick={handleAddNote} className="h-8 px-3">Add</Button>
            </div>
            {notes.length > 0 && (
              <div className="space-y-1">
                {notes.map((note, idx) => (
                  <div key={idx} className="flex items-start gap-2 bg-muted/30 p-2 rounded text-xs group">
                    <span className="text-primary">•</span>
                    <span className="flex-1">{note}</span>
                    <button className="opacity-0 group-hover:opacity-100 text-destructive" onClick={() => handleRemoveNote(idx)}>
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-border bg-background">
        <Button onClick={handleSave} className="w-full gap-2">
          <Save className="w-4 h-4" /> Save Changes
        </Button>
      </div>
    </div>
  );
}
