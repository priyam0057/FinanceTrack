import { useState } from 'react';
import { useStore } from '@/features/dev/lib/store';
import { Goal, GoalStatus, GoalPriority } from '@/features/dev/types';
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
  goalStatusLabels,
  goalStatusColors,
  goalPriorityLabels,
  formatDate,
} from '@/features/dev/lib/constants';
import { Plus, Search, Pencil, Trash2, Target, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface GoalsTabProps {
  projectId: string;
}

export function GoalsTab({ projectId }: GoalsTabProps) {
  const { goals, addGoal, updateGoal, deleteGoal } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'planned' as GoalStatus,
    priority: 'medium' as GoalPriority,
    targetDate: '',
  });

  const projectGoals = goals
    .filter((goal) => goal.projectId === projectId)
    .filter((goal) =>
      goal.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter((goal) => statusFilter === 'all' || goal.status === statusFilter)
    .sort((a, b) => {
      // Sort by target date, then by priority
      if (a.targetDate && b.targetDate) {
        return (
          new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime()
        );
      }
      if (a.targetDate) return -1;
      if (b.targetDate) return 1;
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

  const handleOpenDialog = (goal?: Goal) => {
    if (goal) {
      setEditingGoal(goal);
      setFormData({
        title: goal.title,
        description: goal.description,
        status: goal.status,
        priority: goal.priority,
        targetDate: goal.targetDate
          ? new Date(goal.targetDate).toISOString().split('T')[0]
          : '',
      });
    } else {
      setEditingGoal(null);
      setFormData({
        title: '',
        description: '',
        status: 'planned',
        priority: 'medium',
        targetDate: '',
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

    const goalData = {
      ...formData,
      targetDate: formData.targetDate ? new Date(formData.targetDate) : undefined,
    };

    if (editingGoal) {
      updateGoal(editingGoal.id, goalData);
      toast.success('Goal updated');
    } else {
      addGoal({ ...goalData, projectId });
      toast.success('Goal created');
    }
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    deleteGoal(id);
    toast.success('Goal deleted');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search goals..."
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
              {Object.entries(goalStatusLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Add Goal
        </Button>
      </div>

      {/* Goals List */}
      {projectGoals.length > 0 ? (
        <div className="space-y-3">
          {projectGoals.map((goal) => (
            <Card key={goal.id} className="card-hover">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-4 w-4 text-primary" />
                      <h3 className="font-mono font-medium text-foreground truncate">
                        {goal.title}
                      </h3>
                    </div>
                    {goal.description && (
                      <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
                        {goal.description}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className={cn(goalStatusColors[goal.status])}>
                        {goalStatusLabels[goal.status]}
                      </Badge>
                      <Badge variant="outline">
                        {goalPriorityLabels[goal.priority]} priority
                      </Badge>
                      {goal.targetDate && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          Target: {formatDate(goal.targetDate)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleOpenDialog(goal)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => handleDelete(goal.id)}
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
          <Target className="h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 font-mono text-lg font-medium text-foreground">
            No goals set
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Define goals and roadmap items for this project
          </p>
          <Button className="mt-6" onClick={() => handleOpenDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            Add Goal
          </Button>
        </div>
      )}

      {/* Goal Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="font-mono">
              {editingGoal ? 'Edit Goal' : 'Add Goal'}
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
                placeholder="Goal title"
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
                placeholder="Goal description..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: GoalStatus) =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(goalStatusLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: GoalPriority) =>
                    setFormData({ ...formData, priority: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(goalPriorityLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetDate">Target Date</Label>
              <Input
                id="targetDate"
                type="date"
                value={formData.targetDate}
                onChange={(e) =>
                  setFormData({ ...formData, targetDate: e.target.value })
                }
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
                {editingGoal ? 'Save Changes' : 'Add Goal'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
