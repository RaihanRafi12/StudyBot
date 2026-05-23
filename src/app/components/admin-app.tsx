import { useState, useEffect } from 'react';
import { AdminHeader } from './admin-header';
import { AdminSidebar } from './admin-sidebar';
import { AdminDashboard } from './admin-dashboard';
import { AdminResources } from './admin-resources';
import { AdminUsers } from './admin-users';
import { AdminActivity } from './admin-activity';
import { AdminSettings } from './admin-settings';
import { ResourceDetailModal } from './resource-detail-modal';
import { EditResourceModal } from './edit-resource-modal';
import { CourseContentModal } from './course-content-modal';
import { Toaster } from './ui/sonner';
import { toast } from 'sonner';

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

interface AdminAppProps {
  adminName: string;
  adminEmail: string;
  resources: Resource[];
  onLogout: () => void;
  onUpdateResources: (resources: Resource[]) => void;
}

export function AdminApp({
  adminName,
  adminEmail,
  resources,
  onLogout,
  onUpdateResources,
}: AdminAppProps) {
  const [currentView, setCurrentView] = useState('admin-dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  // Resource modal states
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
  const [isEditResourceModalOpen, setIsEditResourceModalOpen] = useState(false);
  const [isCourseContentModalOpen, setIsCourseContentModalOpen] = useState(false);

  // Apply theme to document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Admin data states
  const [accessRequests, setAccessRequests] = useState([
    {
      id: 'req-1',
      userId: 'user-5',
      userName: 'James Wilson',
      resourceId: 'res-3',
      resourceTitle: 'Web Development Bootcamp',
      message: 'Need this for my final year project on full-stack development',
      timestamp: '2 hours ago',
      status: 'pending',
    },
    {
      id: 'req-2',
      userId: 'user-14',
      userName: 'Rachel Green',
      resourceId: 'res-15',
      resourceTitle: 'System Design Interview Preparation',
      message: 'Preparing for job interviews',
      timestamp: '5 hours ago',
      status: 'pending',
    },
    {
      id: 'req-3',
      userId: 'user-10',
      userName: 'Sarah Martinez',
      resourceId: 'res-6',
      resourceTitle: 'Social Media Dashboard',
      message: 'Need for academic research project',
      timestamp: '1 day ago',
      status: 'pending',
    },
  ]);

  const [uploadApprovals, setUploadApprovals] = useState([
    {
      id: 'upload-1',
      userId: 'user-16',
      userName: 'Tom Anderson',
      resourceTitle: 'Advanced React Patterns',
      category: 'Documents',
      timestamp: '1 hour ago',
      status: 'pending',
    },
    {
      id: 'upload-2',
      userId: 'user-11',
      userName: 'David Lee',
      resourceTitle: 'Microservices Architecture Guide',
      category: 'Documents',
      timestamp: '3 hours ago',
      status: 'pending',
    },
  ]);

  const [reportedResources, setReportedResources] = useState([
    {
      id: 'report-1',
      resourceId: 'res-8',
      resourceTitle: 'Task Management System',
      reportedBy: 'StudentUser123',
      reason: 'Contains outdated dependencies and deprecated code',
      timestamp: '30 minutes ago',
      status: 'pending',
    },
  ]);

  const [users, setUsers] = useState([
    {
      id: 'user-1',
      name: 'Alex Johnson',
      email: 'alex.johnson@university.edu',
      role: 'Student',
      institution: 'University of Technology',
      joinDate: 'Dec 10, 2025',
      points: 24,
      uploadCount: 5,
      accessCount: 8,
      status: 'active',
    },
    {
      id: 'user-5',
      name: 'James Wilson',
      email: 'james.wilson@university.edu',
      role: 'Student',
      institution: 'State University',
      joinDate: 'Jan 2, 2026',
      points: 18,
      uploadCount: 3,
      accessCount: 12,
      status: 'active',
    },
    {
      id: 'user-3',
      name: 'Prof. Michael Chen',
      email: 'michael.chen@university.edu',
      role: 'Faculty',
      institution: 'University of Technology',
      joinDate: 'Nov 20, 2025',
      points: 45,
      uploadCount: 12,
      accessCount: 5,
      status: 'active',
    },
  ]);

  const [activities, setActivities] = useState([
    {
      id: 'act-1',
      userId: 'user-5',
      userName: 'James Wilson',
      type: 'upload',
      message: 'Uploaded "Data Structures Cheat Sheet"',
      time: '1 hour ago',
      points: 2,
    },
    {
      id: 'act-2',
      userId: 'user-1',
      userName: 'Alex Johnson',
      type: 'access',
      message: 'Accessed "Machine Learning Fundamentals"',
      time: '2 hours ago',
      points: -4,
    },
    {
      id: 'act-3',
      userId: 'user-14',
      userName: 'Rachel Green',
      type: 'review',
      message: 'Reviewed "Python Programming Guide" with 5 stars',
      time: '3 hours ago',
    },
  ]);

  // Admin handlers
  const handleApproveAccess = (requestId: string) => {
    setAccessRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'approved' } : r))
    );
    toast.success('Access request approved');
  };

  const handleRejectAccess = (requestId: string) => {
    setAccessRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'rejected' } : r))
    );
    toast.info('Access request rejected');
  };

  const handleApproveUpload = (uploadId: string) => {
    setUploadApprovals((prev) =>
      prev.map((u) => (u.id === uploadId ? { ...u, status: 'approved' } : u))
    );
    toast.success('Upload approved');
  };

  const handleRejectUpload = (uploadId: string) => {
    setUploadApprovals((prev) =>
      prev.map((u) => (u.id === uploadId ? { ...u, status: 'rejected' } : u))
    );
    toast.info('Upload rejected');
  };

  const handleResolveReport = (reportId: string) => {
    setReportedResources((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, status: 'resolved' } : r))
    );
    toast.success('Report resolved');
  };

  const handleDismissReport = (reportId: string) => {
    setReportedResources((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, status: 'dismissed' } : r))
    );
    toast.info('Report dismissed');
  };

  const handleEditResource = (resourceId: string) => {
    const resource = resources.find((r) => r.id === resourceId);
    if (resource) {
      setSelectedResource(resource);
      // Show course content modal for courses, regular edit modal for other resources
      if (resource.category.toLowerCase() === 'courses') {
        setIsCourseContentModalOpen(true);
      } else {
        setIsEditResourceModalOpen(true);
      }
    }
  };

  const handleDeleteResource = (resourceId: string) => {
    const updatedResources = resources.filter((r) => r.id !== resourceId);
    onUpdateResources(updatedResources);
    toast.success('Resource deleted permanently');
  };

  const handleApproveResource = (resourceId: string) => {
    toast.success(`Resource ${resourceId} approved`);
  };

  const handleRejectResource = (resourceId: string) => {
    toast.info(`Resource ${resourceId} rejected`);
  };

  const handleRequestChanges = (resourceId: string) => {
    toast.info(`Requested changes for resource ${resourceId}`);
  };

  const handleRequestCourseItemChanges = (resourceId: string, itemId: string) => {
    toast.warning(`Requested changes for item ${itemId} in course ${resourceId}`);
  };

  const handleRemoveCourseItem = (resourceId: string, itemId: string) => {
    toast.success(`Removed item ${itemId} from course ${resourceId}`);
  };

  const handleViewResource = (resourceId: string) => {
    const resource = resources.find((r) => r.id === resourceId);
    if (resource) {
      setSelectedResource(resource);
      setIsResourceModalOpen(true);
    }
  };

  const handleSaveResource = (resourceId: string, updatedResource: Partial<Resource>) => {
    const updatedResources = resources.map((r) =>
      r.id === resourceId ? { ...r, ...updatedResource } : r
    );
    onUpdateResources(updatedResources);
    toast.success('Resource updated successfully');
  };

  const handleSuspendUser = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: 'suspended' } : u))
    );
    toast.warning('User suspended');
  };

  const handleActivateUser = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: 'active' } : u))
    );
    toast.success('User activated');
  };

  const handleThemeToggle = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleNavigate = (view: string) => {
    setCurrentView(view);
    // Close sidebar on mobile
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  const pendingCount =
    accessRequests.filter((r) => r.status === 'pending').length +
    uploadApprovals.filter((u) => u.status === 'pending').length +
    reportedResources.filter((r) => r.status === 'pending').length;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex flex-col h-screen overflow-hidden">
        {/* Admin Header */}
        <AdminHeader
          adminName={adminName}
          theme={theme}
          onThemeToggle={handleThemeToggle}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onLogout={onLogout}
        />

        <div className="flex flex-1 overflow-hidden">
          {/* Admin Sidebar */}
          <AdminSidebar
            currentView={currentView}
            onNavigate={handleNavigate}
            onClose={() => setIsSidebarOpen(false)}
            isOpen={isSidebarOpen}
            pendingCount={pendingCount}
          />

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden bg-muted/5">
            {currentView === 'admin-dashboard' && (
              <AdminDashboard
                accessRequests={accessRequests}
                uploadApprovals={uploadApprovals}
                reportedResources={reportedResources}
                onApproveAccess={handleApproveAccess}
                onRejectAccess={handleRejectAccess}
                onApproveUpload={handleApproveUpload}
                onRejectUpload={handleRejectUpload}
                onResolveReport={handleResolveReport}
                onDismissReport={handleDismissReport}
              />
            )}

            {currentView === 'admin-activity' && <AdminActivity activities={activities} />}

            {currentView === 'admin-resources' && (
              <AdminResources
                resources={resources}
                onEditResource={handleEditResource}
                onDeleteResource={handleDeleteResource}
                onApproveResource={handleApproveResource}
                onRejectResource={handleRejectResource}
                onRequestChanges={handleRequestChanges}
                onViewResource={handleViewResource}
              />
            )}

            {currentView === 'admin-users' && (
              <AdminUsers
                users={users}
                onSuspendUser={handleSuspendUser}
                onActivateUser={handleActivateUser}
              />
            )}

            {currentView === 'settings' && (
              <AdminSettings
                theme={theme}
                onThemeChange={setTheme}
                adminName={adminName}
                adminEmail={adminEmail}
                onLogout={onLogout}
              />
            )}
          </main>
        </div>
      </div>

      <Toaster />
      <ResourceDetailModal
        resource={selectedResource}
        isOpen={isResourceModalOpen}
        onClose={() => setIsResourceModalOpen(false)}
      />
      <EditResourceModal
        resource={selectedResource}
        isOpen={isEditResourceModalOpen}
        onClose={() => setIsEditResourceModalOpen(false)}
        onSave={handleSaveResource}
      />
      <CourseContentModal
        resource={selectedResource}
        isOpen={isCourseContentModalOpen}
        onClose={() => setIsCourseContentModalOpen(false)}
        onRequestChanges={handleRequestCourseItemChanges}
        onRemoveItem={handleRemoveCourseItem}
      />
    </div>
  );
}