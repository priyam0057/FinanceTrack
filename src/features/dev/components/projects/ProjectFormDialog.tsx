import { useState, useEffect } from 'react';
import { useStore } from '@/features/dev/lib/store';
import { Project, ProjectPhase } from '@/features/dev/types';
import { projectPhaseLabels } from '@/features/dev/lib/constants';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { toast } from 'sonner';

interface ProjectFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: Project;
}

export function ProjectFormDialog({
  open,
  onOpenChange,
  project,
}: ProjectFormDialogProps) {
  const { addProject, updateProject } = useStore();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    githubUrl: '',
    liveUrl: '',
    phase: 'in-development' as ProjectPhase,
    techStack: [] as string[],
  });
  const [techInput, setTechInput] = useState('');

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        description: project.description,
        githubUrl: project.githubUrl || '',
        liveUrl: project.liveUrl || '',
        phase: project.phase,
        techStack: project.techStack,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        githubUrl: '',
        liveUrl: '',
        phase: 'in-development',
        techStack: [],
      });
    }
    setTechInput('');
  }, [project, open]);

  const handleAddTech = () => {
    if (techInput.trim() && !formData.techStack.includes(techInput.trim())) {
      setFormData({
        ...formData,
        techStack: [...formData.techStack, techInput.trim()],
      });
      setTechInput('');
    }
  };

  const handleRemoveTech = (tech: string) => {
    setFormData({
      ...formData,
      techStack: formData.techStack.filter((t) => t !== tech),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Project name is required');
      return;
    }

    if (project) {
      updateProject(project.id, formData);
      toast.success('Project updated successfully');
    } else {
      addProject({ ...formData, isFavorite: false });
      toast.success('Project created successfully');
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-none !w-[95vw] sm:!w-[95vw] max-w-[95vw]">
        <DialogHeader>
          <DialogTitle className="font-mono">
            {project ? 'Edit Project' : 'Create New Project'}
          </DialogTitle>
          <DialogDescription>
            {project ? 'Update the project details below.' : 'Fill in the details for your new project.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Project Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="My Awesome Project"
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
              placeholder="What does this project do?"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phase">Phase</Label>
            <Select
              value={formData.phase}
              onValueChange={(value: ProjectPhase) =>
                setFormData({ ...formData, phase: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(projectPhaseLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="techStack">Tech Stack</Label>
            <div className="flex gap-2">
              <Input
                id="techStack"
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                placeholder="Add technology..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTech();
                  }
                }}
              />
              <Button type="button" variant="secondary" onClick={handleAddTech}>
                Add
              </Button>
            </div>
            {formData.techStack.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {formData.techStack.map((tech) => (
                  <Badge
                    key={tech}
                    variant="secondary"
                    className="gap-1 pr-1"
                  >
                    {tech}
                    <button
                      type="button"
                      onClick={() => handleRemoveTech(tech)}
                      className="ml-1 rounded-full p-0.5 hover:bg-muted"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="githubUrl">GitHub URL</Label>
            <Input
              id="githubUrl"
              value={formData.githubUrl}
              onChange={(e) =>
                setFormData({ ...formData, githubUrl: e.target.value })
              }
              placeholder="https://github.com/..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="liveUrl">Live URL</Label>
            <Input
              id="liveUrl"
              value={formData.liveUrl}
              onChange={(e) =>
                setFormData({ ...formData, liveUrl: e.target.value })
              }
              placeholder="https://..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {project ? 'Save Changes' : 'Create Project'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
