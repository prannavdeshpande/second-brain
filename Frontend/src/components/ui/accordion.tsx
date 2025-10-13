import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface EditContentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  content: {
    id: number;
    title: string;
    description: string;
    tags: string[];
  } | null;
}

const EditContentDialog = ({ open, onOpenChange, content }: EditContentDialogProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");

  useEffect(() => {
    if (content) {
      setTitle(content.title);
      setDescription(content.description);
      setTags(content.tags.join(", "));
    }
  }, [content]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Content updated successfully!");
    onOpenChange(false);
  };

  if (!content) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Edit Content</DialogTitle>
          <DialogDescription>
            Update your content details
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Title</Label>
            <Input
              id="edit-title"
              placeholder="Content title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Content Description</Label>
            <Textarea
              id="edit-description"
              placeholder="Describe your content..."
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-tags">Tags</Label>
            <Input
              id="edit-tags"
              placeholder="e.g., AI, Design, Marketing"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" variant="hero" className="flex-1 gap-2">
              <Save className="w-4 h-4" />
              Save Changes
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditContentDialog;
