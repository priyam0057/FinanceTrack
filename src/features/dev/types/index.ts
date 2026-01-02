export type ProjectPhase =
  | 'developed'
  | 'in-development'
  | 'running'
  | 'maintenance'
  | 'on-hold'
  | 'completed';

export type TaskStatus = 'todo' | 'in-progress' | 'done' | 'blocked';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export type IssueStatus = 'open' | 'in-progress' | 'resolved' | 'closed';
export type IssueSeverity = 'minor' | 'major' | 'critical';
export type IssueEnvironment = 'production' | 'staging' | 'local';

export type GoalStatus = 'planned' | 'in-progress' | 'completed' | 'dropped';
export type GoalPriority = 'low' | 'medium' | 'high';

export type SecretType = 'api-key' | 'password' | 'token' | 'config';

export interface Project {
  id: string;
  name: string;
  description: string;
  githubUrl?: string;
  liveUrl?: string;
  techStack: string[];
  phase: ProjectPhase;
  createdAt: Date;
  updatedAt: Date;
  isFavorite: boolean;
  tags?: string[];
}

export interface DevNote {
  id: string;
  projectId: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee?: string;
  dueDate?: Date;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Issue {
  id: string;
  projectId: string;
  title: string;
  description: string;
  stepsToReproduce: string;
  expectedBehavior?: string;
  actualBehavior?: string;
  environment: IssueEnvironment;
  severity: IssueSeverity;
  status: IssueStatus;
  relatedTaskId?: string;
  createdAt: Date;
  updatedAt: Date;
  closedAt?: Date;
}

export interface Secret {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  value: string;
  type: SecretType;
  createdAt: Date;
  updatedAt: Date;
}

export interface TeamMember {
  id: string;
  projectId: string;
  name: string;
  role: string;
  email: string;
  phone?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Goal {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: GoalStatus;
  priority: GoalPriority;
  targetDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Backup {
  id: string;
  projectId: string;
  fileName: string;
  fileSize: number;
  description?: string;
  googleDriveFileId?: string;
  webViewLink?: string;
  uploadedAt: Date;
}

export interface JournalEntry {
  id: string;
  projectId?: string; // Optional if global
  content: string;
  mood?: 'happy' | 'neutral' | 'frustrated' | 'excited';
  tags?: string[];
  createdAt: Date;
}

export interface ResourceItem {
  id: string;
  projectId: string;
  type: 'color' | 'font' | 'link' | 'image' | 'code';
  name: string;
  value: string; // Hex code, URL, font name, snippet
  description?: string;
  createdAt: Date;
}

export interface Idea {
  id: string;
  content: string;
  isArchived: boolean;
  createdAt: Date;
}

export interface FocusSession {
  id: string;
  type: 'focus' | 'break';
  durationSeconds: number; // How long was the session set for?
  completedAt: Date;
}

export interface ProjectUpdate {
  id: string;
  projectId: string;
  date: string; // ISO Date string YYYY-MM-DD
  content: string;
  createdAt: Date;
}
