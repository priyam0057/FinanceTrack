import { useState } from 'react';
import { Plus, Trash2, ExternalLink, Edit2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface TechItem {
  id: string;
  name: string;
  version: string;
  category: 'frontend' | 'backend' | 'database' | 'devops' | 'testing' | 'other';
  docsUrl?: string;
  notes?: string;
}

interface TechStackTabProps {
  projectId: string;
}

const categoryColors = {
  frontend: 'bg-blue-500',
  backend: 'bg-green-500',
  database: 'bg-violet-500',
  devops: 'bg-orange-500',
  testing: 'bg-pink-500',
  other: 'bg-gray-500',
};

export function TechStackTab({ projectId }: TechStackTabProps) {
  const storageKey = `tech-stack-${projectId}`;
  
  const [items, setItems] = useState<TechItem[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : defaultStack;
    } catch { return defaultStack; }
  });
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<TechItem | null>(null);

  const save = (updated: TechItem[]) => {
    setItems(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  const addItem = () => {
    const newItem: TechItem = {
      id: Date.now().toString(),
      name: 'New Tech',
      version: '1.0.0',
      category: 'other',
    };
    save([...items, newItem]);
    setEditingId(newItem.id);
    setEditForm(newItem);
  };

  const deleteItem = (id: string) => {
    save(items.filter(i => i.id !== id));
    toast.success('Removed');
  };

  const startEdit = (item: TechItem) => {
    setEditingId(item.id);
    setEditForm({ ...item });
  };

  const saveEdit = () => {
    if (editForm) {
      save(items.map(i => i.id === editForm.id ? editForm : i));
      setEditingId(null);
      setEditForm(null);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const grouped = items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, TechItem[]>);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Tech Stack</h3>
          <p className="text-sm text-muted-foreground">Technologies used in this project</p>
        </div>
        <Button onClick={addItem} className="gap-2">
          <Plus className="w-4 h-4" /> Add Technology
        </Button>
      </div>

      {Object.entries(grouped).map(([category, techs]) => (
        <div key={category} className="space-y-2">
          <h4 className="text-sm font-medium capitalize flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${categoryColors[category as keyof typeof categoryColors]}`} />
            {category}
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {techs.map((item) => (
              <Card key={item.id} className="group relative">
                {editingId === item.id && editForm ? (
                  <CardContent className="p-3 space-y-2">
                    <Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} placeholder="Name" className="h-8 text-sm" />
                    <Input value={editForm.version} onChange={(e) => setEditForm({ ...editForm, version: e.target.value })} placeholder="Version" className="h-8 text-sm" />
                    <select value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value as TechItem['category'] })}
                      className="w-full h-8 text-sm bg-background border rounded px-2">
                      <option value="frontend">Frontend</option>
                      <option value="backend">Backend</option>
                      <option value="database">Database</option>
                      <option value="devops">DevOps</option>
                      <option value="testing">Testing</option>
                      <option value="other">Other</option>
                    </select>
                    <Input value={editForm.docsUrl || ''} onChange={(e) => setEditForm({ ...editForm, docsUrl: e.target.value })} placeholder="Docs URL" className="h-8 text-sm" />
                    <Input value={editForm.notes || ''} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} placeholder="Notes" className="h-8 text-sm" />
                    <div className="flex gap-1">
                      <Button size="sm" onClick={saveEdit} className="flex-1 h-7"><Check className="w-3 h-3" /></Button>
                      <Button size="sm" variant="outline" onClick={cancelEdit} className="flex-1 h-7"><X className="w-3 h-3" /></Button>
                    </div>
                  </CardContent>
                ) : (
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-sm">{item.name}</p>
                        <Badge variant="outline" className="text-xs mt-1">v{item.version}</Badge>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.docsUrl && (
                          <a href={item.docsUrl} target="_blank" rel="noopener" className="p-1 hover:bg-muted rounded">
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                        <button onClick={() => startEdit(item)} className="p-1 hover:bg-muted rounded"><Edit2 className="w-3 h-3" /></button>
                        <button onClick={() => deleteItem(item.id)} className="p-1 hover:bg-muted rounded text-destructive"><Trash2 className="w-3 h-3" /></button>
                      </div>
                    </div>
                    {item.notes && <p className="text-xs text-muted-foreground mt-2">{item.notes}</p>}
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

const defaultStack: TechItem[] = [
  { id: '1', name: 'React', version: '18.2', category: 'frontend', docsUrl: 'https://react.dev' },
  { id: '2', name: 'TypeScript', version: '5.0', category: 'frontend', docsUrl: 'https://typescriptlang.org' },
  { id: '3', name: 'Tailwind CSS', version: '3.4', category: 'frontend', docsUrl: 'https://tailwindcss.com' },
  { id: '4', name: 'Vite', version: '5.0', category: 'devops', docsUrl: 'https://vitejs.dev' },
  { id: '5', name: 'Supabase', version: '2.0', category: 'backend', docsUrl: 'https://supabase.com/docs' },
  { id: '6', name: 'PostgreSQL', version: '15', category: 'database', docsUrl: 'https://postgresql.org/docs' },
];
