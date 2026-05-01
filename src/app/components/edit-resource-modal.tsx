import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { useState, useEffect } from 'react';
import {
  BookOpen,
  FolderOpen,
  FileText,
  Sparkles,
  Save,
  X,
} from 'lucide-react';

interface Resource {
  id: string;
  title: string;
  category: string;
  uploader: string;
  uploaderId: string;
  uploadDate?: string;
  isPublic: boolean;
  rating: number;
  reviewCount: number;
  description: string;
  hasAccess: boolean;
}

interface EditResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  resource: Resource | null;
  onSave: (resourceId: string, updatedResource: Partial<Resource>) => void;
}

export function EditResourceModal({
  isOpen,
  onClose,
  resource,
  onSave,
}: EditResourceModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [isPublic, setIsPublic] = useState(true);

  useEffect(() => {
    if (resource) {
      setTitle(resource.title);
      setDescription(resource.description);
      setCategory(resource.category);
      setIsPublic(resource.isPublic);
    }
  }, [resource]);

  const handleSave = () => {
    if (resource) {
      onSave(resource.id, {
        title,
        description,
        category,
        isPublic,
      });
      onClose();
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'courses':
        return <BookOpen className="h-4 w-4" />;
      case 'projects':
        return <FolderOpen className="h-4 w-4" />;
      case 'research':
        return <Sparkles className="h-4 w-4" />;
      case 'documents':
        return <FileText className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const categories = ['Courses', 'Documents', 'Projects', 'Research'];

  if (!resource) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4 border-b">
          <DialogTitle className="text-xl sm:text-2xl break-words">Edit Resource</DialogTitle>
          <p className="text-sm text-muted-foreground break-words">
            Update resource information and settings
          </p>
        </DialogHeader>

        <ScrollArea className="flex-1 px-4 sm:px-6 py-4 sm:py-6 max-h-[calc(90vh-180px)]">
          <div className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Resource title"
                className="w-full"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Resource description"
                rows={5}
                className="w-full resize-none"
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label>Category</Label>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      category === cat
                        ? 'border-primary bg-primary/10'
                        : 'border-muted hover:border-muted-foreground/20'
                    }`}
                  >
                    <div className="flex items-center gap-2 justify-center">
                      {getCategoryIcon(cat)}
                      <span className="text-sm font-medium">{cat}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Public/Private Toggle */}
            <div className="space-y-2">
              <Label htmlFor="public-toggle">Visibility</Label>
              <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
                <div className="flex-1 min-w-0 mr-4">
                  <p className="font-medium break-words">Public Resource</p>
                  <p className="text-sm text-muted-foreground break-words">
                    {isPublic
                      ? 'Anyone can access this resource'
                      : 'Users must request access to this resource'}
                  </p>
                </div>
                <Switch
                  id="public-toggle"
                  checked={isPublic}
                  onCheckedChange={setIsPublic}
                />
              </div>
            </div>

            {/* Resource Info */}
            <div className="space-y-2">
              <Label>Resource Information</Label>
              <div className="p-4 rounded-lg border bg-muted/30 space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-sm text-muted-foreground">Uploader</span>
                  <span className="text-sm font-medium break-words">{resource.uploader}</span>
                </div>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-sm text-muted-foreground">Upload Date</span>
                  <span className="text-sm font-medium">{resource.uploadDate}</span>
                </div>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-sm text-muted-foreground">Rating</span>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium">{resource.rating.toFixed(1)}</span>
                    <span className="text-sm text-muted-foreground">
                      ({resource.reviewCount} reviews)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="px-4 sm:px-6 py-3 sm:py-4 border-t">
          <div className="flex flex-col-reverse sm:flex-row gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={onClose}
              className="w-full sm:w-auto"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
