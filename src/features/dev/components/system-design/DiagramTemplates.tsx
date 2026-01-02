import { useState, useCallback, useEffect } from 'react';
import { Save, Folder, Trash2, FileCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import type { Node, Edge } from '@xyflow/react';
import { useSystemDesign } from '../../hooks/useSystemDesign';

interface DiagramTemplate {
  id: string;
  name: string;
  type: 'architecture' | 'database' | 'frontend';
  createdAt?: string;
  created_at?: string; // DB field
  nodes: Node[];
  edges: Edge[];
}

interface DiagramTemplatesProps {
  nodes: Node[];
  edges: Edge[];
  diagramType: 'architecture' | 'database' | 'frontend';
  onLoadTemplate: (nodes: Node[], edges: Edge[]) => void;
}

export function DiagramTemplates({ nodes, edges, diagramType, onLoadTemplate }: DiagramTemplatesProps) {
  const [open, setOpen] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);
  const [templateName, setTemplateName] = useState('');
  
  const { loadTemplates, saveTemplate, deleteTemplate } = useSystemDesign('global');

  // Replace getTemplates with async loading
  const [templates, setTemplates] = useState<DiagramTemplate[]>([]);

  useEffect(() => {
    if (open) {
      loadTemplates(diagramType).then((data) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setTemplates(data as any[]);
      });
    }
  }, [diagramType, loadTemplates, open]);

  const handleSaveTemplate = async () => {
    if (!templateName.trim()) {
      toast.error('Enter a template name');
      return;
    }
    
    const result = await saveTemplate(templateName.trim(), diagramType, nodes, edges);
    if (result) {
      toast.success('Template saved!');
      setTemplateName('');
      setSaveOpen(false);
      // Reload templates if the dialog is open or will be opened
      if (open) {
        loadTemplates(diagramType).then((data) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setTemplates(data as any[]);
        });
      }
    }
  };

  const handleLoadTemplate = (template: DiagramTemplate) => {
    onLoadTemplate(template.nodes, template.edges);
    setOpen(false);
    toast.success(`Loaded "${template.name}"`);
  };

  const handleDeleteTemplate = async (id: string) => {
    const success = await deleteTemplate(id);
    if (success) {
      toast.success('Template deleted');
      setTemplates(prev => prev.filter(t => t.id !== id));
    }
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)} className="gap-2">
        <Folder className="w-4 h-4" /> Templates
      </Button>

      {/* Templates Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Diagram Templates</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <Button onClick={() => { setOpen(false); setSaveOpen(true); }} className="w-full gap-2">
              <Save className="w-4 h-4" /> Save Current as Template
            </Button>

            {templates.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No templates for {diagramType} diagrams yet.
              </p>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {templates.map((template) => (
                  <Card key={template.id} className="group">
                    <CardContent className="p-3 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{template.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {template.nodes.length} nodes, {template.edges.length} edges
                        </p>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="sm" variant="outline" onClick={() => handleLoadTemplate(template)}>
                          Load
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDeleteTemplate(template.id)} className="text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Save Template Dialog */}
      <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Save as Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Template Name</Label>
              <Input value={templateName} onChange={(e) => setTemplateName(e.target.value)} placeholder="My REST API Template" />
            </div>
            <p className="text-sm text-muted-foreground">
              This will save {nodes.length} nodes and {edges.length} edges.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveTemplate}>Save Template</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
