import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { motion } from 'motion/react';
import {
  Download,
  Star,
  User,
  Calendar,
  FileText,
  ExternalLink,
  BookOpen,
  FolderOpen,
  FileCode,
  Sparkles,
} from 'lucide-react';
import { Resource } from './resource-card';

interface ResourceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  resource: Resource | null;
  onDownload?: (fileId: string) => void;
}

export function ResourceDetailModal({
  isOpen,
  onClose,
  resource,
  onDownload,
}: ResourceDetailModalProps) {
  if (!resource) return null;

  const getCategoryIcon = () => {
    switch (resource.category.toLowerCase()) {
      case 'courses':
        return <BookOpen className="h-5 w-5" />;
      case 'projects':
        return <FolderOpen className="h-5 w-5" />;
      case 'research':
        return <Sparkles className="h-5 w-5" />;
      case 'documents':
        return <FileText className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const handleDownload = (fileId: string) => {
    if (onDownload) {
      onDownload(fileId);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4 border-b">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Badge variant="secondary" className="flex items-center gap-1 shrink-0">
                  {getCategoryIcon()}
                  {resource.category}
                </Badge>
                {resource.isPublic ? (
                  <Badge variant="outline" className="text-green-500 border-green-500/20 bg-green-500/10 shrink-0">
                    Public
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-orange-500 border-orange-500/20 bg-orange-500/10 shrink-0">
                    Private
                  </Badge>
                )}
              </div>
              <DialogTitle className="text-xl sm:text-2xl break-words pr-8">{resource.title}</DialogTitle>
              <div className="flex items-center gap-3 sm:gap-4 mt-3 text-sm text-muted-foreground flex-wrap">
                <div className="flex items-center gap-1 shrink-0">
                  <User className="h-4 w-4 shrink-0" />
                  <span className="truncate">{resource.uploader}</span>
                </div>
                {resource.uploadDate && (
                  <div className="flex items-center gap-1 shrink-0">
                    <Calendar className="h-4 w-4 shrink-0" />
                    <span className="truncate">{resource.uploadDate}</span>
                  </div>
                )}
                <div className="flex items-center gap-1 shrink-0">
                  <Star className="h-4 w-4 fill-amber-500 text-amber-500 shrink-0" />
                  <span className="font-medium">{resource.rating.toFixed(1)}</span>
                  <span className="text-muted-foreground whitespace-nowrap">({resource.reviewCount} reviews)</span>
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 px-4 sm:px-6 py-4 sm:py-6 max-h-[calc(90vh-200px)]">
          <div className="space-y-6">
            {/* Description */}
            <div>
              <h3 className="text-base sm:text-lg font-semibold mb-3">Description</h3>
              <p className="text-muted-foreground leading-relaxed break-words">{resource.description}</p>
            </div>

            <Separator />

            {/* Full Details */}
            {resource.fullDetails && (
              <>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold mb-3">Full Details</h3>
                  <div className="space-y-3 text-muted-foreground leading-relaxed">
                    {resource.fullDetails.split('\n').map((paragraph, index) => (
                      <p key={index} className="break-words">{paragraph}</p>
                    ))}
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Topics/Tags */}
            {resource.topics && resource.topics.length > 0 && (
              <>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold mb-3">Topics Covered</h3>
                  <div className="flex flex-wrap gap-2">
                    {resource.topics.map((topic, index) => (
                      <Badge key={index} variant="outline" className="break-all">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Files */}
            {resource.files && resource.files.length > 0 && (
              <div>
                <h3 className="text-base sm:text-lg font-semibold mb-3">Files & Resources</h3>
                <div className="space-y-2">
                  {resource.files.map((file, index) => (
                    <motion.div
                      key={file.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 sm:p-4 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0 w-full sm:w-auto">
                        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <FileCode className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{file.name}</p>
                          <p className="text-sm text-muted-foreground break-words">
                            {file.size} • {file.type}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleDownload(file.id)}
                        className="flex-shrink-0 w-full sm:w-auto"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Info */}
            {resource.additionalInfo && (
              <>
                <Separator />
                <div>
                  <h3 className="text-base sm:text-lg font-semibold mb-3">Additional Information</h3>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    {Object.entries(resource.additionalInfo).map(([key, value]) => (
                      <div key={key} className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                        <span className="font-medium text-foreground sm:min-w-[120px] break-words">
                          {key}:
                        </span>
                        <span className="break-words">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </ScrollArea>

        <div className="px-4 sm:px-6 py-3 sm:py-4 border-t bg-muted/30">
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
            <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
              Close
            </Button>
            {resource.externalLink && (
              <Button asChild className="w-full sm:w-auto">
                <a href={resource.externalLink} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open External Link
                </a>
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}