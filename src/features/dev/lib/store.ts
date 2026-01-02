
import { create } from 'zustand';
import { supabase } from "@/integrations/supabase/client";
import {
  Project,
  DevNote,
  Task,
  Issue,
  Secret,
  TeamMember,
  Goal,
  Backup,
  JournalEntry,
  ResourceItem,
  Idea,
  FocusSession,
} from '@/features/dev/types';

interface AppState {
  projects: Project[];
  notes: DevNote[];
  tasks: Task[];
  issues: Issue[];
  secrets: Secret[];
  teamMembers: TeamMember[];
  goals: Goal[];
  backups: Backup[];
  journal: JournalEntry[];
  resources: ResourceItem[];
  ideas: Idea[];
  focusSessions: FocusSession[];


  isInitialized: boolean;
  isGoogleDriveConnected: boolean;

  initialize: () => Promise<void>;
  setGoogleDriveConnected: (status: boolean) => void;

  addJournalEntry: (entry: Omit<JournalEntry, 'id' | 'createdAt'>) => void;
  updateJournalEntry: (id: string, content: string) => void;
  deleteJournalEntry: (id: string) => void;

  addResource: (resource: Omit<ResourceItem, 'id' | 'createdAt'>) => void;
  deleteResource: (id: string) => void;

  addIdea: (idea: Omit<Idea, 'id' | 'createdAt'>) => void;
  updateIdea: (id: string, content: string) => void;
  toggleIdeaArchived: (id: string) => void;
  deleteIdea: (id: string) => void;

  addFocusSession: (session: Omit<FocusSession, 'id' | 'completedAt'>) => void;



  // Project actions
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Project>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;

  // Placeholder for other actions to allow compilation, 
  // currently implementing Project persistence fully.
  // Others will be optimistic only for now or fully implemented if pattern is simple.

