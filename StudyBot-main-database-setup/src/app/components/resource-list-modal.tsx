import { motion, AnimatePresence } from 'motion/react';
import { X, FileText, Star } from 'lucide-react';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { Resource } from './resource-card';

interface ResourceListModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  resources: Resource[];
  emptyMessage: string;
}

export function ResourceListModal({
  isOpen,
  onClose,
  title,
  resources,
  emptyMessage,
}: ResourceListModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] sm:w-full max-w-3xl max-h-[80vh] bg-background rounded-lg shadow-2xl z-50 flex flex-col border overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 sm:p-6 border-b flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h2 className="text-xl sm:text-2xl font-bold break-words">{title}</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {resources.length} {resources.length === 1 ? 'item' : 'items'}
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0">
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Content */}
            <ScrollArea className="flex-1 p-4 sm:p-6">
              {resources.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <FileText className="h-16 w-16 text-muted-foreground opacity-20 mb-4" />
                  <p className="text-muted-foreground text-center px-4 break-words">{emptyMessage}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {resources.map((resource, index) => (
                    <motion.div
                      key={resource.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-3 sm:p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-4">
                        <div className="flex-1 min-w-0 w-full">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <h3 className="font-semibold break-words flex-1 min-w-0">
                              {resource.title}
                            </h3>
                            <Badge variant="outline" className="capitalize shrink-0">
                              {resource.category}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-2 break-words">
                            {resource.description}
                          </p>

                          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-muted-foreground">
                            <span className="break-words">Uploaded by {resource.uploader}</span>
                            {resource.rating > 0 && (
                              <div className="flex items-center gap-1 shrink-0">
                                <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                                <span>{resource.rating.toFixed(1)}</span>
                                <span>({resource.reviewCount})</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto sm:flex-col sm:items-end">
                          {resource.isPublic ? (
                            <Badge className="bg-green-500/10 text-green-600 border-green-500/20 shrink-0">
                              Public
                            </Badge>
                          ) : (
                            <Badge className="bg-orange-500/10 text-orange-600 border-orange-500/20 shrink-0">
                              Private
                            </Badge>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </ScrollArea>

            {/* Footer */}
            <div className="p-4 sm:p-6 border-t flex justify-end">
              <Button onClick={onClose} className="w-full sm:w-auto">Close</Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}