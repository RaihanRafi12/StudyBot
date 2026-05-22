import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { motion } from 'motion/react';
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  FileText,
  User,
  Calendar,
  Edit,
  Trash2,
  MessageSquare,
} from 'lucide-react';

interface AccessRequest {
  id: string;
  userId: string;
  userName: string;
  resourceId: string;
  resourceTitle: string;
  message: string;
  timestamp: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface UploadApproval {
  id: string;
  userId: string;
  userName: string;
  resourceTitle: string;
  category: string;
  timestamp: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface ReportedResource {
  id: string;
  resourceId: string;
  resourceTitle: string;
  reportedBy: string;
  reason: string;
  timestamp: string;
  status: 'pending' | 'resolved' | 'dismissed';
}

interface AdminDashboardProps {
  accessRequests: AccessRequest[];
  uploadApprovals: UploadApproval[];
  reportedResources: ReportedResource[];
  onApproveAccess: (requestId: string) => void;
  onRejectAccess: (requestId: string) => void;
  onApproveUpload: (uploadId: string) => void;
  onRejectUpload: (uploadId: string) => void;
  onResolveReport: (reportId: string) => void;
  onDismissReport: (reportId: string) => void;
}

export function AdminDashboard({
  accessRequests,
  uploadApprovals,
  reportedResources,
  onApproveAccess,
  onRejectAccess,
  onApproveUpload,
  onRejectUpload,
  onResolveReport,
  onDismissReport,
}: AdminDashboardProps) {
  const pendingAccessRequests = accessRequests.filter((r) => r.status === 'pending');
  const pendingUploadApprovals = uploadApprovals.filter((u) => u.status === 'pending');
  const pendingReports = reportedResources.filter((r) => r.status === 'pending');

  const stats = [
    {
      label: 'Pending Access Requests',
      value: pendingAccessRequests.length,
      icon: Clock,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      label: 'Pending Uploads',
      value: pendingUploadApprovals.length,
      icon: FileText,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
    },
    {
      label: 'Reported Resources',
      value: pendingReports.length,
      icon: AlertTriangle,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Request approvals and platform overview</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${stat.bgColor} shrink-0`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-3xl font-bold">{stat.value}</p>
                      <p className="text-sm text-muted-foreground break-words">{stat.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Tabs for different sections */}
      <Tabs defaultValue="access" className="space-y-6">
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <TabsList className="inline-flex w-auto min-w-full sm:min-w-0">
            <TabsTrigger value="access" className="whitespace-nowrap">
              <span className="hidden sm:inline">Access Requests</span>
              <span className="sm:hidden">Access</span>
              {pendingAccessRequests.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {pendingAccessRequests.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="uploads" className="whitespace-nowrap">
              <span className="hidden sm:inline">Upload Approvals</span>
              <span className="sm:hidden">Uploads</span>
              {pendingUploadApprovals.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {pendingUploadApprovals.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="reports" className="whitespace-nowrap">
              <span className="hidden sm:inline">Reported Resources</span>
              <span className="sm:hidden">Reports</span>
              {pendingReports.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {pendingReports.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Access Requests Tab */}
        <TabsContent value="access">
          <Card>
            <CardHeader>
              <CardTitle>Pending Access Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px] pr-4">
                {pendingAccessRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">No pending access requests</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingAccessRequests.map((request, index) => (
                      <motion.div
                        key={request.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-4 rounded-lg border bg-muted/50"
                      >
                        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                          <div className="flex-1 space-y-2 min-w-0 w-full">
                            <div className="flex items-center gap-2 flex-wrap">
                              <User className="h-4 w-4 text-muted-foreground shrink-0" />
                              <span className="font-medium break-words">{request.userName}</span>
                              <Badge variant="outline" className="text-xs shrink-0">
                                User ID: {request.userId}
                              </Badge>
                            </div>
                            <div className="flex items-start gap-2">
                              <FileText className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                              <span className="text-sm font-medium break-words">{request.resourceTitle}</span>
                            </div>
                            {request.message && (
                              <div className="flex items-start gap-2 mt-2">
                                <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                                <p className="text-sm text-muted-foreground break-words">{request.message}</p>
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3 shrink-0" />
                              <span className="break-words">{request.timestamp}</span>
                            </div>
                          </div>
                          <div className="flex gap-2 w-full sm:w-auto sm:flex-shrink-0">
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => onApproveAccess(request.id)}
                              className="bg-green-600 hover:bg-green-700 flex-1 sm:flex-initial"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => onRejectAccess(request.id)}
                              className="flex-1 sm:flex-initial"
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Upload Approvals Tab */}
        <TabsContent value="uploads">
          <Card>
            <CardHeader>
              <CardTitle>Pending Upload Approvals</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px] pr-4">
                {pendingUploadApprovals.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">No pending upload approvals</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingUploadApprovals.map((upload, index) => (
                      <motion.div
                        key={upload.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-4 rounded-lg border bg-muted/50"
                      >
                        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                          <div className="flex-1 space-y-2 min-w-0 w-full">
                            <div className="flex items-center gap-2 flex-wrap">
                              <User className="h-4 w-4 text-muted-foreground shrink-0" />
                              <span className="font-medium break-words">{upload.userName}</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <FileText className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                              <span className="text-sm font-medium break-words">{upload.resourceTitle}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary">{upload.category}</Badge>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3 shrink-0" />
                              <span className="break-words">{upload.timestamp}</span>
                            </div>
                          </div>
                          <div className="flex gap-2 w-full sm:w-auto sm:flex-shrink-0">
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => onApproveUpload(upload.id)}
                              className="bg-green-600 hover:bg-green-700 flex-1 sm:flex-initial"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => onRejectUpload(upload.id)}
                              className="flex-1 sm:flex-initial"
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reported Resources Tab */}
        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Reported Resources</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px] pr-4">
                {pendingReports.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">No reported resources</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingReports.map((report, index) => (
                      <motion.div
                        key={report.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-4 rounded-lg border bg-red-500/5 border-red-500/20"
                      >
                        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                          <div className="flex-1 space-y-2 min-w-0 w-full">
                            <div className="flex items-start gap-2">
                              <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                              <span className="font-medium break-words">{report.resourceTitle}</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <User className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                              <span className="text-sm text-muted-foreground break-words">
                                Reported by: {report.reportedBy}
                              </span>
                            </div>
                            <div className="flex items-start gap-2 mt-2">
                              <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                              <p className="text-sm text-muted-foreground break-words">{report.reason}</p>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3 shrink-0" />
                              <span className="break-words">{report.timestamp}</span>
                            </div>
                          </div>
                          <div className="flex gap-2 w-full sm:w-auto sm:flex-shrink-0">
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => onResolveReport(report.id)}
                              className="bg-green-600 hover:bg-green-700 flex-1 sm:flex-initial"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Resolve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onDismissReport(report.id)}
                              className="flex-1 sm:flex-initial"
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Dismiss
                            </Button>
                          </div>
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
    </div>
  );
}