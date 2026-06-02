import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { motion } from 'motion/react';
import {
  Upload,
  Download,
  Star,
  GitPullRequest,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { useState } from 'react';

interface Activity {
  id: string;
  type: 'upload' | 'access' | 'review' | 'request' | 'approved' | 'rejected';
  message: string;
  time: string;
  points?: number;
  resourceTitle?: string;
}

interface ActivityLogProps {
  activities: Activity[];
}

export function ActivityLog({ activities }: ActivityLogProps) {
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'upload':
        return <Upload className="h-4 w-4 text-green-500" />;
      case 'access':
        return <Download className="h-4 w-4 text-blue-500" />;
      case 'review':
        return <Star className="h-4 w-4 text-amber-500" />;
      case 'request':
        return <GitPullRequest className="h-4 w-4 text-purple-500" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'upload':
        return 'bg-green-500/10 border-green-500/20';
      case 'access':
        return 'bg-blue-500/10 border-blue-500/20';
      case 'review':
        return 'bg-amber-500/10 border-amber-500/20';
      case 'request':
        return 'bg-purple-500/10 border-purple-500/20';
      case 'approved':
        return 'bg-green-500/10 border-green-500/20';
      case 'rejected':
        return 'bg-red-500/10 border-red-500/20';
      default:
        return 'bg-muted/50 border-muted';
    }
  };

  const filteredActivities = activities
    .filter((a) => filterType === 'all' || a.type === filterType)
    .sort((a, b) => {
      if (sortBy === 'recent') return 0; // Already in recent order
      return 0;
    });

  const activityStats = {
    total: activities.length,
    uploads: activities.filter((a) => a.type === 'upload').length,
    accesses: activities.filter((a) => a.type === 'access').length,
    reviews: activities.filter((a) => a.type === 'review').length,
    requests: activities.filter((a) => a.type === 'request').length,
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Activity Log</h1>
        <p className="text-muted-foreground">
          Track all your actions and interactions
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold">{activityStats.total}</p>
              <p className="text-xs text-muted-foreground">Total Activities</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-500">{activityStats.uploads}</p>
              <p className="text-xs text-muted-foreground">Uploads</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-500">{activityStats.accesses}</p>
              <p className="text-xs text-muted-foreground">Accesses</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-500">{activityStats.reviews}</p>
              <p className="text-xs text-muted-foreground">Reviews</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-500">{activityStats.requests}</p>
              <p className="text-xs text-muted-foreground">Requests</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Tabs value={filterType} onValueChange={setFilterType} className="w-full">
          <TabsList className="bg-background border rounded-lg p-1">
            <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              All Activities
            </TabsTrigger>
            <TabsTrigger value="upload" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Uploads
            </TabsTrigger>
            <TabsTrigger value="access" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Accesses
            </TabsTrigger>
            <TabsTrigger value="review" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Reviews
            </TabsTrigger>
            <TabsTrigger value="request" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Requests
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Activity Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            {filteredActivities.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No activities found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredActivities.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex items-start gap-4 p-4 rounded-lg border ${getActivityColor(
                      activity.type
                    )}`}
                  >
                    <div className="flex-shrink-0 mt-1">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{activity.message}</p>
                          {activity.resourceTitle && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Resource: {activity.resourceTitle}
                            </p>
                          )}
                        </div>
                        {activity.points && (
                          <Badge
                            variant={activity.points > 0 ? 'default' : 'secondary'}
                            className={
                              activity.points > 0
                                ? 'bg-green-500/10 text-green-600 border-green-500/20'
                                : 'bg-red-500/10 text-red-600 border-red-500/20'
                            }
                          >
                            {activity.points > 0 ? '+' : ''}
                            {activity.points} pts
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {activity.time}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}