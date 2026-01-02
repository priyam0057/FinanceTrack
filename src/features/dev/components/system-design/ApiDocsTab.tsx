import { useState } from 'react';
import { Plus, Trash2, Copy, ChevronDown, ChevronUp, Code, Send, Lock, Unlock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ApiEndpoint {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  description: string;
  requestBody?: string;
  responseExample?: string;
  statusCodes: { code: number; description: string }[];
  requiresAuth: boolean;
}

interface ApiDocsTabProps {
  projectId: string;
}

const methodColors: Record<string, string> = {
  GET: 'bg-green-500',
  POST: 'bg-blue-500',
  PUT: 'bg-yellow-500',
  PATCH: 'bg-orange-500',
  DELETE: 'bg-red-500',
};

export function ApiDocsTab({ projectId }: ApiDocsTabProps) {
  const storageKey = `api-docs-${projectId}`;
  
  const [endpoints, setEndpoints] = useState<ApiEndpoint[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const saveEndpoints = (updated: ApiEndpoint[]) => {
    setEndpoints(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  const addEndpoint = () => {
    const newEndpoint: ApiEndpoint = {
      id: Date.now().toString(),
      method: 'GET',
      path: '/api/',
      description: '',
      requestBody: '',
      responseExample: '{\n  "success": true\n}',
      statusCodes: [{ code: 200, description: 'Success' }],
      requiresAuth: true,
    };
    saveEndpoints([...endpoints, newEndpoint]);
    setExpandedId(newEndpoint.id);
  };

  const updateEndpoint = (id: string, updates: Partial<ApiEndpoint>) => {
    saveEndpoints(endpoints.map(e => e.id === id ? { ...e, ...updates } : e));
  };

  const deleteEndpoint = (id: string) => {
    saveEndpoints(endpoints.filter(e => e.id !== id));
    toast.success('Endpoint deleted');
  };

  const copyEndpoint = (endpoint: ApiEndpoint) => {
    const text = `${endpoint.method} ${endpoint.path}\n${endpoint.description}`;
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const addStatusCode = (endpointId: string) => {
    const endpoint = endpoints.find(e => e.id === endpointId);
    if (endpoint) {
      updateEndpoint(endpointId, {
        statusCodes: [...endpoint.statusCodes, { code: 200, description: '' }]
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">API Documentation</h3>
          <p className="text-sm text-muted-foreground">Document your API endpoints</p>
        </div>
        <Button onClick={addEndpoint} className="gap-2">
          <Plus className="w-4 h-4" /> Add Endpoint
        </Button>
      </div>

      {endpoints.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Code className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No endpoints documented yet.</p>
            <Button onClick={addEndpoint} variant="outline" className="mt-4 gap-2">
              <Plus className="w-4 h-4" /> Add First Endpoint
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {endpoints.map((endpoint) => (
            <Card key={endpoint.id} className="overflow-hidden">
              {/* Header - Always Visible */}
              <div
                className="flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => setExpandedId(expandedId === endpoint.id ? null : endpoint.id)}
              >
                <Badge className={cn('text-white font-mono text-xs', methodColors[endpoint.method])}>
                  {endpoint.method}
                </Badge>
                <code className="text-sm font-mono flex-1">{endpoint.path}</code>
                {endpoint.requiresAuth ? (
                  <Lock className="w-4 h-4 text-yellow-500" />
                ) : (
                  <Unlock className="w-4 h-4 text-green-500" />
                )}
                <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); copyEndpoint(endpoint); }}>
                  <Copy className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); deleteEndpoint(endpoint.id); }} className="text-destructive">
                  <Trash2 className="w-4 h-4" />
                </Button>
                {expandedId === endpoint.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>

              {/* Expanded Content */}
              {expandedId === endpoint.id && (
                <CardContent className="pt-0 pb-4 space-y-4 border-t">
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    {/* Method */}
                    <div className="space-y-1">
                      <Label className="text-xs">Method</Label>
                      <select
                        value={endpoint.method}
                        onChange={(e) => updateEndpoint(endpoint.id, { method: e.target.value as ApiEndpoint['method'] })}
                        className="w-full h-9 rounded border bg-background px-3 text-sm"
                      >
                        <option value="GET">GET</option>
                        <option value="POST">POST</option>
                        <option value="PUT">PUT</option>
                        <option value="PATCH">PATCH</option>
                        <option value="DELETE">DELETE</option>
                      </select>
                    </div>
                    {/* Path */}
                    <div className="space-y-1">
                      <Label className="text-xs">Path</Label>
                      <Input
                        value={endpoint.path}
                        onChange={(e) => updateEndpoint(endpoint.id, { path: e.target.value })}
                        placeholder="/api/users/:id"
                        className="h-9 font-mono text-sm"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-1">
                    <Label className="text-xs">Description</Label>
                    <Textarea
                      value={endpoint.description}
                      onChange={(e) => updateEndpoint(endpoint.id, { description: e.target.value })}
                      placeholder="What does this endpoint do?"
                      rows={2}
                      className="text-sm"
                    />
                  </div>

                  {/* Auth Toggle */}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={endpoint.requiresAuth}
                      onChange={(e) => updateEndpoint(endpoint.id, { requiresAuth: e.target.checked })}
                      className="rounded"
                    />
                    <Label className="text-sm">Requires Authentication</Label>
                  </div>

                  {/* Request Body */}
                  {['POST', 'PUT', 'PATCH'].includes(endpoint.method) && (
                    <div className="space-y-1">
                      <Label className="text-xs">Request Body (JSON)</Label>
                      <Textarea
                        value={endpoint.requestBody}
                        onChange={(e) => updateEndpoint(endpoint.id, { requestBody: e.target.value })}
                        placeholder='{\n  "name": "example"\n}'
                        rows={4}
                        className="font-mono text-xs"
                      />
                    </div>
                  )}

                  {/* Response Example */}
                  <div className="space-y-1">
                    <Label className="text-xs">Response Example (JSON)</Label>
                    <Textarea
                      value={endpoint.responseExample}
                      onChange={(e) => updateEndpoint(endpoint.id, { responseExample: e.target.value })}
                      rows={4}
                      className="font-mono text-xs"
                    />
                  </div>

                  {/* Status Codes */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Status Codes</Label>
                      <Button size="sm" variant="outline" onClick={() => addStatusCode(endpoint.id)} className="h-6 text-xs">
                        Add Code
                      </Button>
                    </div>
                    {endpoint.statusCodes.map((sc, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <Input
                          type="number"
                          value={sc.code}
                          onChange={(e) => {
                            const codes = [...endpoint.statusCodes];
                            codes[idx].code = parseInt(e.target.value);
                            updateEndpoint(endpoint.id, { statusCodes: codes });
                          }}
                          className="w-20 h-8 text-sm"
                        />
                        <Input
                          value={sc.description}
                          onChange={(e) => {
                            const codes = [...endpoint.statusCodes];
                            codes[idx].description = e.target.value;
                            updateEndpoint(endpoint.id, { statusCodes: codes });
                          }}
                          placeholder="Description"
                          className="flex-1 h-8 text-sm"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
