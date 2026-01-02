import { useStore } from '@/features/dev/lib/store';
import { Project } from '@/features/dev/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  projectPhaseLabels, taskStatusLabels, issueStatusLabels, issueSeverityLabels,
  goalStatusLabels, formatDate, formatDateTime,
} from '@/features/dev/lib/constants';
import {
  FileDown, Github, ExternalLink, CheckCircle2, AlertTriangle, Target, Users,
  FileText, Bug, Rocket, Network, Database, Palette, Settings, Calendar, Clock
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useRef, useState, useEffect } from 'react';

interface ReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project;
}

export function ReportDialog({ open, onOpenChange, project }: ReportDialogProps) {
  const { notes, tasks, issues, goals, teamMembers, secrets } = useStore();
  const reportRef = useRef<HTMLDivElement>(null);
  const [diagramImages, setDiagramImages] = useState<{ arch?: string; db?: string; frontend?: string }>({});

  const projectNotes = notes.filter((n) => n.projectId === project.id).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 5);
  const projectTasks = tasks.filter((t) => t.projectId === project.id);
  const projectIssues = issues.filter((i) => i.projectId === project.id);
  const projectGoals = goals.filter((g) => g.projectId === project.id);
  const projectTeam = teamMembers.filter((m) => m.projectId === project.id);
  const projectSecrets = secrets.filter((s) => s.projectId === project.id);

  const completedTasks = projectTasks.filter(t => t.status === 'done').length;
  const taskCompletion = projectTasks.length > 0 ? Math.round((completedTasks / projectTasks.length) * 100) : 0;
  
  const tasksByStatus = {
    todo: projectTasks.filter((t) => t.status === 'todo').length,
    'in-progress': projectTasks.filter((t) => t.status === 'in-progress').length,
    done: completedTasks,
    blocked: projectTasks.filter((t) => t.status === 'blocked').length,
  };

  const issuesByStatus = {
    open: projectIssues.filter((i) => i.status === 'open').length,
    'in-progress': projectIssues.filter((i) => i.status === 'in-progress').length,
    resolved: projectIssues.filter((i) => i.status === 'resolved').length,
    closed: projectIssues.filter((i) => i.status === 'closed').length,
  };

  const openTasks = projectTasks.filter((t) => t.status !== 'done');
  const openIssues = projectIssues.filter((i) => i.status === 'open' || i.status === 'in-progress');
  const upcomingGoals = projectGoals.filter((g) => g.status === 'planned' || g.status === 'in-progress');
  const criticalIssues = projectIssues.filter(i => i.severity === 'critical' && i.status !== 'closed').length;

  // Load diagram images from localStorage
  useEffect(() => {
    if (open) {
      const loadDiagramImages = async () => {
        const images: typeof diagramImages = {};
        // For now, we'll note that diagrams exist
        const archData = localStorage.getItem(`architecture-diagram-${project.id}`);
        const dbData = localStorage.getItem(`database-diagram-${project.id}`);
        const frontendData = localStorage.getItem(`frontend-diagram-${project.id}`);
        
        if (archData) images.arch = 'exists';
        if (dbData) images.db = 'exists';
        if (frontendData) images.frontend = 'exists';
        setDiagramImages(images);
      };
      loadDiagramImages();
    }
  }, [open, project.id]);

  const handleDownloadPDF = async () => {
    const doc = new jsPDF();
    let y = 15;
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    const contentWidth = pageWidth - margin * 2;

    // Header with gradient-like effect
    doc.setFillColor(99, 102, 241); // Indigo
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text(project.name, margin, 25);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Phase: ${projectPhaseLabels[project.phase]} | Generated: ${formatDateTime(new Date())}`, margin, 35);
    
    y = 50;
    doc.setTextColor(0, 0, 0);

    // Project Overview Card
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, y, contentWidth, 35, 3, 3, 'F');
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('📋 Project Overview', margin + 5, y + 10);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    if (project.description) {
      const descLines = doc.splitTextToSize(project.description, contentWidth - 10);
      doc.text(descLines.slice(0, 2), margin + 5, y + 18);
    }
    
    if (project.techStack.length > 0) {
      doc.text(`Tech: ${project.techStack.slice(0, 5).join(' • ')}`, margin + 5, y + 30);
    }
    
    y += 45;

    // Stats Cards Row
    const cardWidth = (contentWidth - 15) / 4;
    const stats = [
      { label: 'Tasks', value: projectTasks.length, icon: '📝', color: [59, 130, 246] },
      { label: 'Done', value: completedTasks, icon: '✅', color: [34, 197, 94] },
      { label: 'Issues', value: projectIssues.length, icon: '🐛', color: [239, 68, 68] },
      { label: 'Goals', value: projectGoals.length, icon: '🎯', color: [168, 85, 247] },
    ];

    stats.forEach((stat, i) => {
      const x = margin + i * (cardWidth + 5);
      doc.setFillColor(stat.color[0], stat.color[1], stat.color[2]);
      doc.roundedRect(x, y, cardWidth, 25, 2, 2, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(stat.value.toString(), x + cardWidth / 2, y + 12, { align: 'center' });
      
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(stat.label, x + cardWidth / 2, y + 20, { align: 'center' });
    });
    
    y += 35;
    doc.setTextColor(0, 0, 0);

    // Progress Bar
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`Task Completion: ${taskCompletion}%`, margin, y);
    y += 5;
    
    doc.setFillColor(229, 231, 235);
    doc.roundedRect(margin, y, contentWidth, 6, 2, 2, 'F');
    doc.setFillColor(34, 197, 94);
    doc.roundedRect(margin, y, contentWidth * (taskCompletion / 100), 6, 2, 2, 'F');
    y += 15;

    // Tasks Table
    if (projectTasks.length > 0) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('📋 Tasks', margin, y);
      y += 5;

      autoTable(doc, {
        startY: y,
        head: [['Title', 'Priority', 'Status', 'Due Date']],
        body: projectTasks.slice(0, 8).map((t) => [
          t.title.substring(0, 40),
          t.priority.toUpperCase(),
          taskStatusLabels[t.status],
          t.dueDate ? formatDate(t.dueDate) : '-',
        ]),
        margin: { left: margin, right: margin },
        headStyles: { fillColor: [99, 102, 241], textColor: 255 },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        styles: { fontSize: 8 },
      });
      y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
    }

    // Issues Table
    if (projectIssues.length > 0) {
      if (y > 240) { doc.addPage(); y = 20; }
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('🐛 Issues', margin, y);
      y += 5;

      autoTable(doc, {
        startY: y,
        head: [['Title', 'Severity', 'Status', 'Environment']],
        body: projectIssues.slice(0, 8).map((i) => [
          i.title.substring(0, 40),
          issueSeverityLabels[i.severity],
          issueStatusLabels[i.status],
          i.environment,
        ]),
        margin: { left: margin, right: margin },
        headStyles: { fillColor: [239, 68, 68], textColor: 255 },
        alternateRowStyles: { fillColor: [254, 242, 242] },
        styles: { fontSize: 8 },
      });
      y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
    }

    // Goals
    if (upcomingGoals.length > 0) {
      if (y > 240) { doc.addPage(); y = 20; }
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('🎯 Goals', margin, y);
      y += 5;

      autoTable(doc, {
        startY: y,
        head: [['Goal', 'Status', 'Priority', 'Target']],
        body: upcomingGoals.map((g) => [
          g.title.substring(0, 40),
          goalStatusLabels[g.status],
          g.priority,
          g.targetDate ? formatDate(g.targetDate) : '-',
        ]),
        margin: { left: margin, right: margin },
        headStyles: { fillColor: [168, 85, 247], textColor: 255 },
        alternateRowStyles: { fillColor: [250, 245, 255] },
        styles: { fontSize: 8 },
      });
      y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
    }

    // Team
    if (projectTeam.length > 0) {
      if (y > 240) { doc.addPage(); y = 20; }
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('👥 Team', margin, y);
      y += 5;

      autoTable(doc, {
        startY: y,
        head: [['Name', 'Role', 'Email', 'Status']],
        body: projectTeam.map((m) => [m.name, m.role, m.email, m.isActive ? '✓ Active' : 'Inactive']),
        margin: { left: margin, right: margin },
        headStyles: { fillColor: [14, 165, 233], textColor: 255 },
        styles: { fontSize: 8 },
      });
      y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
    }

    // System Design Summary
    if (diagramImages.arch || diagramImages.db || diagramImages.frontend) {
      if (y > 240) { doc.addPage(); y = 20; }
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('🏗️ System Design', margin, y);
      y += 8;
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      const diagrams = [];
      if (diagramImages.arch) diagrams.push('✓ Backend Architecture');
      if (diagramImages.db) diagrams.push('✓ Database Schema');
      if (diagramImages.frontend) diagrams.push('✓ Frontend Design');
      doc.text(diagrams.join('  |  '), margin, y);
      y += 10;
    }

    // Notes
    if (projectNotes.length > 0) {
      if (y > 240) { doc.addPage(); y = 20; }
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('📝 Recent Notes', margin, y);
      y += 8;
      
      projectNotes.slice(0, 3).forEach((note) => {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text(`• ${note.title}`, margin, y);
        y += 5;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        const lines = doc.splitTextToSize(note.content.substring(0, 100), contentWidth - 10);
        doc.text(lines.slice(0, 2), margin + 5, y);
        y += lines.slice(0, 2).length * 4 + 5;
      });
    }

    // Footer
    doc.setFillColor(248, 250, 252);
    doc.rect(0, 280, pageWidth, 20, 'F');
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(`${project.name} | ${projectSecrets.length} secrets (not included) | devdash v1.2`, margin, 288);
    doc.text(`Page 1`, pageWidth - margin, 288, { align: 'right' });

    doc.save(`${project.name.replace(/\s+/g, '_')}_Report.pdf`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-none !w-[95vw] max-h-[90vh]">
        <DialogHeader className="flex flex-row items-center justify-between pb-4 border-b">
          <div>
            <DialogTitle className="text-2xl font-bold">{project.name}</DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">Project Report</p>
          </div>
          <Button onClick={handleDownloadPDF} className="gap-2">
            <FileDown className="h-4 w-4" /> Download PDF
          </Button>
        </DialogHeader>
        
        <ScrollArea className="max-h-[70vh] pr-4" ref={reportRef}>
          <div className="space-y-6 py-4">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold">{project.name}</h1>
                  <Badge className="mt-2 bg-white/20 hover:bg-white/30">{projectPhaseLabels[project.phase]}</Badge>
                  {project.description && <p className="mt-3 text-white/80 max-w-2xl">{project.description}</p>}
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold">{taskCompletion}%</div>
                  <div className="text-sm text-white/70">Complete</div>
                </div>
              </div>
              
              {project.techStack.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {project.techStack.map((tech) => (
                    <Badge key={tech} variant="outline" className="bg-white/10 border-white/30 text-white">{tech}</Badge>
                  ))}
                </div>
              )}
              
              <div className="flex gap-4 mt-4">
                {project.githubUrl && (
                  <a href={project.githubUrl} target="_blank" className="flex items-center gap-2 text-sm text-white/80 hover:text-white">
                    <Github className="h-4 w-4" /> GitHub
                  </a>
                )}
                {project.liveUrl && (
                  <a href={project.liveUrl} target="_blank" className="flex items-center gap-2 text-sm text-white/80 hover:text-white">
                    <ExternalLink className="h-4 w-4" /> Live Site
                  </a>
                )}
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
                <CardContent className="pt-4 text-center">
                  <FileText className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                  <div className="text-3xl font-bold text-blue-600">{projectTasks.length}</div>
                  <div className="text-sm text-blue-600/70">Total Tasks</div>
                </CardContent>
              </Card>
              <Card className="bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800">
                <CardContent className="pt-4 text-center">
                  <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-500" />
                  <div className="text-3xl font-bold text-green-600">{completedTasks}</div>
                  <div className="text-sm text-green-600/70">Completed</div>
                </CardContent>
              </Card>
              <Card className="bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800">
                <CardContent className="pt-4 text-center">
                  <Bug className="w-8 h-8 mx-auto mb-2 text-red-500" />
                  <div className="text-3xl font-bold text-red-600">{openIssues.length}</div>
                  <div className="text-sm text-red-600/70">Open Issues</div>
                  {criticalIssues > 0 && <Badge variant="destructive" className="mt-1">{criticalIssues} Critical</Badge>}
                </CardContent>
              </Card>
              <Card className="bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800">
                <CardContent className="pt-4 text-center">
                  <Target className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                  <div className="text-3xl font-bold text-purple-600">{upcomingGoals.length}</div>
                  <div className="text-sm text-purple-600/70">Active Goals</div>
                </CardContent>
              </Card>
            </div>

            {/* Task Progress */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2"><Rocket className="w-5 h-5" /> Task Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-2 flex justify-between text-sm">
                  <span>{completedTasks} of {projectTasks.length} tasks</span>
                  <span className="font-bold">{taskCompletion}%</span>
                </div>
                <Progress value={taskCompletion} className="h-3" />
                <div className="grid grid-cols-4 gap-2 mt-4">
                  {Object.entries(tasksByStatus).map(([status, count]) => (
                    <div key={status} className="text-center p-2 rounded-lg bg-muted/50">
                      <div className="text-xl font-bold">{count}</div>
                      <div className="text-xs text-muted-foreground">{taskStatusLabels[status as keyof typeof taskStatusLabels]}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* System Design */}
            {(diagramImages.arch || diagramImages.db || diagramImages.frontend) && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2"><Network className="w-5 h-5" /> System Design</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    {diagramImages.arch && (
                      <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 text-center">
                        <Network className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                        <div className="font-medium">Backend Architecture</div>
                        <div className="text-xs text-muted-foreground">Diagram created</div>
                      </div>
                    )}
                    {diagramImages.db && (
                      <div className="p-4 rounded-lg bg-violet-50 dark:bg-violet-950/30 text-center">
                        <Database className="w-8 h-8 mx-auto mb-2 text-violet-500" />
                        <div className="font-medium">Database Schema</div>
                        <div className="text-xs text-muted-foreground">Diagram created</div>
                      </div>
                    )}
                    {diagramImages.frontend && (
                      <div className="p-4 rounded-lg bg-pink-50 dark:bg-pink-950/30 text-center">
                        <Palette className="w-8 h-8 mx-auto mb-2 text-pink-500" />
                        <div className="font-medium">Frontend Design</div>
                        <div className="text-xs text-muted-foreground">Diagram created</div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Open Tasks */}
            {openTasks.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-yellow-500" /> Open Tasks ({openTasks.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {openTasks.slice(0, 5).map((task) => (
                      <div key={task.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div>
                          <div className="font-medium">{task.title}</div>
                          {task.dueDate && (
                            <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                              <Calendar className="w-3 h-3" /> Due: {formatDate(task.dueDate)}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Badge variant={task.priority === 'critical' ? 'destructive' : task.priority === 'high' ? 'default' : 'secondary'}>
                            {task.priority}
                          </Badge>
                          <Badge variant="outline">{taskStatusLabels[task.status]}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Goals */}
            {upcomingGoals.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2"><Target className="w-5 h-5 text-purple-500" /> Goals</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {upcomingGoals.map((goal) => (
                      <div key={goal.id} className="p-3 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30">
                        <div className="font-medium">{goal.title}</div>
                        <div className="flex items-center justify-between mt-2">
                          <Badge variant="outline">{goalStatusLabels[goal.status]}</Badge>
                          {goal.targetDate && <span className="text-xs text-muted-foreground">{formatDate(goal.targetDate)}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Team */}
            {projectTeam.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2"><Users className="w-5 h-5 text-cyan-500" /> Team ({projectTeam.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {projectTeam.map((member) => (
                      <div key={member.id} className="p-3 rounded-lg bg-muted/50 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-bold">
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium">{member.name}</div>
                          <div className="text-xs text-muted-foreground">{member.role}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Settings className="w-4 h-4" /> {projectSecrets.length} Secrets stored
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="w-4 h-4" /> {projectNotes.length} Notes
                </div>
              </div>
              <div className="text-xs text-muted-foreground flex items-center gap-2">
                <Clock className="w-3 h-3" /> Updated: {formatDateTime(project.updatedAt)}
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
