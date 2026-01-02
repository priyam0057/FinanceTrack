import { useTheme } from '@/components/theme-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Moon, Sun, Monitor, Bell, Shield } from 'lucide-react';
import { toast } from 'sonner';

export function SettingsPage() {
    const { setTheme, theme } = useTheme();

    return (
        <div className="container max-w-4xl mx-auto py-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground mt-2">
                    Manage your interface preferences and application configuration.
                </p>
            </div>

            <div className="grid gap-6">
                {/* Appearance */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Monitor className="h-5 w-5" />
                            Appearance
                        </CardTitle>
                        <CardDescription>
                            Customize how the application looks on your device.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">Theme settings are managed by the system.</p>
                    </CardContent>
                </Card>

                {/* Notifications (Placeholder) */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Bell className="h-5 w-5" />
                            Notifications
                        </CardTitle>
                        <CardDescription>
                            Control when we contact you.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Daily Streak Reminders</Label>
                                <p className="text-sm text-muted-foreground">
                                    Get notified to maintain your daily build streak.
                                </p>
                            </div>
                            <Switch defaultChecked onCheckedChange={() => toast.success('Preference saved')} />
                        </div>
                    </CardContent>
                </Card>

                {/* Account / Privacy */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            Privacy & Data
                        </CardTitle>
                        <CardDescription>
                            Manage your connected accounts and local data.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 border rounded-lg bg-muted/20">
                            <p className="text-sm font-medium mb-1">Local Data Only</p>
                            <p className="text-sm text-muted-foreground">
                                This is a local-first application. Most data resides on your machine.
                                Google Drive is used only for backups you explicitly initiate.
                            </p>
                        </div>
                        <Button variant="outline" className="text-destructive w-full sm:w-auto">
                            Clear All Local Data
                        </Button>
                    </CardContent>
                </Card>

            </div>
        </div>
    );
}