  // Note actions
  addNote: (note: Omit<DevNote, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (id: string, updates: Partial<DevNote>) => void;
  deleteNote: (id: string) => void;

  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;

  addIssue: (issue: Omit<Issue, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateIssue: (id: string, updates: Partial<Issue>) => void;
  deleteIssue: (id: string) => void;

  addSecret: (secret: Omit<Secret, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateSecret: (id: string, updates: Partial<Secret>) => void;
  deleteSecret: (id: string) => void;

  addTeamMember: (member: Omit<TeamMember, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTeamMember: (id: string, updates: Partial<TeamMember>) => void;
  deleteTeamMember: (id: string) => void;

  addGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;

  addBackup: (backup: Omit<Backup, 'id' | 'uploadedAt'> & { uploadedAt?: Date }) => void;
  deleteBackup: (id: string) => void;
}

const generateId = () => crypto.randomUUID();

export const useStore = create<AppState>((set, get) => ({
  projects: [],
  notes: [],
  tasks: [],
  issues: [],
  secrets: [],
  teamMembers: [],
  goals: [],
  backups: [],

  addBackup: async (backupData) => {
    const backup: Backup = {
      ...backupData,
      id: generateId(),
      uploadedAt: backupData.uploadedAt || new Date(),
    };

    // Optimistic update
    set((state) => ({ backups: [...state.backups, backup] }));

    // TODO: Implement Supabase integration for backups if needed.
    // For now, this is an optimistic update only.
  },
  deleteBackup: (id) => {
    // Optimistic update
    set((state) => ({
      backups: state.backups.filter((backup) => backup.id !== id),
    }));

    // TODO: Implement Supabase integration for deleting backups if needed.
  },
  isInitialized: false,
  isGoogleDriveConnected: false,

  setGoogleDriveConnected: (status) => set({ isGoogleDriveConnected: status }),

  initialize: async () => {
    if (get().isInitialized) return;

    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return;

      // 1. Projects
      const { data: projectsData } = await supabase.from('projects' as any).select('*');
      const mappedProjects: Project[] = (projectsData || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        githubUrl: p.github_url,
        liveUrl: p.live_url,
        techStack: p.tech_stack,
        phase: p.phase as any,
        createdAt: new Date(p.created_at),
        updatedAt: new Date(p.updated_at),
        isFavorite: p.is_favorite,
        tags: p.tags
      }));

      // 2. Journal
      const { data: journalData } = await supabase.from('journal_entries' as any).select('*').order('created_at', { ascending: false });
      const mappedJournal: JournalEntry[] = (journalData || []).map((j: any) => ({
        id: j.id,
        content: j.content,
        mood: j.mood,
        tags: j.tags,
        createdAt: new Date(j.created_at),
        projectId: j.project_id
      }));

      // 3. Tasks
      const { data: tasksData } = await supabase.from('tasks' as any).select('*').order('created_at', { ascending: false });
      const mappedTasks: Task[] = (tasksData || []).map((t: any) => ({
        id: t.id,
        projectId: t.project_id,
        title: t.title,
        description: t.description,
        status: t.status,
        priority: t.priority,
        dueDate: t.due_date ? new Date(t.due_date) : undefined,
        tags: t.tags || [],
        createdAt: new Date(t.created_at),
        updatedAt: new Date(t.updated_at),
      }));

      // 3. Ideas
      const { data: ideasData } = await supabase.from('ideas' as any).select('*').order('created_at', { ascending: false });
      const mappedIdeas: Idea[] = (ideasData || []).map((i: any) => ({
        id: i.id,
        content: i.content,
        isArchived: i.is_archived,
        createdAt: new Date(i.created_at),
      }));

      // 4. Focus Sessions
      const { data: focusData } = await supabase.from('focus_sessions' as any).select('*').order('completed_at', { ascending: false });
      const mappedSessions: FocusSession[] = (focusData || []).map((s: any) => ({
        id: s.id,
        type: s.type,
        durationSeconds: s.duration_seconds,
        completedAt: new Date(s.completed_at),
      }));



      // 5. Notes
      const { data: notesData } = await supabase.from('dev_notes' as any).select('*').order('created_at', { ascending: false });
      const mappedNotes: DevNote[] = (notesData || []).map((n: any) => ({
        id: n.id,
        projectId: n.project_id,
        title: n.title,
        content: n.content,
        tags: n.tags || [],
        createdAt: new Date(n.created_at),
        updatedAt: new Date(n.updated_at),
      }));

      // 6. Issues
      const { data: issuesData } = await supabase.from('issues' as any).select('*').order('created_at', { ascending: false });
      const mappedIssues: Issue[] = (issuesData || []).map((i: any) => ({
        id: i.id,
        projectId: i.project_id,
        title: i.title,
        description: i.description,
        stepsToReproduce: i.steps_to_reproduce,
        expectedBehavior: i.expected_behavior,
        actualBehavior: i.actual_behavior,
        environment: i.environment,
        severity: i.severity,
        status: i.status,
        relatedTaskId: i.related_task_id,
        createdAt: new Date(i.created_at),
        updatedAt: new Date(i.updated_at),
        closedAt: i.closed_at ? new Date(i.closed_at) : undefined,
      }));

      // 7. Secrets
      const { data: secretsData } = await supabase.from('secrets' as any).select('*').order('created_at', { ascending: false });
      const mappedSecrets: Secret[] = (secretsData || []).map((s: any) => ({
        id: s.id,
        projectId: s.project_id,
        name: s.name,
        description: s.description,
        value: s.value,
        type: s.type,
        createdAt: new Date(s.created_at),
        updatedAt: new Date(s.updated_at),
      }));

      // 8. Team Members
      const { data: teamData } = await supabase.from('team_members' as any).select('*').order('created_at', { ascending: false });
      const mappedTeamMembers: TeamMember[] = (teamData || []).map((m: any) => ({
        id: m.id,
        projectId: m.project_id,
        name: m.name,
        role: m.role,
        email: m.email,
        phone: m.phone,
        githubUrl: m.github_url,
        linkedinUrl: m.linkedin_url,
        notes: m.notes,
        isActive: m.is_active,
        createdAt: new Date(m.created_at),
        updatedAt: new Date(m.updated_at),
      }));

      // 9. Goals
      const { data: goalsData } = await supabase.from('goals' as any).select('*').order('created_at', { ascending: false });
      const mappedGoals: Goal[] = (goalsData || []).map((g: any) => ({
        id: g.id,
        projectId: g.project_id,
        title: g.title,
        description: g.description,
        status: g.status,
        priority: g.priority,
        targetDate: g.target_date ? new Date(g.target_date) : undefined,
        createdAt: new Date(g.created_at),
        updatedAt: new Date(g.updated_at),
      }));

      set({
        projects: mappedProjects,
        tasks: mappedTasks,
        journal: mappedJournal,
        ideas: mappedIdeas,
        focusSessions: mappedSessions,
        notes: mappedNotes,
        issues: mappedIssues,
        secrets: mappedSecrets,
        teamMembers: mappedTeamMembers,
        goals: mappedGoals,

        isInitialized: true
      });

    } catch (error) {
      console.error("Failed to initialize store:", error);
    }
  },

  // Project actions with Supabase
  addProject: async (projectData) => {
    const project: Project = {
      ...projectData,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Optimistic update
    set((state) => ({ projects: [...state.projects, project] }));

    // Supabase Insert
    const { error } = await supabase.from('projects' as any).insert({
      id: project.id,
      name: project.name,
      description: project.description,
      github_url: project.githubUrl,
      live_url: project.liveUrl,
      tech_stack: project.techStack,
      phase: project.phase,
      is_favorite: project.isFavorite,
      tags: project.tags,
      user_id: (await supabase.auth.getUser()).data.user?.id
    });

    if (error) {
      console.error("Supabase error:", error);
      // Rollback?
    }

    return project;
  },

  updateProject: async (id, updates) => {
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === id ? { ...p, ...updates, updatedAt: new Date() } : p
      ),
    }));

    // Map updates to snake_case for DB
    const dbUpdates: any = {};
    if (updates.name) dbUpdates.name = updates.name;
    if (updates.description) dbUpdates.description = updates.description;
    if (updates.githubUrl) dbUpdates.github_url = updates.githubUrl;
    if (updates.liveUrl) dbUpdates.live_url = updates.liveUrl;
    if (updates.techStack) dbUpdates.tech_stack = updates.techStack;
    if (updates.phase) dbUpdates.phase = updates.phase;
    if (updates.isFavorite !== undefined) dbUpdates.is_favorite = updates.isFavorite;
    dbUpdates.updated_at = new Date().toISOString();

    await supabase.from('projects' as any).update(dbUpdates).eq('id', id);
  },

