import { useState, useEffect } from 'react';
import { Plus, Trash2, Eye, EyeOff, Copy, Edit2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useSystemDesign, EnvVariable } from '../../hooks/useSystemDesign';

interface EnvConfigTabProps {
  projectId: string;
}

export function EnvConfigTab({ projectId }: EnvConfigTabProps) {
  const { loadEnvConfig, saveEnvVariable, deleteEnvVariable, loading } = useSystemDesign(projectId);
  
  const [variables, setVariables] = useState<EnvVariable[]>([]);
  const [visibleSecrets, setVisibleSecrets] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!initialized) {
      loadEnvConfig().then((data) => {
        setVariables(data);
        setInitialized(true);
      });
    }
  }, [projectId, loadEnvConfig, initialized]);

  const toggleVisibility = (id: string) => {
    const next = new Set(visibleSecrets);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setVisibleSecrets(next);
  };

  const copyValue = (value: string) => {
    navigator.clipboard.writeText(value);
    toast.success('Copied!');
  };

  const addVariable = () => {
    const newVar: EnvVariable = {
      id: `temp-${Date.now()}`,
      name: 'NEW_VAR',
      development: '',
      staging: '',
      production: '',
      isSecret: false,
    };
    setVariables([...variables, newVar]);
    setEditingId(newVar.id);
  };

  const updateVariableLocal = (id: string, updates: Partial<EnvVariable>) => {
    setVariables(variables.map(v => v.id === id ? { ...v, ...updates } : v));
  };

  const saveVariable = async (id: string) => {
    const variable = variables.find(v => v.id === id);
    if (!variable) return;

    const saved = await saveEnvVariable(variable);
    if (saved) {
      setVariables(variables.map(v => v.id === id ? saved : v));
      setEditingId(null);
      toast.success('Saved!');
    }
  };

  const handleDelete = async (id: string) => {
    if (id.startsWith('temp-')) {
      setVariables(variables.filter(v => v.id !== id));
      return;
    }
    
    const success = await deleteEnvVariable(id);
    if (success) {
      setVariables(variables.filter(v => v.id !== id));
      toast.success('Deleted');
    }
  };

  const maskValue = (value: string) => '•'.repeat(Math.min(value.length || 0, 20)) || (value ? '••••' : '');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Environment Config</h3>
          <p className="text-sm text-muted-foreground">Manage environment variables across environments</p>
        </div>
        <Button onClick={addVariable} className="gap-2" disabled={loading}>
          <Plus className="w-4 h-4" /> Add Variable
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-3 font-medium">Variable</th>
                <th className="text-left p-3 font-medium">
                  <Badge variant="outline" className="bg-blue-500/10 text-blue-500">Development</Badge>
                </th>
                <th className="text-left p-3 font-medium">
                  <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500">Staging</Badge>
                </th>
                <th className="text-left p-3 font-medium">
                  <Badge variant="outline" className="bg-green-500/10 text-green-500">Production</Badge>
                </th>
                <th className="w-24"></th>
              </tr>
            </thead>
            <tbody>
              {variables.map((variable) => (
                <tr key={variable.id} className="border-b hover:bg-muted/30">
                  {/* Name */}
                  <td className="p-3">
                    {editingId === variable.id ? (
                      <Input value={variable.name} onChange={(e) => updateVariableLocal(variable.id, { name: e.target.value })}
                        className="h-8 font-mono text-xs" />
                    ) : (
                      <code className="font-mono text-xs flex items-center gap-2">
                        {variable.name}
                        {variable.isSecret && <Badge variant="secondary" className="text-xs">Secret</Badge>}
                      </code>
                    )}
                  </td>
                  {/* Development */}
                  <td className="p-3">
                    {editingId === variable.id ? (
                      <Input value={variable.development} onChange={(e) => updateVariableLocal(variable.id, { development: e.target.value })}
                        className="h-8 font-mono text-xs" />
                    ) : (
                      <div className="flex items-center gap-1">
                        <code className="text-xs">
                          {variable.isSecret && !visibleSecrets.has(variable.id) ? maskValue(variable.development) : variable.development || '-'}
                        </code>
                        <button onClick={() => copyValue(variable.development)} className="p-1 opacity-0 group-hover:opacity-100"><Copy className="w-3 h-3" /></button>
                      </div>
                    )}
                  </td>
                  {/* Staging */}
                  <td className="p-3">
                    {editingId === variable.id ? (
                      <Input value={variable.staging} onChange={(e) => updateVariableLocal(variable.id, { staging: e.target.value })}
                        className="h-8 font-mono text-xs" />
                    ) : (
                      <div className="flex items-center gap-1">
                        <code className="text-xs">
                          {variable.isSecret && !visibleSecrets.has(variable.id) ? maskValue(variable.staging) : variable.staging || '-'}
                        </code>
                        <button onClick={() => copyValue(variable.staging)} className="p-1 opacity-0 group-hover:opacity-100"><Copy className="w-3 h-3" /></button>
                      </div>
                    )}
                  </td>
                  {/* Production */}
                  <td className="p-3">
                    {editingId === variable.id ? (
                      <Input value={variable.production} onChange={(e) => updateVariableLocal(variable.id, { production: e.target.value })}
                        className="h-8 font-mono text-xs" />
                    ) : (
                      <div className="flex items-center gap-1">
                        <code className="text-xs">
                          {variable.isSecret && !visibleSecrets.has(variable.id) ? maskValue(variable.production) : variable.production || '-'}
                        </code>
                        <button onClick={() => copyValue(variable.production)} className="p-1 opacity-0 group-hover:opacity-100"><Copy className="w-3 h-3" /></button>
                      </div>
                    )}
                  </td>
                  {/* Actions */}
                  <td className="p-3">
                    <div className="flex items-center gap-1">
                      {variable.isSecret && (
                        <button onClick={() => toggleVisibility(variable.id)} className="p-1 hover:bg-muted rounded">
                          {visibleSecrets.has(variable.id) ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        </button>
                      )}
                      {editingId === variable.id ? (
                        <>
                          <button onClick={() => saveVariable(variable.id)} className="p-1 hover:bg-muted rounded text-green-500"><Check className="w-3 h-3" /></button>
                          <button onClick={() => { updateVariableLocal(variable.id, { isSecret: !variable.isSecret }); }} className="p-1 hover:bg-muted rounded">
                            {variable.isSecret ? '🔓' : '🔒'}
                          </button>
                        </>
                      ) : (
                        <button onClick={() => setEditingId(variable.id)} className="p-1 hover:bg-muted rounded"><Edit2 className="w-3 h-3" /></button>
                      )}
                      <button onClick={() => handleDelete(variable.id)} className="p-1 hover:bg-muted rounded text-destructive"><Trash2 className="w-3 h-3" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
      {variables.length === 0 && !loading && (
        <div className="text-center p-8 text-muted-foreground text-sm border border-dashed rounded-lg">
          No environment variables configured.
        </div>
      )}
    </div>
  );
}

const defaultEnvVars: EnvVariable[] = [];
