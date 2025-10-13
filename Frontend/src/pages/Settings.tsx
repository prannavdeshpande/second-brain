import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Settings as SettingsIcon, User, Bell, CreditCard, Shield, Download, Trash2, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const Settings = () => {
  const handleSave = () => {
    toast.success("Settings saved successfully!");
  };

  const handleExport = () => {
    toast.info("Exporting your data...");
  };

  const handleDelete = () => {
    toast.error("This action requires confirmation");
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="border-b bg-background/50 backdrop-blur-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Second Brain
              </span>
            </Link>
            <Link to="/dashboard">
              <Button variant="ghost">Back to Dashboard</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container max-w-5xl mx-auto px-6 py-8">
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-4xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">Manage your account and preferences</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Profile Card */}
          <Card className="lg:col-span-1 shadow-[var(--shadow-medium)] h-fit animate-fade-in-up">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <Avatar className="w-24 h-24">
                  <AvatarFallback className="bg-gradient-primary text-primary-foreground text-3xl">
                    JD
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-bold text-lg">John Doe</h3>
                  <p className="text-sm text-muted-foreground">john.doe@example.com</p>
                  <Badge className="mt-2 bg-gradient-primary">Premium</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Settings Tabs */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview" className="gap-2">
                  <User className="w-4 h-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="activity" className="gap-2">
                  <Bell className="w-4 h-4" />
                  Activity
                </TabsTrigger>
                <TabsTrigger value="settings" className="gap-2">
                  <SettingsIcon className="w-4 h-4" />
                  Settings
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6 animate-fade-in">
                {/* Stats Grid */}
                <div className="grid md:grid-cols-3 gap-4">
                  {[
                    { label: "Total Contents", value: "142", icon: Download, change: "+12 this week" },
                    { label: "Favourites", value: "38", icon: Bell, change: "5 new" },
                    { label: "Shared", value: "24", icon: User, change: "3 pending" },
                  ].map((stat, index) => (
                    <Card 
                      key={index} 
                      className="shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-medium)] transition-all"
                    >
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          {stat.label}
                        </CardTitle>
                        <stat.icon className="w-4 h-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold">{stat.value}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {stat.change}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Content Types and Tags */}
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="shadow-[var(--shadow-soft)]">
                    <CardHeader>
                      <CardTitle>Top Content Types</CardTitle>
                      <CardDescription>Your most saved content categories</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {[
                        { type: "Research Paper", count: 45 },
                        { type: "Videos", count: 32 },
                        { type: "Articles", count: 28 },
                      ].map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="font-medium">{item.type}</span>
                          <Badge variant="secondary">{item.count}</Badge>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card className="shadow-[var(--shadow-soft)]">
                    <CardHeader>
                      <CardTitle>Popular Tags</CardTitle>
                      <CardDescription>Your most used tags</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {["AI", "Machine Learning", "Design", "Productivity", "Marketing"].map((tag, index) => (
                          <Badge 
                            key={index} 
                            variant="outline" 
                            className="px-4 py-2 cursor-pointer hover:bg-gradient-card transition-all"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="activity" className="space-y-6 animate-fade-in">
                <Card className="shadow-[var(--shadow-soft)]">
                  <CardHeader>
                    <CardTitle>Activity Settings</CardTitle>
                    <CardDescription>Manage your activity preferences</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input id="username" defaultValue="johndoe" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Current Password</Label>
                      <Input id="current-password" type="password" placeholder="••••••••" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <Input id="new-password" type="password" placeholder="••••••••" />
                    </div>
                    <Button onClick={handleSave} variant="hero">Change Password</Button>
                  </CardContent>
                </Card>

                <Card className="shadow-[var(--shadow-soft)]">
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Your last 7 days of activity</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 gap-4">
                      {["This week", "This month", "Streak", "Total Actions"].map((label, i) => (
                        <div key={i} className="text-center p-4 rounded-lg bg-gradient-card">
                          <div className="text-2xl font-bold">{[24, 98, 7, 342][i]}</div>
                          <div className="text-xs text-muted-foreground">{label}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="space-y-6 animate-fade-in">
                <Card className="shadow-[var(--shadow-soft)]">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      Subscription
                    </CardTitle>
                    <CardDescription>Manage your subscription plan</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-card border border-border">
                      <div>
                        <p className="font-semibold">Premium Plan</p>
                        <p className="text-sm text-muted-foreground">Billed monthly</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">$29</p>
                        <p className="text-xs text-muted-foreground">per month</p>
                      </div>
                    </div>
                    <Link to="/pricing">
                      <Button variant="outline" className="w-full">Upgrade Plan</Button>
                    </Link>
                  </CardContent>
                </Card>

                <Card className="shadow-[var(--shadow-soft)] border-destructive/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-destructive">
                      <Shield className="w-5 h-5" />
                      Danger Zone
                    </CardTitle>
                    <CardDescription>Irreversible actions</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button onClick={handleExport} variant="outline" className="w-full justify-start">
                      <Download className="w-4 h-4 mr-2" />
                      Export Data
                    </Button>
                    <Separator />
                    <Button onClick={handleDelete} variant="destructive" className="w-full justify-start">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Account
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
