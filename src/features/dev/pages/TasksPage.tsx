import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useStore } from '@/features/dev/lib/store';
import { MainLayout } from '@/features/dev/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Plus, Calendar as CalendarIcon } from 'lucide-react';
import { Task, TaskStatus, TaskPriority } from '@/features/dev/types';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface TaskColumn {
  id: TaskStatus;
  title: string;
}

const COLUMNS: TaskColumn[] = [
  { id: 'todo', title: 'To Do' },
  { id: 'in-progress', title: 'In Progress' },
  { id: 'blocked', title: 'Blocked' },
  { id: 'done', title: 'Done' },
];

export default function TasksPage() {
  const navigate = useNavigate();
  const { tasks, projects, addTask, updateTask, deleteTask } = useStore();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    projectId: string;
    priority: TaskPriority;
    status: TaskStatus;
    dueDate: string;
    tags: string[];
  }>({
    title: '',
    description: '',
    projectId: 'none',
    priority: 'medium',
    status: 'todo',
    dueDate: '',
    tags: [],
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      projectId: 'none',
      priority: 'medium',
      status: 'todo',
      dueDate: '',
      tags: [],
    });
    setEditingTask(null);
  };

  const handleSave = () => {
    const taskData = {
      title: formData.title,
      description: formData.description,
      projectId: formData.projectId === 'none' ? undefined : formData.projectId,
      priority: formData.priority,
      status: formData.status,
      dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
      tags: [],
    };

    if (editingTask) {
      updateTask(editingTask.id, taskData);
    } else {
      addTask(taskData);
    }
    setIsAddOpen(false);
    setIsEditOpen(false);
    resetForm();
  };

  const openEdit = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      projectId: task.projectId || 'none',
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate ? task.dueDate.toISOString().split('T')[0] : '',
      tags: task.tags || [],
    });
    setIsEditOpen(true);
  };
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const tasksByStatus = useMemo(() => {
    const grouped: Record<TaskStatus, Task[]> = {
      todo: [],
      'in-progress': [],
      done: [],
      blocked: [],
    };
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    tasks.forEach((task) => {
      // Filter out 'done' tasks older than 24 hours
      if (task.status === 'done' && task.updatedAt) {
        const updatedAt = new Date(task.updatedAt);
        if (updatedAt < twentyFourHoursAgo) {
          return; // Skip this task
        }
      }

      if (grouped[task.status]) {
        grouped[task.status].push(task);
      } else {
           // fallback
           grouped['todo'].push(task);
      }
    });
    return grouped;
  }, [tasks]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeTask = tasks.find((t) => t.id === activeId);
    if (!activeTask) return;

    // Dropped over a container (column)
    if (COLUMNS.some((col) => col.id === overId)) {
        if (activeTask.status !== overId) {
            updateTask(activeId, { status: overId as TaskStatus });
        }
        return;
    }

    // Dropped over another item
    const overTask = tasks.find((t) => t.id === overId);
    if (overTask && activeTask.status !== overTask.status) {
        updateTask(activeId, { status: overTask.status });
    }
    
    setActiveId(null);
  };

  const handleTaskClick = (task: Task) => {
    if (task.projectId) {
      navigate(`/dev/projects/${task.projectId}?tab=tasks`);
    } else {
      openEdit(task);
    }
  };

  return (
    <MainLayout>
      <div className="p-2 h-[calc(100vh-1rem)] flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h1 className="font-mono text-2xl font-bold bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent">
            Task Board
          </h1>
          <Button onClick={() => { resetForm(); setIsAddOpen(true); }} className="gap-2">
            <Plus className="w-4 h-4" /> Add Task
          </Button>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex-1 flex gap-4 overflow-x-auto pb-4 items-start">
            {COLUMNS.map((col) => (
              <TaskBoardColumn
                key={col.id}
                col={col}
                tasks={tasksByStatus[col.id]}
                onTaskClick={handleTaskClick}
              />
            ))}
          </div>

           <DragOverlay>
            {activeId ? (
              <TaskCard task={tasks.find((t) => t.id === activeId)!} />
            ) : null}
          </DragOverlay>

        </DndContext>

        {/* Add/Edit Dialog */}
        <Dialog open={isAddOpen || isEditOpen} onOpenChange={(open) => !open && (isAddOpen ? setIsAddOpen(false) : setIsEditOpen(false))}>
            <DialogContent className="sm:max-w-none !w-[95vw] sm:!w-[95vw] max-w-[95vw] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEditOpen ? 'Edit Task' : 'Create New Task'}</DialogTitle>
                    <DialogDescription>
                        {isEditOpen ? 'Update task details.' : 'Add a new task to your board.'}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input id="title" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="Task title" />
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="project">Project</Label>
                        <Select value={formData.projectId} onValueChange={(v) => setFormData({...formData, projectId: v})}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Project" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">No Project (General)</SelectItem>
                                {projects.map(p => (
                                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                             <Select value={formData.status} onValueChange={(v) => setFormData({...formData, status: v as TaskStatus})}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="todo">To Do</SelectItem>
                                    <SelectItem value="in-progress">In Progress</SelectItem>
                                    <SelectItem value="blocked">Blocked</SelectItem>
                                    <SelectItem value="done">Done</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="priority">Priority</Label>
                             <Select value={formData.priority} onValueChange={(v) => setFormData({...formData, priority: v as TaskPriority})}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="critical">Critical</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                         <Label htmlFor="desc">Description</Label>
                         <Textarea id="desc" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Task details..." />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="due">Due Date</Label>
                        <Input id="due" type="date" value={formData.dueDate} onChange={(e) => setFormData({...formData, dueDate: e.target.value})} />
                    </div>

                </div>
                <DialogFooter>
                    {isEditOpen && (
                        <Button variant="destructive" className="mr-auto" onClick={() => { deleteTask(editingTask!.id); setIsEditOpen(false); }}>
                            Delete
                        </Button>
                    )}
                    <Button variant="outline" onClick={() => { setIsAddOpen(false); setIsEditOpen(false); }}>Cancel</Button>
                    <Button onClick={handleSave}>Save</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

      </div>
    </MainLayout>
  );
}

interface TaskBoardColumnProps {
  col: TaskColumn;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

function TaskBoardColumn({ col, tasks, onTaskClick }: TaskBoardColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: col.id,
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex-shrink-0 w-[250px] flex flex-col h-full bg-muted/30 rounded-lg p-4 border border-border/50",
        isOver && "bg-muted/70 ring-2 ring-primary/20"
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm uppercase text-muted-foreground">{col.title}</h3>
        <Badge variant="secondary" className="text-xs">{tasks.length}</Badge>
      </div>
      
      <SortableContext
          id={col.id}
          items={tasks.map(t => t.id)}
          strategy={verticalListSortingStrategy}
      >
          <div className="flex-1 space-y-3 min-h-[100px]">
              {tasks.map((task) => (
                <SortableTaskItem 
                  key={task.id} 
                  task={task} 
                  onClick={() => onTaskClick(task)} 
                />
              ))}
          </div>
      </SortableContext>
    </div>
  );
}

function SortableTaskItem({ task, onClick }: { task: Task; onClick: () => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} onClick={onClick}>
      <TaskCard task={task} />
    </div>
  );
}

function TaskCard({ task }: { task: Task }) {
    const { projects } = useStore();
    const project = task.projectId ? projects.find(p => p.id === task.projectId) : null;

    const priorityColors: Record<TaskPriority, string> = {
        low: 'bg-slate-500/10 text-slate-500',
        medium: 'bg-blue-500/10 text-blue-500',
        high: 'bg-orange-500/10 text-orange-500',
        critical: 'bg-red-500/10 text-red-500',
    };

    return (
        <div className="group bg-card hover:bg-accent/50 p-3 rounded-md border shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md transition-all relative">
            <div className="flex justify-between items-start mb-2">
                <span className={cn("text-[10px] uppercase font-bold px-1.5 py-0.5 rounded", priorityColors[task.priority])}>
                    {task.priority}
                </span>
                {project && (
                    <span className="text-[10px] text-muted-foreground truncate max-w-[80px] bg-muted px-1 rounded" title={project.name}>
                        {project.name}
                    </span>
                )}
            </div>
            <h4 className="font-medium text-sm mb-1 line-clamp-2">{task.title}</h4>
             {task.dueDate && (
                 <div className="flex items-center text-[10px] text-muted-foreground mt-2">
                     <CalendarIcon className="w-3 h-3 mr-1" />
                     {format(task.dueDate, 'MMM d')}
                 </div>
             )}
        </div>
    );
}
