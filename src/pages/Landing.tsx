import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, Code2, ArrowRight } from "lucide-react";

export default function Landing() {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="max-w-4xl w-full">
                <h1 className="text-4xl font-bold text-center mb-2">My Workspace</h1>
                <p className="text-muted-foreground text-center mb-12">Select workspace to continue</p>

                <div className="grid md:grid-cols-2 gap-8">
                    <Link to="/finance">
                        <Card className="hover:border-primary transition-colors cursor-pointer h-full group">
                            <CardHeader>
                                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
                                </div>
                                <CardTitle className="text-2xl">Finance Dashboard</CardTitle>
                                <CardDescription>Manage budget, transactions, and analytics</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button variant="ghost" className="w-full justify-between group-hover:text-primary">
                                    Open Finance <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </CardContent>
                        </Card>
                    </Link>

                    <Link to="/dev">
                        <Card className="hover:border-primary transition-colors cursor-pointer h-full group">
                            <CardHeader>
                                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <Code2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <CardTitle className="text-2xl">Dev Projects</CardTitle>
                                <CardDescription>Track projects, tasks, and development notes</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button variant="ghost" className="w-full justify-between group-hover:text-primary">
                                    Open Dev Tools <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </CardContent>
                        </Card>
                    </Link>
                </div>
            </div>
        </div>
    );
}
