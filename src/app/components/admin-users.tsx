import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { motion } from 'motion/react';
import { useState } from 'react';
import {
  User,
  Mail,
  Calendar,
  Search,
  Ban,
  CheckCircle,
  Shield,
  GraduationCap,
} from 'lucide-react';

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  institution?: string;
  joinDate: string;
  points: number;
  uploadCount: number;
  accessCount: number;
  status: 'active' | 'suspended';
}

interface AdminUsersProps {
  users: UserData[];
  onSuspendUser: (userId: string) => void;
  onActivateUser: (userId: string) => void;
}

export function AdminUsers({ users, onSuspendUser, onActivateUser }: AdminUsersProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleIcon = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return <Shield className="h-4 w-4" />;
      case 'faculty':
        return <GraduationCap className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case 'faculty':
        return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
      case 'researcher':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const stats = [
    { label: 'Total Users', value: users.length },
    { label: 'Active Users', value: users.filter((u) => u.status === 'active').length },
    { label: 'Suspended', value: users.filter((u) => u.status === 'suspended').length },
  ];

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">User Management</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Monitor and manage platform users</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users by name, email, or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>All Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-3">
              {filteredUsers.map((user, index) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-4 rounded-lg border ${
                    user.status === 'suspended'
                      ? 'bg-red-500/5 border-red-500/20'
                      : 'bg-muted/50'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row items-start justify-between gap-4">
                    <div className="flex-1 min-w-0 space-y-3 w-full">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-semibold">
                          {user.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-medium break-words">{user.name}</span>
                            <Badge
                              variant="outline"
                              className={`flex items-center gap-1 shrink-0 ${getRoleBadgeColor(user.role)}`}
                            >
                              {getRoleIcon(user.role)}
                              {user.role}
                            </Badge>
                            {user.status === 'suspended' && (
                              <Badge variant="destructive" className="shrink-0">Suspended</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                            <Mail className="h-3 w-3 shrink-0" />
                            <span className="truncate">{user.email}</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        {user.institution && (
                          <div className="min-w-0">
                            <p className="text-muted-foreground text-xs">Institution</p>
                            <p className="font-medium truncate">{user.institution}</p>
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-muted-foreground text-xs">Points</p>
                          <p className="font-medium">{user.points}</p>
                        </div>
                        <div className="min-w-0">
                          <p className="text-muted-foreground text-xs">Uploads</p>
                          <p className="font-medium">{user.uploadCount}</p>
                        </div>
                        <div className="min-w-0">
                          <p className="text-muted-foreground text-xs">Access Count</p>
                          <p className="font-medium">{user.accessCount}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3 shrink-0" />
                        <span className="truncate">Joined {user.joinDate}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 w-full lg:w-auto">
                      {user.status === 'active' ? (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => onSuspendUser(user.id)}
                          className="flex-1 lg:flex-initial"
                        >
                          <Ban className="h-4 w-4 mr-1" />
                          Suspend
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => onActivateUser(user.id)}
                          className="bg-green-600 hover:bg-green-700 flex-1 lg:flex-initial"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Activate
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}