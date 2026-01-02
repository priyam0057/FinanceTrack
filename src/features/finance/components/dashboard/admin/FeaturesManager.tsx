import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Settings, Trash2 } from "lucide-react";

export function FeaturesManager() {
  const { toast } = useToast();
  const [newFeature, setNewFeature] = useState({ name: "", description: "" });
  const [features, setFeatures] = useState([
    { id: "1", name: "Dashboard Analytics", description: "View detailed financial analytics on dashboard", enabled: true },
    { id: "2", name: "Budget Tracking", description: "Set and track monthly budgets", enabled: true },
    { id: "3", name: "Wishlist", description: "Create and manage wishlists for future purchases", enabled: true },
    { id: "4", name: "Reports", description: "Generate detailed financial reports", enabled: true },
    { id: "5", name: "Tools", description: "Access financial calculators and tools", enabled: true },
  ]);

  const addFeature = () => {
    if (!newFeature.name.trim()) {
      toast({ title: "Error", description: "Feature name is required", variant: "destructive" });
      return;
    }

    const feature = {
      id: Date.now().toString(),
      name: newFeature.name,
      description: newFeature.description,
      enabled: true,
    };

    setFeatures([...features, feature]);
    setNewFeature({ name: "", description: "" });
    toast({ title: "Feature added successfully" });
  };

  const toggleFeature = (id: string) => {
    setFeatures(features.map(feature => 
      feature.id === id ? { ...feature, enabled: !feature.enabled } : feature
    ));
    toast({ title: "Feature updated successfully" });
  };

  const deleteFeature = (id: string) => {
    setFeatures(features.filter(feature => feature.id !== id));
    toast({ title: "Feature deleted successfully" });
  };

  return (
    <Card className="card-glow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Features Management
        </CardTitle>
        <CardDescription>Manage application features and functionality</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Feature Name</Label>
              <Input
                value={newFeature.name}
                onChange={(e) => setNewFeature({ ...newFeature, name: e.target.value })}
                placeholder="e.g., Investment Tracking"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                value={newFeature.description}
                onChange={(e) => setNewFeature({ ...newFeature, description: e.target.value })}
                placeholder="Brief description of the feature"
              />
            </div>
          </div>
          <Button
            onClick={addFeature}
            disabled={!newFeature.name.trim()}
            className="w-full"
            variant="default"
          >
            <Plus className="w-4 h-4 mr-2" />Add Feature
          </Button>
        </div>

        <div className="space-y-4">
          <Label>Existing Features</Label>
          <div className="space-y-3">
            {features.map((feature) => (
              <div key={feature.id} className="flex items-center justify-between p-4 bg-card rounded-lg border">
                <div className="flex-1">
                  <div className="font-medium">{feature.name}</div>
                  <div className="text-sm text-muted-foreground">{feature.description}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={feature.enabled}
                    onCheckedChange={() => toggleFeature(feature.id)}
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteFeature(feature.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}