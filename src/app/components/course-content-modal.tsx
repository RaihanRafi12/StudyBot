import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { useEffect, useState } from 'react';
import {
  BookOpen,
  FileText,
  Video,
  Code,
  FileCode,
  Download,
  AlertCircle,
  Trash2,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';

interface CourseItem {
  id: string;
  title: string;
  type: 'lesson' | 'video' | 'document' | 'code' | 'assignment';
  duration?: string;
  description: string;
  status: 'approved' | 'pending' | 'needs-changes';
}

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

interface CourseContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  resource: Resource | null;
  onRequestChanges: (resourceId: string, itemId: string) => void;
  onRemoveItem: (resourceId: string, itemId: string) => void;
}

// Mock course items - in a real app, this would come from the resource data
const getCourseItems = (resourceId: string): CourseItem[] => {
  return [
    {
      id: 'item-1',
      title: 'Introduction to the Course',
      type: 'video',
      duration: '15 min',
      description: 'Overview of what you will learn in this course',
      status: 'approved',
    },
    {
      id: 'item-2',
      title: 'Setting Up Your Environment',
      type: 'lesson',
      duration: '30 min',
      description: 'Step-by-step guide to install and configure necessary tools',
      status: 'approved',
    },
    {
      id: 'item-3',
      title: 'Core Concepts - Part 1',
      type: 'document',
      duration: '20 min',
      description: 'Reading material covering fundamental concepts',
      status: 'approved',
    },
    {
      id: 'item-4',
      title: 'Hands-on Practice',
      type: 'code',
      duration: '45 min',
      description: 'Interactive coding exercises and examples',
      status: 'pending',
    },
    {
      id: 'item-5',
      title: 'Week 1 Assignment',
      type: 'assignment',
      duration: '2 hours',
      description: 'Complete the exercises to test your understanding',
      status: 'needs-changes',
    },
    {
      id: 'item-6',
      title: 'Advanced Topics',
      type: 'video',
      duration: '40 min',
      description: 'Deep dive into advanced features and best practices',
      status: 'approved',
    },
  ];
};

export function CourseContentModal({
  isOpen,
  onClose,
  resource,
  onRequestChanges,
  onRemoveItem,
}: CourseContentModalProps) {
  const [courseItems, setCourseItems] = useState<CourseItem[]>([]);
  const [itemToRemove, setItemToRemove] = useState<string | null>(null);

  // Load course items when modal opens
  useEffect(() => {
    if (resource && isOpen) {
      setCourseItems(getCourseItems(resource.id));
    }
  }, [resource, isOpen]);

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="h-5 w-5" />;
      case 'lesson':
        return <BookOpen className="h-5 w-5" />;
      case 'document':
        return <FileText className="h-5 w-5" />;
      case 'code':
        return <Code className="h-5 w-5" />;
      case 'assignment':
        return <FileCode className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge variant="outline" className="text-green-500 border-green-500/20 bg-green-500/10">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="outline" className="text-yellow-500 border-yellow-500/20 bg-yellow-500/10">
            <AlertCircle className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case 'needs-changes':
        return (
          <Badge variant="outline" className="text-orange-500 border-orange-500/20 bg-orange-500/10">
            <XCircle className="h-3 w-3 mr-1" />
            Needs Changes
          </Badge>
        );
      default:
        return null;
    }
  };

  const handleRequestChanges = (itemId: string) => {
    if (resource) {
      onRequestChanges(resource.id, itemId);
      // Update local state
      setCourseItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, status: 'needs-changes' as const } : item
        )
      );
    }
  };

  const handleRemoveItem = (itemId: string) => {
    if (resource) {
      onRemoveItem(resource.id, itemId);
      // Update local state
      setCourseItems((prev) => prev.filter((item) => item.id !== itemId));
      setItemToRemove(null);
    }
  };

  if (!resource) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0 gap-0 overflow-hidden">
          <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4 border-b">
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <Badge variant="secondary" className="flex items-center gap-1 shrink-0">
                    <BookOpen className="h-4 w-4" />
                    {resource.category}
                  </Badge>
                  <Badge variant="outline" className="shrink-0">
                    {courseItems.length} Items
                  </Badge>
                </div>
                <DialogTitle className="text-xl sm:text-2xl break-words">
                  {resource.title}
                </DialogTitle>
                <p className="text-sm text-muted-foreground mt-2 break-words">
                  Manage course content, request changes, or remove items
                </p>
              </div>
            </div>
          </DialogHeader>

          <ScrollArea className="flex-1 px-4 sm:px-6 py-4 sm:py-6 max-h-[calc(90vh-180px)]">
            <div className="space-y-3">
              {courseItems.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground">No items in this course yet</p>
                </div>
              ) : (
                courseItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      {/* Item Icon */}
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        {getItemIcon(item.type)}
                      </div>

                      {/* Item Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2 flex-wrap">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium break-words mb-1">
                              {index + 1}. {item.title}
                            </h4>
                            <p className="text-sm text-muted-foreground break-words">
                              {item.description}
                            </p>
                          </div>
                          {getStatusBadge(item.status)}
                        </div>

                        <div className="flex items-center gap-2 flex-wrap mt-3">
                          <Badge variant="outline" className="text-xs shrink-0">
                            {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                          </Badge>
                          {item.duration && (
                            <Badge variant="outline" className="text-xs shrink-0">
                              {item.duration}
                            </Badge>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 mt-3 flex-wrap">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-950"
                            onClick={() => handleRequestChanges(item.id)}
                            disabled={item.status === 'needs-changes'}
                          >
                            <AlertCircle className="h-4 w-4 mr-1" />
                            Request Changes
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                            onClick={() => setItemToRemove(item.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>

          <div className="px-4 sm:px-6 py-3 sm:py-4 border-t">
            <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Remove Item Confirmation Dialog */}
      <AlertDialog open={!!itemToRemove} onOpenChange={() => setItemToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Course Item?</AlertDialogTitle>
            <AlertDialogDescription className="break-words">
              Are you sure you want to remove this item from the course? This action cannot be
              undone and the item will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => itemToRemove && handleRemoveItem(itemToRemove)}
              className="bg-red-600 hover:bg-red-700"
            >
              Remove Item
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
