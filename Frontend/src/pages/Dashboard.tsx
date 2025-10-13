import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Plus, 
  Search,
  Sparkles,
  Bell,
  CreditCard,
  Sun,
  Moon,
  LayoutGrid,
  List,
  Download,
  Share2,
  Trash2,
  Heart,
  ThumbsDown,
  Eye,
  Folder,
  Edit,
  FolderOpen
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useTheme } from "next-themes";
import AddContentDialog from "@/components/AddContentDialog";
import EditContentDialog from "@/components/EditContentDialog";

const Dashboard = () => {
  const { theme, setTheme } = useTheme();
  const [showAddContent, setShowAddContent] = useState(false);
  const [showEditContent, setShowEditContent] = useState(false);
  const [editingContent, setEditingContent] = useState<any>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [openFolderId, setOpenFolderId] = useState<number | null>(null);

  const allTags = ["politics", "science", "technology", "AI", "design", "productivity"];
  
  const folders = [
    { id: 1, name: "Work Projects", itemCount: 5 },
    { id: 2, name: "Personal Learning", itemCount: 8 },
    { id: 3, name: "Research Papers", itemCount: 12 },
  ];

  const contentItems = [
    {
      id: 1,
      type: "youtube",
      title: "Understanding Machine Learning",
      preview: "https://youtube.com/watch?v=example",
      description: "A comprehensive guide to machine learning fundamentals and applications in modern AI systems.",
      tags: ["AI", "technology", "science"],
      date: "2024-01-15",
      size: "245 MB",
      likes: 24,
      dislikes: 2,
      isPublic: true,
      folderId: null
    },
    {
      id: 2,
      type: "pdf",
      title: "Design Systems Guide",
      preview: "design-systems.pdf",
      description: "Complete guide to building scalable design systems for modern web applications.",
      tags: ["design", "productivity"],
      date: "2024-01-14",
      size: "12 MB",
      likes: 18,
      dislikes: 1,
      isPublic: false,
      folderId: 1
    },
    {
      id: 3,
      type: "twitter",
      title: "AI Trends 2024",
      preview: "@twitter/status/123456",
      description: "Latest trends and developments in artificial intelligence and machine learning for 2024.",
      tags: ["AI", "technology"],
      date: "2024-01-13",
      size: "2 MB",
      likes: 32,
      dislikes: 3,
      isPublic: true,
      folderId: null
    },
    {
      id: 4,
      type: "article",
      title: "Political Analysis Report",
      preview: "https://example.com/article",
      description: "In-depth analysis of recent political developments and their impact on global economy.",
      tags: ["politics"],
      date: "2024-01-12",
      size: "8 MB",
      likes: 15,
      dislikes: 5,
      isPublic: false,
      folderId: 1
    },
    {
      id: 5,
      type: "pdf",
      title: "React Advanced Patterns",
      preview: "react-patterns.pdf",
      description: "Advanced React patterns and best practices for enterprise applications.",
      tags: ["technology", "productivity"],
      date: "2024-01-10",
      size: "18 MB",
      likes: 21,
      dislikes: 1,
      isPublic: false,
      folderId: 2
    },
  ];

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleEditContent = (item: any) => {
    setEditingContent(item);
    setShowEditContent(true);
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  // Show folder contents if a folder is open
  const displayItems = openFolderId !== null
    ? contentItems.filter(item => item.folderId === openFolderId)
    : contentItems.filter(item => item.folderId === null);

  const filteredContent = selectedTags.length > 0
    ? displayItems.filter(item => item.tags.some(tag => selectedTags.includes(tag)))
    : displayItems;
  
  const allFolders = openFolderId === null 
    ? folders 
    : [];

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

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" className="gap-2">
                <CreditCard className="w-4 h-4" />
                <span className="text-sm">Credits</span>
              </Button>
              <Button variant="ghost" size="icon" onClick={toggleTheme}>
                <Sun className="w-5 h-5 dark:hidden" />
                <Moon className="w-5 h-5 hidden dark:block" />
              </Button>
              <Button variant="ghost" size="icon">
                <Bell className="w-5 h-5" />
              </Button>
              <Link to="/settings">
                <Avatar className="cursor-pointer w-9 h-9">
                  <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                    JD
                  </AvatarFallback>
                </Avatar>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-6">
        {/* Content Tabs */}
        <Tabs defaultValue="my-content" className="mb-6">
          <TabsList className="bg-background/50 backdrop-blur-sm">
            <TabsTrigger value="my-content">My Content</TabsTrigger>
            <TabsTrigger value="shared">Shared with me</TabsTrigger>
            <TabsTrigger value="public">Public</TabsTrigger>
          </TabsList>

          <TabsContent value="my-content" className="space-y-6 mt-6">
            {/* Breadcrumb for folder navigation */}
            {openFolderId !== null && (
              <div className="flex items-center gap-2 text-sm">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setOpenFolderId(null)}
                  className="gap-2"
                >
                  <Folder className="w-4 h-4" />
                  All Content
                </Button>
                <span className="text-muted-foreground">/</span>
                <span className="font-medium">
                  {folders.find(f => f.id === openFolderId)?.name}
                </span>
              </div>
            )}

            {/* Search and Add Content */}
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input 
                  placeholder="Search for content using description/keywords/title" 
                  className="pl-10 bg-background/50 backdrop-blur-sm"
                />
              </div>
              <Button onClick={() => setShowAddContent(true)} variant="hero" className="gap-2">
                <Plus className="w-4 h-4" /> Add Content
              </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Source:</span>
                <Select defaultValue="all">
                  <SelectTrigger className="w-32 bg-background/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="youtube">YouTube</SelectItem>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="twitter">Twitter</SelectItem>
                    <SelectItem value="article">Article</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">View:</span>
                <div className="flex gap-1 bg-background/50 rounded-lg p-1">
                  <Button
                    variant={viewMode === "grid" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Tags Filter */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium">Tags:</span>
              {allTags.map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  className="cursor-pointer hover:bg-gradient-card transition-all"
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>

            {/* Total Contents */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Total items:</span>
              <Badge variant="secondary">{allFolders.length + filteredContent.length}</Badge>
            </div>

            {/* Folders and Content Grid */}
            <div className={viewMode === "grid" ? "grid md:grid-cols-2 gap-6" : "space-y-4"}>
              {/* Render Folders */}
              {allFolders.map((folder) => (
                <Card 
                  key={`folder-${folder.id}`} 
                  className="shadow-[var(--shadow-medium)] hover:shadow-[var(--shadow-soft)] transition-all overflow-hidden animate-fade-in-up cursor-pointer"
                  onClick={() => setOpenFolderId(folder.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-center h-32 mb-4 p-4 rounded-lg bg-gradient-card border border-border">
                      <FolderOpen className="w-16 h-16 text-primary" />
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <Folder className="w-5 h-5 text-primary" />
                      <h3 className="font-bold text-lg">{folder.name}</h3>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-4">
                      {folder.itemCount} items
                    </p>

                    <div className="flex gap-2 pt-4 border-t border-border">
                      <Button variant="outline" size="sm" className="flex-1">
                        Open
                      </Button>
                      <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Render Content Items */}
              {filteredContent.map((item) => (
                <Card key={item.id} className="shadow-[var(--shadow-medium)] hover:shadow-[var(--shadow-soft)] transition-all overflow-hidden animate-fade-in-up">
                  <CardContent className="p-6">
                    {/* Content Preview */}
                    <div className="mb-4 p-4 rounded-lg bg-gradient-card border border-border flex items-center justify-center h-32">
                      <div className="text-center">
                        <Eye className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          {item.type === "youtube" && "YouTube Preview"}
                          {item.type === "pdf" && "PDF Document"}
                          {item.type === "twitter" && "Twitter Link"}
                          {item.type === "article" && "Article Link"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">{item.preview}</p>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="font-bold text-lg mb-2">{item.title}</h3>

                    {/* Short Description */}
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {item.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {item.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    {/* Metadata */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                      <span>Saved: {item.date}</span>
                      <span>Size: {item.size}</span>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3" /> {item.likes}
                        </span>
                        <span className="flex items-center gap-1">
                          <ThumbsDown className="w-3 h-3" /> {item.dislikes}
                        </span>
                      </div>
                    </div>

                    {/* Public Badge */}
                    {item.isPublic && (
                      <Badge variant="secondary" className="mb-4">Public</Badge>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-4 border-t border-border">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-2"
                        onClick={() => handleEditContent(item)}
                      >
                        <Edit className="w-3 h-3" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Download className="w-3 h-3" />
                      </Button>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Share2 className="w-3 h-3" />
                      </Button>
                      <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="shared" className="mt-6">
            <Card className="shadow-[var(--shadow-medium)] p-12 text-center">
              <p className="text-muted-foreground">No shared content yet</p>
            </Card>
          </TabsContent>

          <TabsContent value="public" className="mt-6">
            <Card className="shadow-[var(--shadow-medium)] p-12 text-center">
              <p className="text-muted-foreground">No public content yet</p>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <AddContentDialog 
        open={showAddContent} 
        onOpenChange={setShowAddContent}
        folders={folders}
      />
      <EditContentDialog
        open={showEditContent}
        onOpenChange={setShowEditContent}
        content={editingContent}
      />
    </div>
  );
};

export default Dashboard;
