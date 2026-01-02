import { Project } from '@/features/dev/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  projectPhaseLabels,
  projectPhaseColors,
  formatDate,
  formatDateTime,
} from '@/features/dev/lib/constants';
import { Github, ExternalLink, Pencil, Calendar, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OverviewTabProps {
  project: Project;
  onEdit: () => void;
}

export function OverviewTab({ project, onEdit }: OverviewTabProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Project Info Card */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle className="text-2xl">{project.name}</CardTitle>
            <Badge
              className={cn('mt-2 border', projectPhaseColors[project.phase])}
            >
              {projectPhaseLabels[project.phase]}
            </Badge>
          </div>
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Description */}
          <div>
            <h3 className="mb-2 text-sm font-medium text-muted-foreground">
              Description
            </h3>
            <p className="text-foreground">
              {project.description || 'No description provided'}
            </p>
          </div>

          {/* Tech Stack */}
          {project.techStack.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-medium text-muted-foreground">
                Technology Stack
              </h3>
              <div className="flex flex-wrap gap-2">
                {project.techStack.map((tech) => (
                  <Badge key={tech} variant="secondary">
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Links */}
          <div className="flex flex-wrap gap-4">
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <Github className="h-4 w-4" />
                GitHub Repository
              </a>
            )}
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                Live Website
              </a>
            )}
          </div>

          {/* Dates */}
          <div className="flex flex-wrap gap-6 pt-4 border-t border-border">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Created: {formatDateTime(project.createdAt)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Updated: {formatDateTime(project.updatedAt)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
