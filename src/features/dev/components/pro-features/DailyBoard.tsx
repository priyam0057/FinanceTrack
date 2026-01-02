import { useState } from 'react';
import { useStore } from '@/features/dev/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { Flame, Plus, Calendar, Pencil, Trash2, X, Check, ChevronDown, ChevronUp, History as HistoryIcon } from 'lucide-react';

export function DailyBoard() {
    const { journal, addJournalEntry, updateJournalEntry, deleteJournalEntry } = useStore();
    const [newEntry, setNewEntry] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState('');
    const [expandedDates, setExpandedDates] = useState<string[]>([]);

    // Group entries by date
    const groupedEntries = journal.reduce((acc, entry) => {
        const dateKey = format(new Date(entry.createdAt), 'yyyy-MM-dd');
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(entry);
        return acc;
    }, {} as Record<string, typeof journal>);

    const todayKey = format(new Date(), 'yyyy-MM-dd');
    const todayEntries = groupedEntries[todayKey] || [];
    
    // Get past dates sorted descending
    const pastDates = Object.keys(groupedEntries)
        .filter(date => date !== todayKey)
        .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    // Calculate Streak (Simulated for now based on unique days in journal)
    const uniqueDays = Object.keys(groupedEntries).length;

    const handleAddEntry = () => {
        if (!newEntry.trim()) return;
        addJournalEntry({
            content: newEntry,
            mood: 'neutral', // default, could expand to selector
            tags: [],
        });
        setNewEntry('');
    };

    const startEditing = (id: string, currentContent: string) => {
        setEditingId(id);
        setEditContent(currentContent);
    };

    const saveEdit = (id: string) => {
        if (editContent.trim()) {
            updateJournalEntry(id, editContent);
        }
        setEditingId(null);
        setEditContent('');
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditContent('');
    };

    const toggleDateExpansion = (date: string) => {
        setExpandedDates(prev => 
            prev.includes(date) 
                ? prev.filter(d => d !== date)
                : [...prev, date]
        );
    };

    const renderEntryList = (entries: typeof journal) => (
        <div className="space-y-6 relative pl-4 border-l-2 border-muted ml-2">
            {[...entries]
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map((entry) => (
                    <div key={entry.id} className="relative pl-6 group">
                        <div className="absolute -left-[29px] top-0 h-4 w-4 rounded-full bg-primary ring-4 ring-background" />
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground font-mono">
                                    {format(new Date(entry.createdAt), 'h:mm a')}
                                </span>

                                {editingId !== entry.id && (
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6"
                                            onClick={() => startEditing(entry.id, entry.content)}
                                        >
                                            <Pencil className="h-3 w-3" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 text-destructive hover:text-destructive"
                                            onClick={() => deleteJournalEntry(entry.id)}
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {editingId === entry.id ? (
                                <div className="space-y-2 mt-1">
                                    <Textarea
                                        value={editContent}
                                        onChange={(e) => setEditContent(e.target.value)}
                                        className="min-h-[80px]"
                                    />
                                    <div className="flex gap-2">
                                        <Button size="sm" onClick={() => saveEdit(entry.id)}>
                                            <Check className="h-3 w-3 mr-1.5" /> Save
                                        </Button>
                                        <Button size="sm" variant="ghost" onClick={cancelEdit}>
                                            <X className="h-3 w-3 mr-1.5" /> Cancel
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-foreground whitespace-pre-wrap leading-relaxed break-words">
                                    {entry.content}
                                </p>
                            )}
                        </div>
                    </div>
                ))
            }
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Streak Header */}
            <Card className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-500/20">
                <CardContent className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-orange-500/20 rounded-full">
                            <Flame className="h-8 w-8 text-orange-500" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">{uniqueDays} Day Streak</h2>
                            <p className="text-muted-foreground">Keep the momentum going!</p>
                        </div>
                    </div>
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium text-muted-foreground">Today</p>
                        <p className="text-xl font-bold">{format(new Date(), 'MMM dd, yyyy')}</p>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Input Area */}
                <div className="md:col-span-1 space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Log Activity</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Textarea
                                placeholder="What did you build today?"
                                value={newEntry}
                                onChange={(e) => setNewEntry(e.target.value)}
                                className="min-h-[120px]"
                            />
                            <Button onClick={handleAddEntry} className="w-full">
                                <Plus className="h-4 w-4 mr-2" />
                                Log Entry
                            </Button>
                        </CardContent>
                    </Card>

                    {/* History Section - Moved to sidebar on Desktop */}
                     <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <HistoryIcon className="h-5 w-5" />
                                History
                            </CardTitle>
                        </CardHeader>
                         <CardContent className="space-y-2">
                            {pastDates.length === 0 ? (
                                <p className="text-muted-foreground text-sm text-center py-4">No history yet.</p>
                            ) : (
                                pastDates.map(date => (
                                    <div key={date} className="border rounded-lg overflow-hidden">
                                        <button
                                            onClick={() => toggleDateExpansion(date)}
                                            className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors text-left"
                                        >
                                            <div>
                                                <div className="font-medium">{format(new Date(date), 'MMM dd, yyyy')}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {groupedEntries[date].length} entries
                                                </div>
                                            </div>
                                            {expandedDates.includes(date) ? (
                                                <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                            ) : (
                                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                            )}
                                        </button>
                                        
                                        {expandedDates.includes(date) && (
                                            <div className="p-4 bg-muted/20 border-t">
                                                {renderEntryList(groupedEntries[date])}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Today's Timeline */}
                <div className="md:col-span-2">
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Today's Journey
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {todayEntries.length === 0 ? (
                                <p className="text-center text-muted-foreground py-8">
                                    No entries yet for today. Start logging!
                                </p>
                            ) : (
                                renderEntryList(todayEntries)
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
