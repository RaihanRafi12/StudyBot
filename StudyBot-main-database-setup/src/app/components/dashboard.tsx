import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { motion } from 'motion/react';
import { Coins, Upload, Eye, Calendar as CalendarIcon, Clock, AlertCircle } from 'lucide-react';
import { Badge } from './ui/badge';

interface DashboardProps {
  points: number;
  monthlyAccess: number;
  uploadCount: number;
  activities: Array<{ id: string; type: string; message: string; time: string }>;
  upcomingEvents: Array<{ id: string; title: string; date: string; type: string }>;
}

export function Dashboard({
  points,
  monthlyAccess,
  uploadCount,
  activities,
  upcomingEvents,
}: DashboardProps) {
  const stats = [
    {
      title: 'Points Balance',
      value: points,
      icon: Coins,
      gradient: 'from-amber-500 to-orange-500',
    },
    {
      title: 'Monthly Access',
      value: `${monthlyAccess}/4`,
      icon: Eye,
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Total Uploads',
      value: uploadCount,
      icon: Upload,
      gradient: 'from-green-500 to-emerald-500',
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back to StudyBot</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="relative overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-5`} />
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendar & Reminders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Upcoming Events
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No upcoming events
              </p>
            ) : (
              upcomingEvents.map((event) => (
                <motion.div
                  key={event.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  whileHover={{ x: 4 }}
                >
                  <div className={`p-2 rounded-lg ${
                    event.type === 'exam' ? 'bg-red-500/10' : 
                    event.type === 'deadline' ? 'bg-orange-500/10' : 'bg-blue-500/10'
                  }`}>
                    {event.type === 'exam' ? (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    ) : (
                      <Clock className="h-4 w-4 text-orange-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{event.title}</p>
                    <p className="text-xs text-muted-foreground">{event.date}</p>
                  </div>
                  <Badge variant={event.type === 'exam' ? 'destructive' : 'default'}>
                    {event.type}
                  </Badge>
                </motion.div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {activities.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No recent activity
              </p>
            ) : (
              activities.map((activity) => (
                <motion.div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/30"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <div className="flex-1">
                    <p className="text-sm">{activity.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                  </div>
                </motion.div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}