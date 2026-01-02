import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '@/features/dev/lib/store';
import { MainLayout } from '@/features/dev/components/layout/MainLayout';
import { ProjectCard } from '@/features/dev/components/projects/ProjectCard';
import { ProjectFormDialog } from '@/features/dev/components/projects/ProjectFormDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Search, Sparkles } from 'lucide-react';
import { ProjectPhase } from '@/features/dev/types';
import { projectPhaseLabels } from '@/features/dev/lib/constants';
import { GoogleDriveConnect } from '@/features/dev/components/common/GoogleDriveConnect';

export default function Dashboard() {
  const { projects, initialize } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [phaseFilter, setPhaseFilter] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  useEffect(() => {
    // Initialization handled by MainLayout
  }, []);


  const filteredProjects = projects
    .filter((project) => {
      const matchesSearch = project.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesPhase =
        phaseFilter === 'all' || project.phase === phaseFilter;
      return matchesSearch && matchesPhase;
    })
    .sort((a, b) => {
      // Favorites first, then by updated date
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

  return (
    <MainLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-mono text-3xl font-bold text-foreground">
            Dashboard
          </h1>
          <p className="mt-2 text-muted-foreground">
            Manage all your development projects in one place
          </p>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground">Total Projects</p>
            <p className="mt-2 font-mono text-3xl font-bold text-foreground">
              {projects.length}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground">In Development</p>
            <p className="mt-2 font-mono text-3xl font-bold text-info">
              {projects.filter((p) => p.phase === 'in-development').length}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground">Running</p>
            <p className="mt-2 font-mono text-3xl font-bold text-primary">
              {projects.filter((p) => p.phase === 'running').length}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground">Completed</p>
            <p className="mt-2 font-mono text-3xl font-bold text-success">
              {projects.filter((p) => p.phase === 'completed').length}
            </p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={phaseFilter} onValueChange={setPhaseFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by phase" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Phases</SelectItem>
                {Object.entries(projectPhaseLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <GoogleDriveConnect />
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </div>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredProjects.map((project, index) => (
              <div
                key={project.id}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <Link to={`/dev/projects/${project.id}`}>
                  <ProjectCard project={project} />
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 py-20">
            <Sparkles className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 font-mono text-lg font-medium text-foreground">
              No projects yet
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Create your first project to get started
            </p>
            <Button
              className="mt-6"
              onClick={() => setIsCreateDialogOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Project
            </Button>
          </div>
        )}

        <ProjectFormDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
        />
      </div>
    </MainLayout>
  );
}