  deleteProject: async (id) => {
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
      // filtering others logic...
    }));
    await supabase.from('projects' as any).delete().eq('id', id);
  },

  toggleFavorite: async (id) => {
    const project = get().projects.find(p => p.id === id);
    if (project) {
      get().updateProject(id, { isFavorite: !project.isFavorite });
    }
  },

  // ... (Keep other actions as local-only or todo)
  addNote: async (noteData) => {
    const note: DevNote = {
      ...noteData,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: noteData.tags || []
    };
    
    set((state) => ({ notes: [note, ...state.notes] }));

    const { error } = await supabase.from('dev_notes' as any).insert({
      id: note.id,
      project_id: note.projectId,
      title: note.title,
      content: note.content,
      tags: note.tags,
      user_id: (await supabase.auth.getUser()).data.user?.id
    });
     if (error) console.error("Error adding note:", error);
  },

  updateNote: async (id, updates) => {
    set((state) => ({
      notes: state.notes.map((n) => n.id === id ? { ...n, ...updates, updatedAt: new Date() } : n)
    }));

    const dbUpdates: any = { updated_at: new Date().toISOString() };
    if (updates.title) dbUpdates.title = updates.title;
    if (updates.content) dbUpdates.content = updates.content;
    if (updates.tags) dbUpdates.tags = updates.tags;
    
    const { error } = await supabase.from('dev_notes' as any).update(dbUpdates).eq('id', id);
    if (error) console.error("Error updating note:", error);
  },

  deleteNote: async (id) => {
    set((state) => ({ notes: state.notes.filter((n) => n.id !== id) }));
    const { error } = await supabase.from('dev_notes' as any).delete().eq('id', id);
    if (error) console.error("Error deleting note:", error);
  },

  addTask: async (taskData) => {
    const task: Task = {
      ...taskData,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: taskData.tags || [],
      priority: taskData.priority || 'medium',
      status: taskData.status || 'todo'
    };

    set((state) => ({ tasks: [task, ...state.tasks] }));

    const { error } = await supabase.from('tasks' as any).insert({
      id: task.id,
      project_id: task.projectId,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      due_date: task.dueDate?.toISOString(),
      tags: task.tags,
      user_id: (await supabase.auth.getUser()).data.user?.id
    });
    if (error) console.error("Error adding task:", error);
  },

  updateTask: async (id, updates) => {
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id ? { ...t, ...updates, updatedAt: new Date() } : t
      ),
    }));

    const dbUpdates: any = { updated_at: new Date().toISOString() };
    if (updates.title) dbUpdates.title = updates.title;
    if (updates.description) dbUpdates.description = updates.description;
    if (updates.status) dbUpdates.status = updates.status;
    if (updates.priority) dbUpdates.priority = updates.priority;
    if (updates.dueDate !== undefined) dbUpdates.due_date = updates.dueDate?.toISOString();
    if (updates.tags) dbUpdates.tags = updates.tags;
    // project_id is uncommon to update but possible
    if (updates.projectId) dbUpdates.project_id = updates.projectId;

    const { error } = await supabase.from('tasks' as any).update(dbUpdates).eq('id', id);
    if (error) console.error("Error updating task:", error);
  },

  deleteTask: async (id) => {
    set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }));
    const { error } = await supabase.from('tasks' as any).delete().eq('id', id);
    if (error) console.error("Error deleting task:", error);
  },

  addIssue: async (data) => {
      const issue: Issue = {
          ...data,
          id: generateId(),
          createdAt: new Date(),
          updatedAt: new Date(),
      };
      set((state) => ({ issues: [issue, ...state.issues] }));

      const { error } = await supabase.from('issues' as any).insert({
          id: issue.id,
          project_id: issue.projectId,
          title: issue.title,
          description: issue.description,
          steps_to_reproduce: issue.stepsToReproduce,
          expected_behavior: issue.expectedBehavior,
          actual_behavior: issue.actualBehavior,
          environment: issue.environment,
          severity: issue.severity,
          status: issue.status,
          related_task_id: issue.relatedTaskId,
          user_id: (await supabase.auth.getUser()).data.user?.id
      });
      if (error) console.error("Error adding issue:", error);
  },

  updateIssue: async (id, updates) => {
      set((state) => ({ issues: state.issues.map((i) => i.id === id ? { ...i, ...updates, updatedAt: new Date() } : i) }));
      
      const dbUpdates: any = { updated_at: new Date().toISOString() };
      if (updates.title) dbUpdates.title = updates.title;
      if (updates.description) dbUpdates.description = updates.description;
      if (updates.status) dbUpdates.status = updates.status;
      if (updates.severity) dbUpdates.severity = updates.severity;
      if (updates.environment) dbUpdates.environment = updates.environment;
      if (updates.stepsToReproduce) dbUpdates.steps_to_reproduce = updates.stepsToReproduce;
      if (updates.expectedBehavior) dbUpdates.expected_behavior = updates.expectedBehavior;
      if (updates.actualBehavior) dbUpdates.actual_behavior = updates.actualBehavior;
      if (updates.relatedTaskId) dbUpdates.related_task_id = updates.relatedTaskId;
      if (updates.closedAt) dbUpdates.closed_at = updates.closedAt.toISOString();

      const { error } = await supabase.from('issues' as any).update(dbUpdates).eq('id', id);
      if (error) console.error("Error updating issue:", error);
  },
  
  deleteIssue: async (id) => {
      set((state) => ({ issues: state.issues.filter((i) => i.id !== id) }));
      const { error } = await supabase.from('issues' as any).delete().eq('id', id);
      if (error) console.error("Error deleting issue:", error);
  },

  addSecret: async (data) => {
      const secret: Secret = {
          ...data,
          id: generateId(),
          createdAt: new Date(),
          updatedAt: new Date(),
      };
      set((state) => ({ secrets: [secret, ...state.secrets] }));

      const { error } = await supabase.from('secrets' as any).insert({
          id: secret.id,
          project_id: secret.projectId,
          name: secret.name,
          description: secret.description,
          value: secret.value,
          type: secret.type,
          user_id: (await supabase.auth.getUser()).data.user?.id
      });
      if (error) console.error("Error adding secret:", error);
  },

  updateSecret: async (id, updates) => {
      set((state) => ({ secrets: state.secrets.map((s) => s.id === id ? { ...s, ...updates, updatedAt: new Date() } : s) }));
      
      const dbUpdates: any = { updated_at: new Date().toISOString() };
      if (updates.name) dbUpdates.name = updates.name;
      if (updates.description) dbUpdates.description = updates.description;
      if (updates.value) dbUpdates.value = updates.value;
      if (updates.type) dbUpdates.type = updates.type;

      const { error } = await supabase.from('secrets' as any).update(dbUpdates).eq('id', id);
      if (error) console.error("Error updating secret:", error);
  },

  deleteSecret: async (id) => {
      set((state) => ({ secrets: state.secrets.filter((s) => s.id !== id) }));
      const { error } = await supabase.from('secrets' as any).delete().eq('id', id);
       if (error) console.error("Error deleting secret:", error);
  },

  addTeamMember: async (data) => {
      const member: TeamMember = {
          ...data,
          id: generateId(),
          createdAt: new Date(),
          updatedAt: new Date(),
      };
      set((state) => ({ teamMembers: [member, ...state.teamMembers] }));

      const { error } = await supabase.from('team_members' as any).insert({
          id: member.id,
          project_id: member.projectId,
          name: member.name,
          role: member.role,
          email: member.email,
          phone: member.phone,
          github_url: member.githubUrl,
          linkedin_url: member.linkedinUrl,
          notes: member.notes,
          is_active: member.isActive
      });
      if (error) console.error("Error adding team member:", error);
  },

  updateTeamMember: async (id, updates) => {
      set((state) => ({ teamMembers: state.teamMembers.map((m) => m.id === id ? { ...m, ...updates, updatedAt: new Date() } : m) }));
      
       const dbUpdates: any = { updated_at: new Date().toISOString() };
      if (updates.name) dbUpdates.name = updates.name;
      if (updates.role) dbUpdates.role = updates.role;
      if (updates.email) dbUpdates.email = updates.email;
      if (updates.phone) dbUpdates.phone = updates.phone;
      if (updates.githubUrl) dbUpdates.github_url = updates.githubUrl;
      if (updates.linkedinUrl) dbUpdates.linkedin_url = updates.linkedinUrl;
      if (updates.notes) dbUpdates.notes = updates.notes;
      if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;

      const { error } = await supabase.from('team_members' as any).update(dbUpdates).eq('id', id);
      if (error) console.error("Error updating team member:", error);
  },

  deleteTeamMember: async (id) => {
      set((state) => ({ teamMembers: state.teamMembers.filter((m) => m.id !== id) }));
       const { error } = await supabase.from('team_members' as any).delete().eq('id', id);
       if (error) console.error("Error deleting team member:", error);
  },

  addGoal: async (data) => {
      const goal: Goal = {
          ...data,
          id: generateId(),
          createdAt: new Date(),
          updatedAt: new Date(),
      };
      set((state) => ({ goals: [goal, ...state.goals] }));
      
      const { error } = await supabase.from('goals' as any).insert({
          id: goal.id,
          project_id: goal.projectId,
          title: goal.title,
          description: goal.description,
          status: goal.status,
          priority: goal.priority,
          target_date: goal.targetDate?.toISOString(),
          user_id: (await supabase.auth.getUser()).data.user?.id
      });
      if (error) console.error("Error adding goal:", error);
  },

  updateGoal: async (id, updates) => {
      set((state) => ({ goals: state.goals.map((g) => g.id === id ? { ...g, ...updates, updatedAt: new Date() } : g) }));

      const dbUpdates: any = { updated_at: new Date().toISOString() };
      if (updates.title) dbUpdates.title = updates.title;
      if (updates.description) dbUpdates.description = updates.description;
      if (updates.status) dbUpdates.status = updates.status;
      if (updates.priority) dbUpdates.priority = updates.priority;
      if (updates.targetDate) dbUpdates.target_date = updates.targetDate.toISOString();

      const { error } = await supabase.from('goals' as any).update(dbUpdates).eq('id', id);
      if (error) console.error("Error updating goal:", error);
  },

  deleteGoal: async (id) => {
       set((state) => ({ goals: state.goals.filter((g) => g.id !== id) }));
       const { error } = await supabase.from('goals' as any).delete().eq('id', id);
       if (error) console.error("Error deleting goal:", error);
  },



  journal: [],
  resources: [],
  ideas: [],
  focusSessions: [],


  addJournalEntry: async (entryData) => {
    const entry: JournalEntry = {
      ...entryData,
      id: generateId(),
      createdAt: new Date()
    };

    // Optimistic
    set((state) => ({ journal: [entry, ...state.journal] }));

    // Supabase
    const { error } = await supabase.from('journal_entries' as any).insert({
      id: entry.id,
      content: entry.content,
      mood: entry.mood,
      tags: entry.tags,
      user_id: (await supabase.auth.getUser()).data.user?.id
    });
    if (error) console.error("Error adding journal entry:", error);
  },

  updateJournalEntry: async (id, content) => {
    // Optimistic
    set((state) => ({ journal: state.journal.map(j => j.id === id ? { ...j, content } : j) }));

    // Supabase
    const { error } = await supabase.from('journal_entries' as any).update({ content }).eq('id', id);
    if (error) console.error("Error updating journal entry:", error);
  },

  deleteJournalEntry: async (id) => {
    // Optimistic
    set((state) => ({ journal: state.journal.filter(j => j.id !== id) }));

    // Supabase
    const { error } = await supabase.from('journal_entries' as any).delete().eq('id', id);
    if (error) console.error("Error deleting journal entry:", error);
  },

  addResource: (resource) => set((state) => ({ resources: [...state.resources, { ...resource, id: generateId(), createdAt: new Date() }] })),
  deleteResource: (id) => set((state) => ({ resources: state.resources.filter(r => r.id !== id) })),

  addIdea: async (ideaData) => {
    const idea: Idea = {
      ...ideaData,
      id: generateId(),
      createdAt: new Date()
    };

    // Optimistic
    set((state) => ({ ideas: [idea, ...state.ideas] }));

    // Supabase
    const { error } = await supabase.from('ideas' as any).insert({
      id: idea.id,
      content: idea.content,
      is_archived: idea.isArchived,
      user_id: (await supabase.auth.getUser()).data.user?.id
    });
    if (error) console.error("Error adding idea:", error);
  },

  updateIdea: async (id, content) => {
    // Optimistic
    set((state) => ({ ideas: state.ideas.map(i => i.id === id ? { ...i, content } : i) }));

    // Supabase
    const { error } = await supabase.from('ideas' as any).update({ content }).eq('id', id);
    if (error) console.error("Error updating idea:", error);
  },

  toggleIdeaArchived: async (id) => {
    const idea = get().ideas.find(i => i.id === id);
    if (!idea) return;

    const newStatus = !idea.isArchived;

    // Optimistic
    set((state) => ({ ideas: state.ideas.map(i => i.id === id ? { ...i, isArchived: newStatus } : i) }));

    // Supabase
    const { error } = await supabase.from('ideas' as any).update({ is_archived: newStatus }).eq('id', id);
    if (error) console.error("Error toggling idea archive:", error);
  },

  deleteIdea: async (id) => {
    // Optimistic
    set((state) => ({ ideas: state.ideas.filter(i => i.id !== id) }));

    // Supabase
    const { error } = await supabase.from('ideas' as any).delete().eq('id', id);
    if (error) console.error("Error deleting idea:", error);
  },

  addFocusSession: async (sessionData) => {
    const session: FocusSession = {
      ...sessionData,
      id: generateId(),
      completedAt: new Date()
    };

    // Optimistic
    set((state) => ({ focusSessions: [session, ...state.focusSessions] }));

    // Supabase
    const { error } = await supabase.from('focus_sessions' as any).insert({
      id: session.id,
      type: session.type,
      duration_seconds: session.durationSeconds,
      completed_at: session.completedAt.toISOString(), // ensure correct format
      user_id: (await supabase.auth.getUser()).data.user?.id
    });
  },


}));
