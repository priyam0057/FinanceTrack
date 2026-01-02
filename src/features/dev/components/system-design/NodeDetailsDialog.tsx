import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Monitor, 
  Server, 
  Database, 
  Cog, 
  Cloud,
  Shield,
  MessageSquare,
  Bell,
  Layers,
  HardDrive,
  Workflow,
  Container,
  Webhook,
  Table,
  Plus,
  X
} from 'lucide-react';
import type { CustomNodeType, CustomNodeData } from './CustomNodes';

const nodeIcons: Record<CustomNodeType, typeof Monitor> = {
  client: Monitor,
  server: Server,
  database: Database,
  service: Cog,
  external: Cloud,
  table: Table,
  auth: Shield,
  queue: MessageSquare,
  notification: Bell,
  cache: Layers,
  storage: HardDrive,
  worker: Workflow,
  container: Container,
  webhook: Webhook,
};

const nodeLabels: Record<CustomNodeType, string> = {
  client: 'Client/Browser',
  server: 'Server/API',
  database: 'Database',
  service: 'Service',
  external: 'External API',
  table: 'Database Table',
  auth: 'Auth/Security',
  queue: 'Message Queue',
  notification: 'Notifications',
  cache: 'Cache (Redis)',
  storage: 'File Storage',
  worker: 'Background Worker',
  container: 'Docker/Container',
  webhook: 'Webhook',
};

interface NodeDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  nodeData: CustomNodeData | null;
  nodeId: string;
  onSave: (nodeId: string, updates: Partial<CustomNodeData>) => void;
}

export function NodeDetailsDialog({ 
  open, 
  onClose, 
  nodeData, 
  nodeId,
  onSave 
}: NodeDetailsDialogProps) {
  const [label, setLabel] = useState(nodeData?.label || '');
  const [sublabel, setSublabel] = useState(nodeData?.sublabel || '');
  const [description, setDescription] = useState(nodeData?.description || '');
  const [notes, setNotes] = useState<string[]>(nodeData?.notes || []);
  const [newNote, setNewNote] = useState('');

  // Reset form when node changes
  useState(() => {
    if (nodeData) {
      setLabel(nodeData.label);
      setSublabel(nodeData.sublabel || '');
      setDescription(nodeData.description || '');
      setNotes(nodeData.notes || []);
    }
  });

  if (!nodeData) return null;

  const Icon = nodeIcons[nodeData.nodeType] || Cog;
  const typeLabel = nodeLabels[nodeData.nodeType] || nodeData.nodeType;

  const handleAddNote = () => {
    if (newNote.trim()) {
      setNotes([...notes, newNote.trim()]);
      setNewNote('');
    }
  };

  const handleRemoveNote = (index: number) => {
    setNotes(notes.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onSave(nodeId, {
      label,
      sublabel,
      description,
      notes,
      nodeType: nodeData.nodeType,
      fields: nodeData.fields,
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className="w-5 h-5" />
            Edit Node Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Node Type Badge */}
          <div>
            <Label className="text-xs text-muted-foreground">Node Type</Label>
            <Badge variant="secondary" className="mt-1">{typeLabel}</Badge>
          </div>

          {/* Label */}
          <div className="space-y-2">
            <Label htmlFor="label">Name</Label>
            <Input
              id="label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g., Web Browser, API Gateway"
            />
          </div>

          {/* Sublabel */}
          <div className="space-y-2">
            <Label htmlFor="sublabel">Subtitle</Label>
            <Input
              id="sublabel"
              value={sublabel}
              onChange={(e) => setSublabel(e.target.value)}
              placeholder="e.g., React Frontend, JWT Auth"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does this component do? Add technical details here..."
              rows={3}
            />
          </div>

          {/* Notes/Points */}
          <div className="space-y-2">
            <Label>Development Notes</Label>
            <div className="flex gap-2">
              <Input
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add a note..."
                onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
              />
              <Button type="button" size="icon" onClick={handleAddNote}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            
            {notes.length > 0 && (
              <div className="space-y-2 mt-2">
                {notes.map((note, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-start gap-2 bg-muted p-2 rounded text-sm"
                  >
                    <span className="text-muted-foreground">•</span>
                    <span className="flex-1">{note}</span>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      className="h-5 w-5"
                      onClick={() => handleRemoveNote(idx)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
