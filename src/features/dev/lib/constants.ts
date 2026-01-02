import { ProjectPhase, TaskStatus, TaskPriority, IssueStatus, IssueSeverity, IssueEnvironment, GoalStatus, GoalPriority, SecretType } from '@/features/dev/types';

export const projectPhaseLabels: Record<ProjectPhase, string> = {
  'developed': 'Developed',
  'in-development': 'In Development',
  'running': 'Running',
  'maintenance': 'Maintenance',
  'on-hold': 'On Hold',
  'completed': 'Completed',
};

export const projectPhaseColors: Record<ProjectPhase, string> = {
  'developed': 'bg-success/20 text-success border-success/30',
  'in-development': 'bg-info/20 text-info border-info/30',
  'running': 'bg-primary/20 text-primary border-primary/30',
  'maintenance': 'bg-warning/20 text-warning border-warning/30',
  'on-hold': 'bg-muted text-muted-foreground border-muted',
  'completed': 'bg-success/20 text-success border-success/30',
};

export const taskStatusLabels: Record<TaskStatus, string> = {
  'todo': 'To Do',
  'in-progress': 'In Progress',
  'done': 'Done',
  'blocked': 'Blocked',
};

export const taskStatusColors: Record<TaskStatus, string> = {
  'todo': 'bg-muted text-muted-foreground',
  'in-progress': 'bg-info/20 text-info',
  'done': 'bg-success/20 text-success',
  'blocked': 'bg-destructive/20 text-destructive',
};

export const taskPriorityLabels: Record<TaskPriority, string> = {
  'low': 'Low',
  'medium': 'Medium',
  'high': 'High',
  'critical': 'Critical',
};

export const taskPriorityColors: Record<TaskPriority, string> = {
  'low': 'bg-muted text-muted-foreground',
  'medium': 'bg-info/20 text-info',
  'high': 'bg-warning/20 text-warning',
  'critical': 'bg-destructive/20 text-destructive',
};

export const issueStatusLabels: Record<IssueStatus, string> = {
  'open': 'Open',
  'in-progress': 'In Progress',
  'resolved': 'Resolved',
  'closed': 'Closed',
};

export const issueStatusColors: Record<IssueStatus, string> = {
  'open': 'bg-destructive/20 text-destructive',
  'in-progress': 'bg-info/20 text-info',
  'resolved': 'bg-success/20 text-success',
  'closed': 'bg-muted text-muted-foreground',
};

export const issueSeverityLabels: Record<IssueSeverity, string> = {
  'minor': 'Minor',
  'major': 'Major',
  'critical': 'Critical',
};

export const issueSeverityColors: Record<IssueSeverity, string> = {
  'minor': 'bg-muted text-muted-foreground',
  'major': 'bg-warning/20 text-warning',
  'critical': 'bg-destructive/20 text-destructive',
};

export const issueEnvironmentLabels: Record<IssueEnvironment, string> = {
  'production': 'Production',
  'staging': 'Staging',
  'local': 'Local',
};

export const goalStatusLabels: Record<GoalStatus, string> = {
  'planned': 'Planned',
  'in-progress': 'In Progress',
  'completed': 'Completed',
  'dropped': 'Dropped',
};

export const goalStatusColors: Record<GoalStatus, string> = {
  'planned': 'bg-muted text-muted-foreground',
  'in-progress': 'bg-info/20 text-info',
  'completed': 'bg-success/20 text-success',
  'dropped': 'bg-destructive/20 text-destructive',
};

export const goalPriorityLabels: Record<GoalPriority, string> = {
  'low': 'Low',
  'medium': 'Medium',
  'high': 'High',
};

export const secretTypeLabels: Record<SecretType, string> = {
  'api-key': 'API Key',
  'password': 'Password',
  'token': 'Token',
  'config': 'Config',
};

export const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
