import { useState } from 'react';
import { useStore } from '@/features/dev/lib/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, Copy, ExternalLink, Palette, Type, Link as LinkIcon, Image as ImageIcon, Code } from 'lucide-react';
import { toast } from 'sonner';

interface ProjectVaultProps {
    projectId: string;
}

export function ProjectVault({ projectId }: ProjectVaultProps) {
    const { resources, addResource, deleteResource } = useStore();
    const [newItemName, setNewItemName] = useState('');
    const [newItemValue, setNewItemValue] = useState('');
    const [activeTab, setActiveTab] = useState('color');

    const projectResources = resources.filter(r => r.projectId === projectId);

    const handleAdd = () => {
        if (!newItemName || !newItemValue) return;

        addResource({
            projectId,
            type: activeTab as any,
            name: newItemName,
            value: newItemValue,
        });

        setNewItemName('');
        setNewItemValue('');
        toast.success('Resource added to vault');
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard');
    };

    const renderResourceList = (type: string) => {
        const items = projectResources.filter(r => r.type === type);

        if (items.length === 0) {
            return (
                <div className="text-center py-12 text-muted-foreground border border-dashed rounded-lg">
                    No {type}s saved yet. Add one above!
                </div>
            );
        }

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((item) => (
                    <Card key={item.id} className="group relative overflow-hidden">
                        <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    {type === 'color' && (
                                        <div
                                            className="w-6 h-6 rounded-full border border-border shadow-sm"
                                            style={{ backgroundColor: item.value }}
                                        />
                                    )}
                                    {type === 'font' && <Type className="h-4 w-4 text-muted-foreground" />}
                                    {type === 'link' && <LinkIcon className="h-4 w-4 text-muted-foreground" />}
                                    <span className="font-medium truncate">{item.name}</span>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                                    onClick={() => deleteResource(item.id)}
                                >
                                    <Trash2 className="h-3 w-3" />
                                </Button>
                            </div>

                            <div className="flex items-center gap-2">
                                <code className="flex-1 text-xs bg-muted p-1.5 rounded truncate font-mono">
                                    {item.value}
                                </code>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => copyToClipboard(item.value)}
                                >
                                    <Copy className="h-3 w-3" />
                                </Button>
                                {type === 'link' && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6"
                                        onClick={() => window.open(item.value, '_blank')}
                                    >
                                        <ExternalLink className="h-3 w-3" />
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Project Vault</h2>
                    <p className="text-muted-foreground">
                        Central repository for your design assets and snippets.
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-medium">Add New Asset</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="grid w-full items-center gap-1.5">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                placeholder="e.g. Primary Blue, Hero Font"
                                value={newItemName}
                                onChange={(e) => setNewItemName(e.target.value)}
                            />
                        </div>
                        <div className="grid w-full items-center gap-1.5">
                            <Label htmlFor="value">Value</Label>
                            <Input
                                id="value"
                                placeholder={activeTab === 'color' ? '#000000' : 'Value...'}
                                value={newItemValue}
                                onChange={(e) => setNewItemValue(e.target.value)}
                            />
                        </div>
                        <div className="flex items-end">
                            <Button onClick={handleAdd} disabled={!newItemName || !newItemValue}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Tabs defaultValue="color" onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
                    <TabsTrigger value="color" className="flex gap-2">
                        <Palette className="h-4 w-4" />
                        <span className="hidden sm:inline">Color</span>
                    </TabsTrigger>
                    <TabsTrigger value="font" className="flex gap-2">
                        <Type className="h-4 w-4" />
                        <span className="hidden sm:inline">Font</span>
                    </TabsTrigger>
                    <TabsTrigger value="link" className="flex gap-2">
                        <LinkIcon className="h-4 w-4" />
                        <span className="hidden sm:inline">Link</span>
                    </TabsTrigger>
                    <TabsTrigger value="code" className="flex gap-2">
                        <Code className="h-4 w-4" />
                        <span className="hidden sm:inline">Code</span>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="color" className="mt-6 space-y-4">
                    {renderResourceList('color')}
                </TabsContent>
                <TabsContent value="font" className="mt-6 space-y-4">
                    {renderResourceList('font')}
                </TabsContent>
                <TabsContent value="link" className="mt-6 space-y-4">
                    {renderResourceList('link')}
                </TabsContent>
                <TabsContent value="code" className="mt-6 space-y-4">
                    {renderResourceList('code')}
                </TabsContent>

            </Tabs>
        </div>
    );
}
