import { Project } from '@/features/dev/types';
import { useStore } from '@/features/dev/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  projectPhaseLabels,
  projectPhaseColors,
  formatDate,
} from '@/features/dev/lib/constants';
import { Star, Github, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const { toggleFavorite } = useStore();

  return (
    <Card className="group relative overflow-hidden card-hover cursor-pointer">
      {/* Glow effect on hover */}
      <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <CardTitle className="truncate text-lg">{project.name}</CardTitle>
            <Badge
              className={cn(
                'mt-2 border',
                projectPhaseColors[project.phase]
              )}
            >
              {projectPhaseLabels[project.phase]}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleFavorite(project.id);
            }}
          >
            <Star
              className={cn(
                'h-5 w-5 transition-colors',
                project.isFavorite
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-muted-foreground hover:text-yellow-400'
              )}
            />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
          {project.description || 'No description'}
        </p>

        {/* Tech Stack */}
        {project.techStack.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-1.5">
            {project.techStack.slice(0, 4).map((tech) => (
              <Badge key={tech} variant="secondary" className="text-xs">
                {tech}
              </Badge>
            ))}
            {project.techStack.length > 4 && (
              <Badge variant="secondary" className="text-xs">
                +{project.techStack.length - 4}
              </Badge>
            )}
          </div>
        )}

        {/* Links & Meta */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex gap-2">
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Github className="h-4 w-4" />
              </a>
            )}
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Updated {formatDate(project.updatedAt)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
