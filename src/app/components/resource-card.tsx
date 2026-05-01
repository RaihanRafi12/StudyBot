import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { motion } from 'motion/react';
import { Star, Lock, LockOpen, Eye, User, MessageSquare } from 'lucide-react';

export interface Resource {
  id: string;
  title: string;
  category: string;
  uploader: string;
  uploaderId: string;
  isPublic: boolean;
  rating: number;
  reviewCount: number;
  description: string;
  hasAccess: boolean;
  accessRequested?: boolean;
  uploadDate?: string;
  fullDetails?: string;
  topics?: string[];
  files?: {
    id: string;
    name: string;
    size: string;
    type: string;
    url?: string;
  }[];
  additionalInfo?: Record<string, string>;
  externalLink?: string;
}

interface ResourceCardProps {
  resource: Resource;
  onRequestAccess: (resourceId: string) => void;
  onView: (resourceId: string) => void;
  onRate: (resourceId: string) => void;
}

export function ResourceCard({
  resource,
  onRequestAccess,
  onView,
  onRate,
}: ResourceCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="h-full flex flex-col border-muted hover:border-primary/50 transition-colors">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg line-clamp-2">{resource.title}</CardTitle>
            {resource.isPublic ? (
              <LockOpen className="h-4 w-4 text-green-500 flex-shrink-0" />
            ) : (
              <Lock className="h-4 w-4 text-amber-500 flex-shrink-0" />
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary">{resource.category}</Badge>
            {!resource.isPublic && !resource.hasAccess && (
              <Badge variant="outline" className="text-amber-600 border-amber-600">
                Private
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="flex-1">
          <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
            {resource.description}
          </p>

          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <User className="h-4 w-4" />
            <span>{resource.uploader}</span>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="font-medium">{resource.rating.toFixed(1)}</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <MessageSquare className="h-4 w-4" />
              <span>{resource.reviewCount} reviews</span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="gap-2">
          {resource.hasAccess ? (
            <>
              <Button className="flex-1" onClick={() => onView(resource.id)}>
                <Eye className="h-4 w-4 mr-2" />
                View
              </Button>
              <Button variant="outline" onClick={() => onRate(resource.id)}>
                <Star className="h-4 w-4" />
              </Button>
            </>
          ) : resource.accessRequested ? (
            <Button className="flex-1" disabled>
              Access Requested
            </Button>
          ) : (
            <Button
              className="flex-1"
              variant="secondary"
              onClick={() => onRequestAccess(resource.id)}
            >
              Request Access
            </Button>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
}