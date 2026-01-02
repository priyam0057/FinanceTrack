import { useState, useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/features/finance/components/dashboard/AppSidebar";
import { DashboardHeader } from "@/features/finance/components/dashboard/DashboardHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings as SettingsIcon, Globe, DollarSign, Calendar, Tag, Settings as SettingsIcon2, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

import { CategoryManager } from "@/features/finance/components/dashboard/admin/CategoryManager";
import { FeaturesManager } from "@/features/finance/components/dashboard/admin/FeaturesManager";

const Settings = () => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [emailRecipient, setEmailRecipient] = useState('');
    const [dailyReportEnabled, setDailyReportEnabled] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await (supabase
                .from('user_settings') as any)
                .select('email_recipient,daily_report_enabled')
                .eq('user_id', user.id)
                .single();

            if (error) {
                // Don't error if just not found yet
                if (error.code !== 'PGRST116') {
                    console.error("Error fetching user settings:", error);
                }
                return;
            }

            if (data) {
                setEmailRecipient(data.email_recipient ?? '');
                setDailyReportEnabled(data.daily_report_enabled ?? false);
            }
        } catch (error) {
            console.error("Error loading settings:", error);
        }
    };

    const saveEmailSettings = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                toast({
                    title: "Error",
                    description: "No user found",
                    variant: "destructive"
                });
                return;
            }

            const updates = {
                user_id: user.id,
                email_recipient: emailRecipient,
                daily_report_enabled: dailyReportEnabled,
                updated_at: new Date().toISOString()
            };

            const { error } = await supabase
                .from('user_settings')
                .upsert(updates);

            if (error) throw error;
            toast({
                title: "Success",
                description: "Email settings saved successfully"
            });
        } catch (error: any) {
            toast({
                title: "Error",
                description: "Failed to save settings: " + error.message,
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSendTestEmail = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                toast({
                    title: "Error",
                    description: "You must be logged in to send a test email",
                    variant: "destructive"
                });
                return;
            }

            toast({ title: "Sending test email..." });
            
            const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/daily-report`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId: session.user.id }) 
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to send test email');
            }

            const resultData = await response.json();
            const userResult = resultData.find((r: any) => r.userId === session.user.id);
            
            if (userResult && userResult.status === 'sent') {
                toast({
                    title: "Success",
                    description: "Test email sent successfully! Check your inbox."
                });
            } else if (userResult && userResult.status === 'failed') {
                const errorMessage = userResult.error;
                
                // Friendly error for unverified domain
                if (errorMessage.includes("validation_error") && errorMessage.includes("verify a domain")) {
                    toast({
                        title: "Domain Verification Required",
                        description: "You can only send emails to your own email address unless you verify a domain on Resend.com.",
                        variant: "destructive"
                    });
                } else {
                     toast({
                        title: "Failed to send test email",
                        description: errorMessage,
                        variant: "destructive"
                    });
                }
                console.error("Email Sending Error Details:", userResult.error);
            } else {
                 toast({
                    title: "Error",
                    description: "Unexpected response from server",
                    variant: "destructive"
                });
            }
        } catch (error: any) {
            console.error("Test email error:", error);
            toast({
               title: "Error",
               description: `Test email error: ${error.message}`,
               variant: "destructive"
           });
        }
    };


  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />

        <div className="flex-1 flex flex-col">
          <DashboardHeader onAddTransaction={() => { }} />

          <main className="flex-1 p-6 space-y-6 overflow-auto">
            <div className="max-w-6xl mx-auto space-y-6">
              <div className="flex items-center gap-3">
                <SettingsIcon className="w-8 h-8 text-primary" />
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Settings
                </h1>
              </div>

               {/* Daily Reports (Moved from Dev) */}
               <Card className="card-glow">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Mail className="w-5 h-5 text-primary" />
                            Daily Email Reports
                        </CardTitle>
                        <CardDescription>
                            Configure automated morning reports (7-9 AM) with your financial summary.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Enable Daily Reports</Label>
                                <p className="text-sm text-muted-foreground">
                                    Receive a summary email every morning.
                                </p>
                            </div>
                            <Switch
                                checked={dailyReportEnabled}
                                onCheckedChange={setDailyReportEnabled}
                            />
                        </div>

                        <div className="space-y-4 pt-4 border-t">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Recipient Email</Label>
                                <Input
                                    id="email"
                                    placeholder="your@email.com"
                                    value={emailRecipient}
                                    onChange={(e) => setEmailRecipient(e.target.value)}
                                />
                            </div>

                            <div className="flex justify-between pt-2">
                                <Button
                                    variant="outline"
                                    onClick={handleSendTestEmail}
                                    disabled={loading || !emailRecipient}
                                >
                                    Send Test Email
                                </Button>
                                <Button onClick={saveEmailSettings} disabled={loading}>
                                    {loading ? 'Saving...' : 'Save Configuration'}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

              <Card className="card-glow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Regional Settings
                  </CardTitle>
                  <CardDescription>Configure your language and timezone preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select defaultValue="en">
                      <SelectTrigger id="language">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="hi">हिंदी (Hindi)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select defaultValue="asia/kolkata">
                      <SelectTrigger id="timezone">
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asia/kolkata">Asia/Kolkata (IST)</SelectItem>
                        <SelectItem value="utc">UTC</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-glow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Currency Settings
                  </CardTitle>
                  <CardDescription>Set your preferred currency</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currency">Default Currency</Label>
                    <Select defaultValue="INR">
                      <SelectTrigger id="currency">
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INR">₹ INR (Indian Rupee)</SelectItem>
                        <SelectItem value="USD">$ USD (US Dollar)</SelectItem>
                        <SelectItem value="EUR">€ EUR (Euro)</SelectItem>
                        <SelectItem value="GBP">£ GBP (British Pound)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-glow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Calendar Settings
                  </CardTitle>
                  <CardDescription>Configure your calendar preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="start-of-week">Start of Week</Label>
                    <Select defaultValue="0">
                      <SelectTrigger id="start-of-week">
                        <SelectValue placeholder="Select start day" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Sunday</SelectItem>
                        <SelectItem value="1">Monday</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Features Management */}
              <Card className="card-glow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <SettingsIcon2 className="w-5 h-5" />
                    Features Management
                  </CardTitle>
                  <CardDescription>Manage application features and functionality</CardDescription>
                </CardHeader>
                <CardContent>
                  <FeaturesManager />
                </CardContent>
              </Card>

              {/* Category Management */}
              <Card className="card-glow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="w-5 h-5" />
                    Category Management
                  </CardTitle>
                  <CardDescription>Create, edit, and delete transaction categories</CardDescription>
                </CardHeader>
                <CardContent>
                  <CategoryManager />
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Settings;