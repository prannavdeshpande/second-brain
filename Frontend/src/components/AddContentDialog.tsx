import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link2, Upload, Youtube, Twitter, FileText, Folder, Truck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface AddContentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folders: Array<{ id: number; name: string; }>;
}

const AddContentDialog = ({ open, onOpenChange, folders }: AddContentDialogProps) => {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<string>("none");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Content added successfully!");
    onOpenChange(false);
    // Reset form
    setTitle("");
    setUrl("");
    setDescription("");
    setTags("");
  };

  const platforms = [
    { name: "YouTube", icon: Youtube, color: "text-red-500" },
    { name: "Twitter", icon: Twitter, color: "text-blue-400" },
    { name: "Substack", icon: FileText, color: "text-orange-500" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Add New Content</DialogTitle>
          <DialogDescription>
            Import content from URL or upload from your device
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="url" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="url" className="gap-2">
              <Link2 className="w-4 h-4" />
              Upload an URL
            </TabsTrigger>
            <TabsTrigger value="device" className="gap-2">
              <Upload className="w-4 h-4" />
              Upload from device
            </TabsTrigger>
          </TabsList>

          <TabsContent value="url" className="space-y-4">
            {/* Platform Quick Links */}
            <div className="flex gap-2 p-4 rounded-lg bg-gradient-card border border-border">
              <span className="text-sm text-muted-foreground">Quick add from:</span>
              {platforms.map((platform) => (
                <Button
                  key={platform.name}
                  variant="ghost"
                  size="sm"
                  className="gap-2"
                >
                  <platform.icon className={`w-4 h-4 ${platform.color}`} />
                  {platform.name}
                </Button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="url">Content URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="url"
                    type="url"
                    placeholder="https://example.com/content"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    required
                  />
                  <Button type="button" variant="outline">Upload</Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Content title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Content Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your content..."
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  placeholder="e.g., AI, Design, Marketing"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="folder">Add to Folder (Optional)</Label>
                <Select value={selectedFolder} onValueChange={setSelectedFolder}>
                  <SelectTrigger id="folder">
                    <SelectValue placeholder="Select a folder" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      <div className="flex items-center gap-2">
                        No Folder
                      </div>
                    </SelectItem>
                    {folders.map((folder) => (
                      <SelectItem key={folder.id} value={folder.id.toString()}>
                        <div className="flex items-center gap-2">
                          <Folder className="w-4 h-4" />
                          {folder.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" variant="hero" className="flex-1">
                  <Upload className="w-4 h-4" />
                  Add content
                </Button>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="device" className="space-y-4">
            <div className="border-2 border-dashed border-border rounded-lg p-12 text-center hover:bg-gradient-card transition-all cursor-pointer">
              <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">
                Click to browse or drag and drop
              </p>
              <p className="text-sm text-muted-foreground">
                PDF, DOC, DOCX, TXT files up to 10MB
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="file-title">Title</Label>
                <Input
                  id="file-title"
                  placeholder="Content title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="file-description">Content Description</Label>
                <Textarea
                  id="file-description"
                  placeholder="Describe your content..."
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="file-tags">Tags</Label>
                <Input
                  id="file-tags"
                  placeholder="e.g., AI, Design, Marketing"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="file-folder">Add to Folder (Optional)</Label>
                <Select value={selectedFolder} onValueChange={setSelectedFolder}>
                  <SelectTrigger id="file-folder">
                    <SelectValue placeholder="Select a folder" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      <div className="flex items-center gap-2">
                        No Folder
                      </div>
                    </SelectItem>
                    {folders.map((folder) => (
                      <SelectItem key={folder.id} value={folder.id.toString()}>
                        <div className="flex items-center gap-2">
                          <Folder className="w-4 h-4" />
                          {folder.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" variant="hero" className="flex-1">
                  <Upload className="w-4 h-4" />
                  Add content
                </Button>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AddContentDialog;
