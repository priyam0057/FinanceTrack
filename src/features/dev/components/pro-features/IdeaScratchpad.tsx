import { useState } from 'react';
import { useStore } from '@/features/dev/lib/store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Lightbulb, Archive, RotateCcw, Trash2, Pencil, Check, X } from 'lucide-react';
import { format } from 'date-fns';

export function IdeaScratchpad() {
    const { ideas, addIdea, updateIdea, deleteIdea, toggleIdeaArchived } = useStore();
    const [newIdea, setNewIdea] = useState('');
    const [showArchived, setShowArchived] = useState(false);

    // Edit state
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState('');

    const displayIdeas = ideas
        .filter(i => showArchived ? i.isArchived : !i.isArchived)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const handleAdd = () => {
        if (!newIdea.trim()) return;
        addIdea({
            content: newIdea,
            isArchived: false,
        });
        setNewIdea('');
    };

    const startEditing = (idea: { id: string, content: string }) => {
        setEditingId(idea.id);
        setEditContent(idea.content);
    };

    const saveEdit = (id: string) => {
        if (editContent.trim()) {
            updateIdea(id, editContent);
        }
        setEditingId(null);
        setEditContent('');
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditContent('');
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Idea Scratchpad</h2>
                    <p className="text-muted-foreground">Capture your thoughts instantly.</p>
                </div>
                <Button variant="outline" onClick={() => setShowArchived(!showArchived)}>
                    {showArchived ? 'Show Active' : 'Show Archived'}
                </Button>
            </div>

            {/* Input Card - Improved UI */}
            <Card className="bg-yellow-50/50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800 shadow-sm transition-shadow hover:shadow-md">
                <CardContent className="p-0">
                    <div className="relative">
                        <Textarea
                            placeholder="What's your next big idea?"
                            className="bg-transparent border-none shadow-none resize-none focus-visible:ring-0 p-6 text-lg placeholder:text-muted-foreground/60 min-h-[120px] w-full"
                            value={newIdea}
                            onChange={(e) => setNewIdea(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                                    handleAdd();
                                }
                            }}
                        />
                        <div className="absolute bottom-4 right-4 flex items-center gap-2">
                            <span className="text-xs text-muted-foreground hidden sm:inline-block mr-2">
                                Cmd+Enter to save
                            </span>
                            <Button size="sm" onClick={handleAdd} disabled={!newIdea.trim()} className="bg-yellow-500 hover:bg-yellow-600 text-white">
                                <Lightbulb className="h-4 w-4 mr-2" />
                                Save Idea
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-max">
                {displayIdeas.map((idea) => (
                    // Fixed height placeholder wrapper to maintain grid layout
                    <div key={idea.id} className="h-60 relative group z-0 hover:z-10">
                        <Card className="absolute inset-x-0 top-0 h-full hover:h-auto min-h-full transition-all duration-300 hover:shadow-2xl hover:border-primary/50 bg-card border-l-4 border-l-primary/20 hover:border-l-primary flex flex-col">
                            <CardContent className="p-5 flex flex-col h-full bg-card rounded-lg">
                                {editingId === idea.id ? (
                                    <div className="space-y-3 z-20 relative bg-card">
                                        <Textarea
                                            value={editContent}
                                            onChange={(e) => setEditContent(e.target.value)}
                                            className="min-h-[140px] bg-background/50 resize-y"
                                            autoFocus
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                        <div className="flex justify-end gap-2">
                                            <Button size="sm" variant="ghost" onClick={cancelEdit}>
                                                <X className="h-4 w-4" />
                                            </Button>
                                            <Button size="sm" onClick={() => saveEdit(idea.id)}>
                                                <Check className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex-1 min-h-0 bg-card">
                                            <p className="whitespace-pre-wrap leading-relaxed break-words line-clamp-[6] group-hover:line-clamp-none transition-all text-sm sm:text-base">
                                                {idea.content}
                                            </p>
                                        </div>

                                        {/* Actions Footer - Appears on Hover */}
                                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-card">
                                            <span className="text-xs text-muted-foreground font-medium">
                                                {format(new Date(idea.createdAt), 'MMM d')}
                                            </span>
                                            <div className="flex gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 hover:bg-muted"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        startEditing(idea);
                                                    }}
                                                    title="Edit"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 hover:bg-muted"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleIdeaArchived(idea.id);
                                                    }}
                                                    title={idea.isArchived ? "Restore" : "Archive"}
                                                >
                                                    {idea.isArchived ? <RotateCcw className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        deleteIdea(idea.id);
                                                    }}
                                                    title="Delete"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                ))}
                {displayIdeas.length === 0 && (
                    <div className="col-span-full py-16 text-center">
                        <div className="bg-muted/30 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                            <Lightbulb className="h-8 w-8 text-muted-foreground/50" />
                        </div>
                        <p className="text-muted-foreground text-lg">
                            {showArchived ? 'No archived ideas found.' : 'No active ideas yet. Start thinking big!'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
