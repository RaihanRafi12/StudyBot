import { useState, useEffect, useCallback } from 'react';
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
import { admin, resources as resourcesApi } from '../services/api';
import { getErrorMessage, mapApiResource, normalizeCategory } from '../services/mappers';

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

  const [accessRequests, setAccessRequests] = useState<
    Array<{
      id: string;
      userId: string;
      userName: string;
      resourceId: string;
      resourceTitle: string;
      message?: string;
      timestamp: string;
      status: string;
    }>
  >([]);

  const [uploadApprovals, setUploadApprovals] = useState<
    Array<{
      id: string;
      userId: string;
      userName: string;
      resourceTitle: string;
      category: string;
      timestamp: string;
      status: string;
    }>
  >([]);

  const [reportedResources, setReportedResources] = useState<
    Array<{
      id: string;
      resourceId: string;
      resourceTitle: string;
      reportedBy: string;
      reason: string;
      timestamp: string;
      status: string;
    }>
  >([]);

  const [users, setUsers] = useState<
    Array<{
      id: string;
      name: string;
      email: string;
      role: string;
      institution?: string;
      joinDate: string;
      points: number;
      uploadCount: number;
      accessCount: number;
      status: string;
    }>
  >([]);

  const [activities, setActivities] = useState<
    Array<{
      id: string;
      userId: string;
      userName: string;
      type: string;
      message: string;
      time: string;
      points?: number;
    }>
  >([]);

  const [adminResources, setAdminResources] = useState(resources);

  const loadAdminData = useCallback(async () => {
    try {
      const [ar, ua, rep, usr, act, res] = await Promise.all([
        admin.getAccessRequests(),
        admin.getUploadApprovals(),
        admin.getReports(),
        admin.getUsers(),
        admin.getActivities(),
        resourcesApi.list({ limit: 100 }),
      ]);

      setAccessRequests(
        (ar.data as Array<Record<string, unknown>>).map((r) => ({
          id: String(r.id),
          userId: String(r.user_id),
          userName: String(r.user_name),
          resourceId: String(r.resource_id),
          resourceTitle: String(r.resource_title),
          message: r.message ? String(r.message) : undefined,
          timestamp: String(r.timestamp),
          status: String(r.status),
        })),
      );

      setUploadApprovals(
        (ua.data as Array<Record<string, unknown>>).map((u) => ({
          id: String(u.id),
          userId: String(u.user_id),
          userName: String(u.user_name),
          resourceTitle: String(u.resource_title),
          category: String(u.category),
          timestamp: String(u.timestamp),
          status: String(u.status),
        })),
      );

      setReportedResources(
        (rep.data as Array<Record<string, unknown>>).map((r) => ({
          id: String(r.id),
          resourceId: String(r.resource_id),
          resourceTitle: String(r.resource_title),
          reportedBy: String(r.reported_by),
          reason: String(r.reason),
          timestamp: String(r.timestamp),
          status: String(r.status),
        })),
      );

      setUsers(
        (usr.data as Array<Record<string, unknown>>).map((u) => ({
          id: String(u.id),
          name: String(u.name),
          email: String(u.email),
          role: String(u.role).charAt(0).toUpperCase() + String(u.role).slice(1),
          institution: u.institution ? String(u.institution) : undefined,
          joinDate: String(u.join_date),
          points: Number(u.points ?? 0),
          uploadCount: Number(u.upload_count ?? 0),
          accessCount: Number(u.access_count ?? 0),
          status: String(u.status),
        })),
      );

      setActivities(
        (act.data as Array<Record<string, unknown>>).map((a) => ({
          id: String(a.id),
          userId: String(a.user_id),
          userName: String(a.user_name),
          type: String(a.type),
          message: String(a.message),
          time: String(a.time),
          points: a.points != null ? Number(a.points) : undefined,
        })),
      );

      const mapped = (res.data as Record<string, unknown>[]).map(mapApiResource);
      setAdminResources(mapped);
      onUpdateResources(mapped);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not load admin data'));
    }
  }, [onUpdateResources]);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  useEffect(() => {
    setAdminResources(resources);
  }, [resources]);

  const handleApproveAccess = async (requestId: string) => {
    try {
      await admin.approveAccess(requestId);
      await loadAdminData();
      toast.success('Access request approved');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not approve request'));
    }
  };

  const handleRejectAccess = async (requestId: string) => {
    try {
      await admin.rejectAccess(requestId);
      await loadAdminData();
      toast.info('Access request rejected');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not reject request'));
    }
  };

  const handleApproveUpload = async (uploadId: string) => {
    try {
      await admin.approveUpload(uploadId);
      await loadAdminData();
      toast.success('Upload approved');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not approve upload'));
    }
  };

  const handleRejectUpload = async (uploadId: string) => {
    try {
      await admin.rejectUpload(uploadId);
      await loadAdminData();
      toast.info('Upload rejected');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not reject upload'));
    }
  };

  const handleResolveReport = async (reportId: string) => {
    try {
      await admin.resolveReport(reportId);
      await loadAdminData();
      toast.success('Report resolved');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not resolve report'));
    }
  };

  const handleDismissReport = async (reportId: string) => {
    try {
      await admin.dismissReport(reportId);
      await loadAdminData();
      toast.info('Report dismissed');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not dismiss report'));
    }
  };

  const handleEditResource = (resourceId: string) => {
    const resource = adminResources.find((r) => r.id === resourceId);
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

  const handleDeleteResource = async (resourceId: string) => {
    try {
      await resourcesApi.delete(resourceId);
      const updatedResources = adminResources.filter((r) => r.id !== resourceId);
      setAdminResources(updatedResources);
      onUpdateResources(updatedResources);
      toast.success('Resource deleted permanently');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not delete resource'));
    }
  };

  const handleApproveResource = async (resourceId: string) => {
    const pending = uploadApprovals.find(
      (u) => u.status === 'pending' && adminResources.some((r) => r.id === resourceId && r.title === u.resourceTitle),
    );
    if (pending) {
      await handleApproveUpload(pending.id);
      return;
    }
    toast.success(`Resource ${resourceId} approved`);
  };

  const handleRejectResource = async (resourceId: string) => {
    const pending = uploadApprovals.find(
      (u) => u.status === 'pending' && adminResources.some((r) => r.id === resourceId && r.title === u.resourceTitle),
    );
    if (pending) {
      await handleRejectUpload(pending.id);
      return;
    }
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
    const resource = adminResources.find((r) => r.id === resourceId);
    if (resource) {
      setSelectedResource(resource);
      setIsResourceModalOpen(true);
    }
  };

  const handleSaveResource = async (
    resourceId: string,
    updatedResource: Partial<Resource>,
  ) => {
    try {
      await resourcesApi.update(resourceId, {
        title: updatedResource.title,
        description: updatedResource.description,
        category: updatedResource.category
          ? normalizeCategory(updatedResource.category)
          : undefined,
        is_public: updatedResource.isPublic,
      });
      await loadAdminData();
      toast.success('Resource updated successfully');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not update resource'));
    }
  };

  const handleSuspendUser = async (userId: string) => {
    try {
      await admin.suspendUser(userId);
      await loadAdminData();
      toast.warning('User suspended');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not suspend user'));
    }
  };

  const handleActivateUser = async (userId: string) => {
    try {
      await admin.activateUser(userId);
      await loadAdminData();
      toast.success('User activated');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not activate user'));
    }
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
                resources={adminResources}
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