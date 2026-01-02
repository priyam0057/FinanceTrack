import { CheckCircle2, AlertCircle, Clock, Users, Target, Bug, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useStore } from '@/features/dev/lib/store';
import { format, formatDistanceToNow } from 'date-fns';

interface ProjectHealthProps {
  projectId: string;
}

export function ProjectHealth({ projectId }: ProjectHealthProps) {
  const { tasks, issues, goals, teamMembers, notes } = useStore();
  
  const projectTasks = tasks.filter(t => t.projectId === projectId);
  const projectIssues = issues.filter(i => i.projectId === projectId);
  const projectGoals = goals.filter(g => g.projectId === projectId);
  const projectTeam = teamMembers.filter(m => m.projectId === projectId);
  const projectNotes = notes.filter(n => n.projectId === projectId);

  // Calculate metrics
  const completedTasks = projectTasks.filter(t => t.status === 'done').length;
  const totalTasks = projectTasks.length;
  const taskCompletion = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const openIssues = projectIssues.filter(i => i.status === 'open' || i.status === 'in-progress').length;
  const criticalIssues = projectIssues.filter(i => i.severity === 'critical' && i.status !== 'closed').length;

  const completedGoals = projectGoals.filter(g => g.status === 'completed').length;
  const totalGoals = projectGoals.length;

  const lastActivity = [...projectTasks, ...projectIssues, ...projectNotes]
    .map(item => new Date(item.updatedAt))
    .sort((a, b) => b.getTime() - a.getTime())[0];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Project Health</h3>
        <p className="text-sm text-muted-foreground">Overview of project status and metrics</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Task Completion */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <Badge variant={taskCompletion >= 80 ? 'default' : taskCompletion >= 50 ? 'secondary' : 'destructive'}>
                {taskCompletion}%
              </Badge>
            </div>
            <Progress value={taskCompletion} className="h-2 mb-2" />
            <p className="text-sm font-medium">Tasks</p>
            <p className="text-xs text-muted-foreground">{completedTasks}/{totalTasks} completed</p>
          </CardContent>
        </Card>

        {/* Open Issues */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-2">
              <Bug className="w-5 h-5 text-red-500" />
              <Badge variant={criticalIssues > 0 ? 'destructive' : openIssues > 3 ? 'secondary' : 'default'}>
                {openIssues}
              </Badge>
            </div>
            <p className="text-2xl font-bold">{openIssues}</p>
            <p className="text-sm font-medium">Open Issues</p>
            {criticalIssues > 0 && (
              <p className="text-xs text-destructive">{criticalIssues} critical</p>
            )}
          </CardContent>
        </Card>

        {/* Goals */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-5 h-5 text-blue-500" />
              <span className="text-xs text-muted-foreground">{completedGoals}/{totalGoals}</span>
            </div>
            <p className="text-2xl font-bold">{totalGoals}</p>
            <p className="text-sm font-medium">Goals</p>
            <p className="text-xs text-muted-foreground">{completedGoals} completed</p>
          </CardContent>
        </Card>

        {/* Team */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-5 h-5 text-violet-500" />
            </div>
            <p className="text-2xl font-bold">{projectTeam.length}</p>
            <p className="text-sm font-medium">Team Members</p>
            <p className="text-xs text-muted-foreground">{projectTeam.filter(m => m.isActive).length} active</p>
          </CardContent>
        </Card>
      </div>

      {/* Last Activity */}
      <Card>
        <CardContent className="py-4 flex items-center gap-3">
          <Clock className="w-5 h-5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Last Activity</p>
            <p className="text-xs text-muted-foreground">
              {lastActivity ? formatDistanceToNow(lastActivity, { addSuffix: true }) : 'No activity yet'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="py-4 text-center">
            <FileText className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
            <p className="text-xl font-bold">{projectNotes.length}</p>
            <p className="text-xs text-muted-foreground">Notes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <AlertCircle className="w-5 h-5 mx-auto mb-2 text-yellow-500" />
            <p className="text-xl font-bold">{projectTasks.filter(t => t.status === 'blocked').length}</p>
            <p className="text-xs text-muted-foreground">Blocked</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <Target className="w-5 h-5 mx-auto mb-2 text-orange-500" />
            <p className="text-xl font-bold">{projectTasks.filter(t => t.priority === 'high' || t.priority === 'critical').length}</p>
            <p className="text-xs text-muted-foreground">High Priority</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
