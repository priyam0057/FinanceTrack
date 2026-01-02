import { useState, useEffect } from 'react';
import { History, RotateCcw, Trash2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import type { Node, Edge } from '@xyflow/react';
import { formatDistanceToNow } from 'date-fns';

interface VersionEntry {
  id: string;
  timestamp: string;
  nodes: Node[];
  edges: Edge[];
  nodeCount: number;
  edgeCount: number;
}

interface VersionHistoryProps {
  nodes: Node[];
  edges: Edge[];
  projectId: string;
  diagramType: 'architecture' | 'database' | 'frontend';
  onRestore: (nodes: Node[], edges: Edge[]) => void;
}

const MAX_VERSIONS = 10;

export function VersionHistory({ nodes, edges, projectId, diagramType, onRestore }: VersionHistoryProps) {
  const [open, setOpen] = useState(false);
  const storageKey = `version-history-${diagramType}-${projectId}`;
  
  const [versions, setVersions] = useState<VersionEntry[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  // Save version periodically (every 5 minutes if changed)
  useEffect(() => {
    const interval = setInterval(() => {
      if (nodes.length > 0) {
        saveVersion();
      }
    }, 5 * 60 * 1000); // 5 minutes
    return () => clearInterval(interval);
  }, [nodes, edges]);

  const saveVersion = () => {
    const newVersion: VersionEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      nodes,
      edges,
      nodeCount: nodes.length,
      edgeCount: edges.length,
    };
    
    const updated = [newVersion, ...versions].slice(0, MAX_VERSIONS);
    localStorage.setItem(storageKey, JSON.stringify(updated));
    setVersions(updated);
  };

  const restoreVersion = (version: VersionEntry) => {
    onRestore(version.nodes, version.edges);
    setOpen(false);
    toast.success('Version restored!');
  };

  const deleteVersion = (id: string) => {
    const updated = versions.filter(v => v.id !== id);
    localStorage.setItem(storageKey, JSON.stringify(updated));
    setVersions(updated);
    toast.success('Version deleted');
  };

  const clearHistory = () => {
    localStorage.removeItem(storageKey);
    setVersions([]);
    toast.success('History cleared');
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => { saveVersion(); setOpen(true); }} className="gap-2">
        <History className="w-4 h-4" /> History
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="w-5 h-5" />
              Version History
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Last {MAX_VERSIONS} versions auto-saved</p>
              {versions.length > 0 && (
                <Button size="sm" variant="ghost" onClick={clearHistory} className="text-destructive gap-1">
                  <Trash2 className="w-3 h-3" /> Clear All
                </Button>
              )}
            </div>

            {versions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No version history yet. Versions are auto-saved every 5 minutes.
              </p>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {versions.map((version, idx) => (
                  <Card key={version.id} className="group">
                    <CardContent className="p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-muted rounded-lg">
                          <Clock className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {formatDistanceToNow(new Date(version.timestamp), { addSuffix: true })}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {version.nodeCount} nodes, {version.edgeCount} edges
                          </p>
                        </div>
                        {idx === 0 && <Badge variant="secondary" className="text-xs">Latest</Badge>}
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="sm" variant="outline" onClick={() => restoreVersion(version)} className="gap-1">
                          <RotateCcw className="w-3 h-3" /> Restore
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => deleteVersion(version.id)} className="text-destructive">
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
    </>
  );
}
