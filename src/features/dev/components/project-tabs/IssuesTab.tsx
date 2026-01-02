import { useState } from 'react';
import { useStore } from '@/features/dev/lib/store';
import { Issue, IssueStatus, IssueSeverity, IssueEnvironment } from '@/features/dev/types';
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
import {
  issueStatusLabels,
  issueStatusColors,
  issueSeverityLabels,
  issueSeverityColors,
  issueEnvironmentLabels,
  formatDateTime,
} from '@/features/dev/lib/constants';
import { Plus, Search, Pencil, Trash2, Bug, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface IssuesTabProps {
  projectId: string;
}

export function IssuesTab({ projectId }: IssuesTabProps) {
  const { issues, addIssue, updateIssue, deleteIssue } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIssue, setEditingIssue] = useState<Issue | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    stepsToReproduce: '',
    expectedBehavior: '',
    actualBehavior: '',
    environment: 'local' as IssueEnvironment,
    severity: 'minor' as IssueSeverity,
    status: 'open' as IssueStatus,
    relatedTaskId: '',
  });

  const projectIssues = issues
    .filter((issue) => issue.projectId === projectId)
    .filter(
      (issue) =>
        issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter((issue) => statusFilter === 'all' || issue.status === statusFilter)
    .filter(
      (issue) => severityFilter === 'all' || issue.severity === severityFilter
    )
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

  const openIssuesCount = issues.filter(
    (i) => i.projectId === projectId && i.status === 'open'
  ).length;

  const handleOpenDialog = (issue?: Issue) => {
    if (issue) {
      setEditingIssue(issue);
      setFormData({
        title: issue.title,
        description: issue.description,
        stepsToReproduce: issue.stepsToReproduce,
        expectedBehavior: issue.expectedBehavior || '',
        actualBehavior: issue.actualBehavior || '',
        environment: issue.environment,
        severity: issue.severity,
        status: issue.status,
        relatedTaskId: issue.relatedTaskId || '',
      });
    } else {
      setEditingIssue(null);
      setFormData({
        title: '',
        description: '',
        stepsToReproduce: '',
        expectedBehavior: '',
        actualBehavior: '',
        environment: 'local',
        severity: 'minor',
        status: 'open',
        relatedTaskId: '',
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }

    const issueData = {
      ...formData,
      expectedBehavior: formData.expectedBehavior || undefined,
      actualBehavior: formData.actualBehavior || undefined,
      relatedTaskId: formData.relatedTaskId || undefined,
      closedAt:
        formData.status === 'closed' && editingIssue?.status !== 'closed'
          ? new Date()
          : editingIssue?.closedAt,
    };

    if (editingIssue) {
      updateIssue(editingIssue.id, issueData);
      toast.success('Issue updated');
    } else {
      addIssue({ ...issueData, projectId });
      toast.success('Issue created');
    }
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    deleteIssue(id);
    toast.success('Issue deleted');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats */}
      <div className="flex items-center gap-4 p-4 rounded-lg bg-card border border-border">
        <AlertCircle className="h-5 w-5 text-destructive" />
        <span className="text-sm text-muted-foreground">
          <span className="font-mono font-bold text-foreground">
            {openIssuesCount}
          </span>{' '}
          open {openIssuesCount === 1 ? 'issue' : 'issues'}
        </span>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search issues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {Object.entries(issueStatusLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severity</SelectItem>
              {Object.entries(issueSeverityLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Report Issue
        </Button>
      </div>

      {/* Issues List */}
      {projectIssues.length > 0 ? (
        <div className="space-y-3">
          {projectIssues.map((issue) => (
            <Card key={issue.id} className="card-hover">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Bug className="h-4 w-4 text-muted-foreground" />
                      <h3 className="font-mono font-medium text-foreground truncate">
                        {issue.title}
                      </h3>
                    </div>
                    {issue.description && (
                      <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
                        {issue.description}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className={cn(issueStatusColors[issue.status])}>
                        {issueStatusLabels[issue.status]}
                      </Badge>
                      <Badge className={cn(issueSeverityColors[issue.severity])}>
                        {issueSeverityLabels[issue.severity]}
                      </Badge>
                      <Badge variant="outline">
                        {issueEnvironmentLabels[issue.environment]}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDateTime(issue.updatedAt)}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleOpenDialog(issue)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => handleDelete(issue.id)}
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
          <Bug className="h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 font-mono text-lg font-medium text-foreground">
            No issues reported
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Track bugs and issues for this project
          </p>
          <Button className="mt-6" onClick={() => handleOpenDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            Report Issue
          </Button>
        </div>
      )}

      {/* Issue Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-mono">
              {editingIssue ? 'Edit Issue' : 'Report Issue'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Brief issue title"
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
                placeholder="Describe the issue..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stepsToReproduce">Steps to Reproduce</Label>
              <Textarea
                id="stepsToReproduce"
                value={formData.stepsToReproduce}
                onChange={(e) =>
                  setFormData({ ...formData, stepsToReproduce: e.target.value })
                }
                placeholder="1. Step one&#10;2. Step two..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expectedBehavior">Expected Behavior</Label>
                <Textarea
                  id="expectedBehavior"
                  value={formData.expectedBehavior}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      expectedBehavior: e.target.value,
                    })
                  }
                  placeholder="What should happen"
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="actualBehavior">Actual Behavior</Label>
                <Textarea
                  id="actualBehavior"
                  value={formData.actualBehavior}
                  onChange={(e) =>
                    setFormData({ ...formData, actualBehavior: e.target.value })
                  }
                  placeholder="What actually happens"
                  rows={2}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Environment</Label>
                <Select
                  value={formData.environment}
                  onValueChange={(value: IssueEnvironment) =>
                    setFormData({ ...formData, environment: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(issueEnvironmentLabels).map(
                      ([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Severity</Label>
                <Select
                  value={formData.severity}
                  onValueChange={(value: IssueSeverity) =>
                    setFormData({ ...formData, severity: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(issueSeverityLabels).map(
                      ([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: IssueStatus) =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(issueStatusLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
                {editingIssue ? 'Save Changes' : 'Report Issue'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
