import { useState } from 'react';
import { useStore } from '@/features/dev/lib/store';
import { TeamMember } from '@/features/dev/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Search, Pencil, Trash2, Users, Mail, Phone, Github, Linkedin } from 'lucide-react';
import { toast } from 'sonner';

interface TeamTabProps {
  projectId: string;
}

export function TeamTab({ projectId }: TeamTabProps) {
  const { teamMembers, addTeamMember, updateTeamMember, deleteTeamMember } =
    useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    email: '',
    phone: '',
    githubUrl: '',
    linkedinUrl: '',
    notes: '',
    isActive: true,
  });

  const projectMembers = teamMembers
    .filter((member) => member.projectId === projectId)
    .filter(
      (member) =>
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.role.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (a.isActive && !b.isActive) return -1;
      if (!a.isActive && b.isActive) return 1;
      return a.name.localeCompare(b.name);
    });

  const activeMembersCount = teamMembers.filter(
    (m) => m.projectId === projectId && m.isActive
  ).length;

  const handleOpenDialog = (member?: TeamMember) => {
    if (member) {
      setEditingMember(member);
      setFormData({
        name: member.name,
        role: member.role,
        email: member.email,
        phone: member.phone || '',
        githubUrl: member.githubUrl || '',
        linkedinUrl: member.linkedinUrl || '',
        notes: member.notes || '',
        isActive: member.isActive,
      });
    } else {
      setEditingMember(null);
      setFormData({
        name: '',
        role: '',
        email: '',
        phone: '',
        githubUrl: '',
        linkedinUrl: '',
        notes: '',
        isActive: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }
    if (!formData.email.trim()) {
      toast.error('Email is required');
      return;
    }

    const memberData = {
      ...formData,
      phone: formData.phone || undefined,
      githubUrl: formData.githubUrl || undefined,
      linkedinUrl: formData.linkedinUrl || undefined,
      notes: formData.notes || undefined,
    };

    if (editingMember) {
      updateTeamMember(editingMember.id, memberData);
      toast.success('Team member updated');
    } else {
      addTeamMember({ ...memberData, projectId });
      toast.success('Team member added');
    }
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    deleteTeamMember(id);
    toast.success('Team member removed');
  };

  const toggleActive = (id: string, isActive: boolean) => {
    updateTeamMember(id, { isActive });
    toast.success(isActive ? 'Member activated' : 'Member deactivated');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats */}
      <div className="flex items-center gap-4 p-4 rounded-lg bg-card border border-border">
        <Users className="h-5 w-5 text-primary" />
        <span className="text-sm text-muted-foreground">
          <span className="font-mono font-bold text-foreground">
            {activeMembersCount}
          </span>{' '}
          active team {activeMembersCount === 1 ? 'member' : 'members'}
        </span>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search team members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Add Member
        </Button>
      </div>

      {/* Team Members List */}
      {projectMembers.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {projectMembers.map((member) => (
            <Card
              key={member.id}
              className={`card-hover ${!member.isActive ? 'opacity-60' : ''}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-mono font-medium text-foreground truncate">
                        {member.name}
                      </h3>
                      {!member.isActive && (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </div>
                    <p className="mb-3 text-sm text-primary">{member.role}</p>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-3.5 w-3.5" />
                        <a
                          href={`mailto:${member.email}`}
                          className="hover:text-foreground transition-colors truncate"
                        >
                          {member.email}
                        </a>
                      </div>
                      {member.phone && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-3.5 w-3.5" />
                          <span>{member.phone}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 mt-3">
                      {member.githubUrl && (
                        <a
                          href={member.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Github className="h-4 w-4" />
                        </a>
                      )}
                      {member.linkedinUrl && (
                        <a
                          href={member.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Linkedin className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleOpenDialog(member)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => handleDelete(member.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 py-16">
          <Users className="h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 font-mono text-lg font-medium text-foreground">
            No team members
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Add team members working on this project
          </p>
          <Button className="mt-6" onClick={() => handleOpenDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            Add Member
          </Button>
        </div>
      )}

      {/* Team Member Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-mono">
              {editingMember ? 'Edit Team Member' : 'Add Team Member'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                <Input
                  id="role"
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  placeholder="Backend Developer"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="john@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="+1 234 567 8900"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
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
                <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
                <Input
                  id="linkedinUrl"
                  value={formData.linkedinUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, linkedinUrl: e.target.value })
                  }
                  placeholder="https://linkedin.com/in/..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Additional notes..."
                rows={2}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="isActive">Active on project</Label>
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isActive: checked })
                }
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingMember ? 'Save Changes' : 'Add Member'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
