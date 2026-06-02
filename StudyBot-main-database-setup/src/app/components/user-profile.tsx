import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { motion } from 'motion/react';
import { 
  Upload, 
  Download, 
  Coins, 
  Pencil, 
  Save, 
  X,
  Star,
  GitPullRequest,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { useState } from 'react';

interface Activity {
  id: string;
  type: 'upload' | 'access' | 'review' | 'request' | 'approved';
  message: string;
  time: string;
  points?: number;
}

interface UserProfileProps {
  user: {
    id: string;
    name: string;
    email: string;
    institution: string;
    major: string;
    year: string;
  };
  points: number;
  uploadCount: number;
  accessCount: number;
  activities: Activity[];
  onUpdateProfile: (updates: Partial<UserProfileProps['user']>) => void;
  onViewUploads: () => void;
  onViewAccessed: () => void;
}

export function UserProfile({
  user,
  points,
  uploadCount,
  accessCount,
  activities,
  onUpdateProfile,
  onViewUploads,
  onViewAccessed,
}: UserProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(user);

  const handleSave = () => {
    onUpdateProfile(editedUser);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedUser(user);
    setIsEditing(false);
  };

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

  const stats = [
    { label: 'Points', value: points, icon: Coins, color: 'text-amber-500', onClick: null },
    { label: 'Uploads', value: uploadCount, icon: Upload, color: 'text-green-500', onClick: onViewUploads },
    { label: 'Accessed', value: accessCount, icon: Download, color: 'text-blue-500', onClick: onViewAccessed },
  ];

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground">Manage your account details</p>
      </div>

      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <Avatar className="h-24 w-24">
              <AvatarFallback className="text-2xl">
                {user.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 w-full">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                <h2 className="text-2xl font-bold">{user.name}</h2>
                {!isEditing ? (
                  <Button onClick={() => setIsEditing(true)} variant="outline" size="sm" className="w-full sm:w-auto">
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                ) : (
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Button onClick={handleSave} size="sm" className="flex-1 sm:flex-initial">
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                    <Button onClick={handleCancel} variant="outline" size="sm" className="flex-1 sm:flex-initial">
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
              <p className="text-muted-foreground mb-4">{user.email}</p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <motion.div
                      key={stat.label}
                      className={`flex items-center gap-3 p-3 rounded-lg bg-muted/50 ${
                        stat.onClick ? 'cursor-pointer hover:bg-muted transition-colors' : ''
                      }`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={stat.onClick ? { scale: 1.02 } : {}}
                      whileTap={stat.onClick ? { scale: 0.98 } : {}}
                      onClick={stat.onClick || undefined}
                    >
                      <div className={`p-2 rounded-lg bg-background ${stat.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{stat.value}</p>
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Details */}
      <Tabs defaultValue="info" className="space-y-6">
        <TabsList>
          <TabsTrigger value="info">Information</TabsTrigger>
          <TabsTrigger value="activity">Activity Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  {isEditing ? (
                    <Input
                      id="name"
                      value={editedUser.name}
                      onChange={(e) => setEditedUser({ ...editedUser, name: e.target.value })}
                    />
                  ) : (
                    <p className="p-2 rounded-lg bg-muted/50">{user.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  {isEditing ? (
                    <Input
                      id="email"
                      type="email"
                      value={editedUser.email}
                      onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })}
                    />
                  ) : (
                    <p className="p-2 rounded-lg bg-muted/50">{user.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="institution">Institution</Label>
                  {isEditing ? (
                    <Input
                      id="institution"
                      value={editedUser.institution}
                      onChange={(e) => setEditedUser({ ...editedUser, institution: e.target.value })}
                    />
                  ) : (
                    <p className="p-2 rounded-lg bg-muted/50">{user.institution}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="major">Major</Label>
                  {isEditing ? (
                    <Input
                      id="major"
                      value={editedUser.major}
                      onChange={(e) => setEditedUser({ ...editedUser, major: e.target.value })}
                    />
                  ) : (
                    <p className="p-2 rounded-lg bg-muted/50">{user.major}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="year">Academic Year</Label>
                  {isEditing ? (
                    <Input
                      id="year"
                      value={editedUser.year}
                      onChange={(e) => setEditedUser({ ...editedUser, year: e.target.value })}
                    />
                  ) : (
                    <p className="p-2 rounded-lg bg-muted/50">{user.year}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] pr-4">
                {activities.length === 0 ? (
                  <div className="text-center py-12">
                    <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">No recent activities</p>
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
                        <div className="flex-shrink-0 mt-1">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1 min-w-0">
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
      </Tabs>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle>Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 text-center">
              <div className="text-3xl mb-2">🎓</div>
              <p className="font-semibold">Scholar</p>
              <p className="text-xs text-muted-foreground mt-1">Earned 20+ points</p>
            </div>
            <div className="p-4 rounded-lg bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 text-center">
              <div className="text-3xl mb-2">📤</div>
              <p className="font-semibold">Contributor</p>
              <p className="text-xs text-muted-foreground mt-1">Uploaded 5+ resources</p>
            </div>
            <div className="p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 text-center opacity-50">
              <div className="text-3xl mb-2">⭐</div>
              <p className="font-semibold">Reviewer</p>
              <p className="text-xs text-muted-foreground mt-1">Leave 10 reviews</p>
            </div>
            <div className="p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 text-center opacity-50">
              <div className="text-3xl mb-2">🏆</div>
              <p className="font-semibold">Champion</p>
              <p className="text-xs text-muted-foreground mt-1">Reach 100 points</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
