import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { motion } from 'motion/react';
import {
  Activity,
  Upload,
  Download,
  Star,
  GitPullRequest,
  CheckCircle,
  Clock,
  User,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';

interface ActivityData {
  id: string;
  userId: string;
  userName: string;
  type: 'upload' | 'access' | 'review' | 'request' | 'approved';
  message: string;
  time: string;
  points?: number;
}

interface AdminActivityProps {
  activities: ActivityData[];
}

export function AdminActivity({ activities }: AdminActivityProps) {
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
      default:
        return 'bg-muted/50 border-muted';
    }
  };

  // Group activities by type
  const uploadActivities = activities.filter((a) => a.type === 'upload');
  const accessActivities = activities.filter((a) => a.type === 'access');
  const reviewActivities = activities.filter((a) => a.type === 'review');
  const requestActivities = activities.filter((a) => a.type === 'request');

  const stats = [
    {
      label: 'Total Activities',
      value: activities.length,
      icon: Activity,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      label: 'Uploads',
      value: uploadActivities.length,
      icon: Upload,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      trend: '+12%',
      trendUp: true,
    },
    {
      label: 'Access Requests',
      value: requestActivities.length,
      icon: GitPullRequest,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      trend: '+8%',
      trendUp: true,
    },
    {
      label: 'Reviews',
      value: reviewActivities.length,
      icon: Star,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
      trend: '-3%',
      trendUp: false,
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Platform Activity</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Monitor all activities across the platform</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${stat.bgColor} shrink-0`}>
                      <Icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-xs text-muted-foreground break-words">{stat.label}</p>
                      {stat.trend && (
                        <div className="flex items-center gap-1 mt-1">
                          {stat.trendUp ? (
                            <TrendingUp className="h-3 w-3 text-green-600 shrink-0" />
                          ) : (
                            <TrendingDown className="h-3 w-3 text-red-600 shrink-0" />
                          )}
                          <span
                            className={`text-xs font-medium ${
                              stat.trendUp ? 'text-green-600' : 'text-red-600'
                            }`}
                          >
                            {stat.trend}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Activity Feed */}
      <Tabs defaultValue="all" className="space-y-6">
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <TabsList className="inline-flex w-auto min-w-full sm:min-w-0">
            <TabsTrigger value="all" className="whitespace-nowrap">
              <span className="hidden xs:inline">All Activities</span>
              <span className="xs:hidden">All</span>
              <Badge variant="secondary" className="ml-2">
                {activities.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="uploads" className="whitespace-nowrap">
              Uploads
              <Badge variant="secondary" className="ml-2">
                {uploadActivities.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="access" className="whitespace-nowrap">
              Access
              <Badge variant="secondary" className="ml-2">
                {accessActivities.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="reviews" className="whitespace-nowrap">
              Reviews
              <Badge variant="secondary" className="ml-2">
                {reviewActivities.length}
              </Badge>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Platform Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px] pr-4">
                {activities.length === 0 ? (
                  <div className="text-center py-12">
                    <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">No activities yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activities.map((activity, index) => (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`flex items-start gap-4 p-4 rounded-lg border ${getActivityColor(
                          activity.type
                        )}`}
                      >
                        <div className="flex-shrink-0 mt-1">{getActivityIcon(activity.type)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <User className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs font-medium text-muted-foreground">
                              {activity.userName}
                            </span>
                          </div>
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-medium">{activity.message}</p>
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
        </TabsContent>

        <TabsContent value="uploads">
          <Card>
            <CardHeader>
              <CardTitle>Upload Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-3">
                  {uploadActivities.map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`flex items-start gap-4 p-4 rounded-lg border ${getActivityColor(
                        activity.type
                      )}`}
                    >
                      <div className="flex-shrink-0 mt-1">{getActivityIcon(activity.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <User className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs font-medium text-muted-foreground">
                            {activity.userName}
                          </span>
                        </div>
                        <p className="text-sm font-medium">{activity.message}</p>
                        <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {activity.time}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="access">
          <Card>
            <CardHeader>
              <CardTitle>Access Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-3">
                  {accessActivities.map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`flex items-start gap-4 p-4 rounded-lg border ${getActivityColor(
                        activity.type
                      )}`}
                    >
                      <div className="flex-shrink-0 mt-1">{getActivityIcon(activity.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <User className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs font-medium text-muted-foreground">
                            {activity.userName}
                          </span>
                        </div>
                        <p className="text-sm font-medium">{activity.message}</p>
                        <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {activity.time}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews">
          <Card>
            <CardHeader>
              <CardTitle>Review Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-3">
                  {reviewActivities.map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`flex items-start gap-4 p-4 rounded-lg border ${getActivityColor(
                        activity.type
                      )}`}
                    >
                      <div className="flex-shrink-0 mt-1">{getActivityIcon(activity.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <User className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs font-medium text-muted-foreground">
                            {activity.userName}
                          </span>
                        </div>
                        <p className="text-sm font-medium">{activity.message}</p>
                        <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {activity.time}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}