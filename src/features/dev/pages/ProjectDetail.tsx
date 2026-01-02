import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useStore } from '@/features/dev/lib/store';
import { MainLayout } from '@/features/dev/components/layout/MainLayout';
import { ProjectFormDialog } from '@/features/dev/components/projects/ProjectFormDialog';
import { OverviewTab } from '@/features/dev/components/project-tabs/OverviewTab';
import { NotesTab } from '@/features/dev/components/project-tabs/NotesTab';
import { TasksTab } from '@/features/dev/components/project-tabs/TasksTab';
import { IssuesTab } from '@/features/dev/components/project-tabs/IssuesTab';
import { SecretsTab } from '@/features/dev/components/project-tabs/SecretsTab';
import { TeamTab } from '@/features/dev/components/project-tabs/TeamTab';
import { GoalsTab } from '@/features/dev/components/project-tabs/GoalsTab';
import { ReportDialog } from '@/features/dev/components/projects/ReportDialog';
import { BackupsDialog } from '@/features/dev/components/projects/BackupsDialog';
import { SystemDesignTab } from '@/features/dev/components/system-design';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  ArrowLeft,
  FileText,
  FileDown,
  HardDrive,
  Pencil,
  Trash2,
} from 'lucide-react';
import { ProjectVault } from '@/features/dev/components/pro-features/ProjectVault';
import { toast } from 'sonner';

type TabValue = 'overview' | 'notes' | 'tasks' | 'issues' | 'secrets' | 'team' | 'goals' | 'vault' | 'system-design';

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { projects, deleteProject, isInitialized } = useStore();
  
  const initialTab = (searchParams.get('tab') as TabValue) || 'overview';
  const [activeTab, setActiveTab] = useState<TabValue>(initialTab);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [isBackupsDialogOpen, setIsBackupsDialogOpen] = useState(false);

  useEffect(() => {
    const tabParam = searchParams.get('tab') as TabValue;
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const project = projects.find((p) => p.id === id);

  // Wait for initialization before deciding if project is missing
  if (!isInitialized) {
      return (
          <MainLayout>
              <div className="flex flex-col items-center justify-center min-h-screen">
                  <p className="text-muted-foreground">Loading project...</p>
              </div>
          </MainLayout>
      );
  }

  if (!project) {
    // If initialized and no project, redirect
    setTimeout(() => navigate('/dev'), 2000);
    
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <h1 className="font-mono text-2xl font-bold text-foreground">
            Project not found
          </h1>
          <p className="text-muted-foreground mt-2">Redirecting to dashboard...</p>
          <Link to="/" className="mt-4 text-primary hover:underline">
            Back to Dashboard
          </Link>
        </div>
      </MainLayout>
    );
  }

  const handleDelete = () => {
    deleteProject(project.id);
    toast.success('Project deleted successfully');
    navigate('/dev');
  };

  return (
    <MainLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dev')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="font-mono text-2xl font-bold text-foreground">
                {project.name}
              </h1>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setIsReportDialogOpen(true)}>
              <FileText className="mr-2 h-4 w-4" />
              Open Report
            </Button>
            <Button variant="outline" onClick={() => setIsBackupsDialogOpen(true)}>
              <HardDrive className="mr-2 h-4 w-4" />
              Backups
            </Button>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(true)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs 
          value={activeTab} 
          onValueChange={(v) => {
            setActiveTab(v as TabValue);
            navigate(`?tab=${v}`, { replace: true });
          }}
        >
          <TabsList className="mb-6 w-full justify-start overflow-x-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="notes">Dev Notes</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="issues">Issues</TabsTrigger>
            <TabsTrigger value="vault">Vault</TabsTrigger>
            <TabsTrigger value="secrets">Secrets</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
            <TabsTrigger value="system-design">Backend & Database Design</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <OverviewTab project={project} onEdit={() => setIsEditDialogOpen(true)} />
          </TabsContent>
          <TabsContent value="notes">
            <NotesTab projectId={project.id} />
          </TabsContent>
          <TabsContent value="tasks">
            <TasksTab projectId={project.id} />
          </TabsContent>
          <TabsContent value="issues">
            <IssuesTab projectId={project.id} />
          </TabsContent>
          <TabsContent value="vault">
            <ProjectVault projectId={project.id} />
          </TabsContent>
          <TabsContent value="secrets">
            <SecretsTab projectId={project.id} />
          </TabsContent>
          <TabsContent value="team">
            <TeamTab projectId={project.id} />
          </TabsContent>
          <TabsContent value="goals">
            <GoalsTab projectId={project.id} />
          </TabsContent>
          <TabsContent value="system-design">
            <SystemDesignTab projectId={project.id} />
          </TabsContent>
        </Tabs>

        {/* Dialogs */}
        <ProjectFormDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          project={project}
        />

        <ReportDialog
          open={isReportDialogOpen}
          onOpenChange={setIsReportDialogOpen}
          project={project}
        />

        <BackupsDialog
          open={isBackupsDialogOpen}
          onOpenChange={setIsBackupsDialogOpen}
          project={project}
        />

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Project</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{project.name}"? This action cannot be
                undone and will remove all associated notes, tasks, issues, secrets,
                team members, goals, and backups.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </MainLayout>
  );
}
