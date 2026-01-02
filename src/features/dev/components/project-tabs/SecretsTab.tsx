import { useState } from 'react';
import { useStore } from '@/features/dev/lib/store';
import { Secret, SecretType } from '@/features/dev/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { secretTypeLabels, formatDateTime } from '@/features/dev/lib/constants';
import { Plus, Search, Pencil, Trash2, Eye, EyeOff, Copy, Key, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';

interface SecretsTabProps {
  projectId: string;
}

export function SecretsTab({ projectId }: SecretsTabProps) {
  const { secrets, addSecret, updateSecret, deleteSecret } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSecret, setEditingSecret] = useState<Secret | null>(null);
  const [visibleSecrets, setVisibleSecrets] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    value: '',
    type: 'api-key' as SecretType,
  });

  const projectSecrets = secrets
    .filter((secret) => secret.projectId === projectId)
    .filter((secret) =>
      secret.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

  const handleOpenDialog = (secret?: Secret) => {
    if (secret) {
      setEditingSecret(secret);
      setFormData({
        name: secret.name,
        description: secret.description || '',
        value: secret.value,
        type: secret.type,
      });
    } else {
      setEditingSecret(null);
      setFormData({
        name: '',
        description: '',
        value: '',
        type: 'api-key',
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Secret name is required');
      return;
    }
    if (!formData.value.trim()) {
      toast.error('Secret value is required');
      return;
    }

    const secretData = {
      ...formData,
      description: formData.description || undefined,
    };

    if (editingSecret) {
      updateSecret(editingSecret.id, secretData);
      toast.success('Secret updated');
    } else {
      addSecret({ ...secretData, projectId });
      toast.success('Secret created');
    }
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    deleteSecret(id);
    toast.success('Secret deleted');
  };

  const toggleVisibility = (id: string) => {
    const newVisible = new Set(visibleSecrets);
    if (newVisible.has(id)) {
      newVisible.delete(id);
    } else {
      newVisible.add(id);
    }
    setVisibleSecrets(newVisible);
  };

  const handleCopy = (value: string) => {
    navigator.clipboard.writeText(value);
    toast.success('Copied to clipboard');
  };

  const maskValue = (value: string) => {
    return '•'.repeat(Math.min(value.length, 32));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Warning */}
      <div className="flex items-center gap-4 p-4 rounded-lg bg-warning/10 border border-warning/30">
        <ShieldAlert className="h-5 w-5 text-warning" />
        <span className="text-sm text-muted-foreground">
          Secrets are stored locally and are never included in reports or exports.
        </span>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search secrets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Add Secret
        </Button>
      </div>

      {/* Secrets List */}
      {projectSecrets.length > 0 ? (
        <div className="space-y-3">
          {projectSecrets.map((secret) => (
            <Card key={secret.id} className="card-hover">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Key className="h-4 w-4 text-primary" />
                      <h3 className="font-mono font-medium text-foreground">
                        {secret.name}
                      </h3>
                      <Badge variant="secondary">
                        {secretTypeLabels[secret.type]}
                      </Badge>
                    </div>
                    {secret.description && (
                      <p className="mb-2 text-sm text-muted-foreground">
                        {secret.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2">
                      <code className="flex-1 rounded bg-muted px-3 py-1.5 font-mono text-sm text-muted-foreground">
                        {visibleSecrets.has(secret.id)
                          ? secret.value
                          : maskValue(secret.value)}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => toggleVisibility(secret.id)}
                      >
                        {visibleSecrets.has(secret.id) ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleCopy(secret.value)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Updated {formatDateTime(secret.updatedAt)}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleOpenDialog(secret)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => handleDelete(secret.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 py-16">
          <Key className="h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 font-mono text-lg font-medium text-foreground">
            No secrets stored
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Securely store API keys, tokens, and passwords
          </p>
          <Button className="mt-6" onClick={() => handleOpenDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            Add Secret
          </Button>
        </div>
      )}

      {/* Secret Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="font-mono">
              {editingSecret ? 'Edit Secret' : 'Add Secret'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Stripe API Key"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="What is this secret for?"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value: SecretType) =>
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(secretTypeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="value">Value *</Label>
              <Input
                id="value"
                type="password"
                value={formData.value}
                onChange={(e) =>
                  setFormData({ ...formData, value: e.target.value })
                }
                placeholder="Enter the secret value"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingSecret ? 'Save Changes' : 'Add Secret'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
