import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
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

  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
  const [isEditResourceModalOpen, setIsEditResourceModalOpen] = useState(false);
  const [isCourseContentModalOpen, setIsCourseContentModalOpen] = useState(false);

  // ── Data loaded from Supabase ────────────────────────────────────────────
  const [accessRequests, setAccessRequests] = useState<any[]>([]);
  const [uploadApprovals, setUploadApprovals] = useState<any[]>([]);
  const [reportedResources, setReportedResources] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);

  const loadAdminData = useCallback(async () => {
    // Access requests
    const { data: reqData } = await supabase
      .from('access_requests')
      .select('*, users(name), resources(title)')
      .order('created_at', { ascending: false });

    setAccessRequests(
      (reqData ?? []).map((r: any) => ({
        id: r.id,
        userId: r.user_id,
        userName: r.users?.name ?? 'Unknown',
        resourceId: r.resource_id,
        resourceTitle: r.resources?.title ?? 'Unknown',
        message: r.message ?? '',
        timestamp: new Date(r.created_at).toLocaleString(),
        status: r.status,
      }))
    );

    // Upload approvals — resources with status = pending
    const { data: uploadsData } = await supabase
      .from('resources')
      .select('*, users(name)')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    setUploadApprovals(
      (uploadsData ?? []).map((r: any) => ({
        id: r.id,
        userId: r.uploader_id,
        userName: r.users?.name ?? 'Unknown',
        resourceTitle: r.title,
        category: r.category,
        timestamp: new Date(r.created_at).toLocaleString(),
        status: r.status,
      }))
    );

    // Reports
    const { data: reportData } = await supabase
      .from('reports')
      .select('*, resources(title), users(name)')
      .order('created_at', { ascending: false });

    setReportedResources(
      (reportData ?? []).map((r: any) => ({
        id: r.id,
        resourceId: r.resource_id,
        resourceTitle: r.resources?.title ?? 'Unknown',
        reportedBy: r.users?.name ?? 'Unknown',
        reason: r.reason,
        timestamp: new Date(r.created_at).toLocaleString(),
        status: r.status,
      }))
    );

    // Users
    const { data: usersData } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    setUsers(
      (usersData ?? []).map((u: any) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role.charAt(0).toUpperCase() + u.role.slice(1),
        institution: u.institution ?? '',
        joinDate: new Date(u.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
        points: u.points,
        uploadCount: u.upload_count ?? 0,
        accessCount: u.access_count ?? 0,
        status: u.status ?? 'active',
      }))
    );

    // Activities
    const { data: activityData } = await supabase
      .from('activity_logs')
      .select('*, users(name)')
      .order('created_at', { ascending: false })
      .limit(100);

    setActivities(
      (activityData ?? []).map((a: any) => ({
        id: a.id,
        userId: a.user_id,
        userName: a.users?.name ?? 'Unknown',
        type: a.activity_type,
        message: a.message,
        time: new Date(a.created_at).toLocaleString(),
      }))
    );
  }, []);

  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [theme]);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  // ── Admin action handlers ─────────────────────────────────────────────────

  const handleApproveAccess = async (requestId: string) => {
    await supabase.from('access_requests').update({ status: 'approved' }).eq('id', requestId);
    setAccessRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'approved' } : r));
    toast.success('Access request approved');
  };

  const handleRejectAccess = async (requestId: string) => {
    await supabase.from('access_requests').update({ status: 'rejected' }).eq('id', requestId);
    setAccessRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'rejected' } : r));
    toast.info('Access request rejected');
  };

  const handleApproveUpload = async (uploadId: string) => {
    await supabase.from('resources').update({ status: 'approved' }).eq('id', uploadId);
    setUploadApprovals(prev => prev.map(u => u.id === uploadId ? { ...u, status: 'approved' } : u));
    toast.success('Upload approved');
  };

  const handleRejectUpload = async (uploadId: string) => {
    await supabase.from('resources').update({ status: 'rejected' }).eq('id', uploadId);
    setUploadApprovals(prev => prev.map(u => u.id === uploadId ? { ...u, status: 'rejected' } : u));
    toast.info('Upload rejected');
  };

  const handleResolveReport = async (reportId: string) => {
    await supabase.from('reports').update({ status: 'resolved' }).eq('id', reportId);
    setReportedResources(prev => prev.map(r => r.id === reportId ? { ...r, status: 'resolved' } : r));
    toast.success('Report resolved');
  };

  const handleDismissReport = async (reportId: string) => {
    await supabase.from('reports').update({ status: 'dismissed' }).eq('id', reportId);
    setReportedResources(prev => prev.map(r => r.id === reportId ? { ...r, status: 'dismissed' } : r));
    toast.info('Report dismissed');
  };

  const handleEditResource = (resourceId: string) => {
    const resource = resources.find(r => r.id === resourceId);
    if (resource) {
      setSelectedResource(resource);
      if (resource.category.toLowerCase() === 'courses') setIsCourseContentModalOpen(true);
      else setIsEditResourceModalOpen(true);
    }
  };

  const handleDeleteResource = async (resourceId: string) => {
    const { error } = await supabase.from('resources').delete().eq('id', resourceId);
    if (error) { toast.error('Delete failed: ' + error.message); return; }
    onUpdateResources(resources.filter(r => r.id !== resourceId));
    toast.success('Resource deleted permanently');
  };

  const handleApproveResource = async (resourceId: string) => {
    await supabase.from('resources').update({ status: 'approved' }).eq('id', resourceId);
    toast.success(`Resource approved`);
  };

  const handleRejectResource = async (resourceId: string) => {
    await supabase.from('resources').update({ status: 'rejected' }).eq('id', resourceId);
    toast.info(`Resource rejected`);
  };

  const handleRequestChanges = (resourceId: string) => {
    toast.info(`Requested changes for resource ${resourceId}`);
  };

  const handleRequestCourseItemChanges = (_resourceId: string, itemId: string) => {
    toast.warning(`Requested changes for item ${itemId}`);
  };

  const handleRemoveCourseItem = (_resourceId: string, itemId: string) => {
    toast.success(`Removed item ${itemId}`);
  };

  const handleViewResource = (resourceId: string) => {
    const resource = resources.find(r => r.id === resourceId);
    if (resource) { setSelectedResource(resource); setIsResourceModalOpen(true); }
  };

  const handleSaveResource = async (resourceId: string, updatedResource: Partial<Resource>) => {
    const { error } = await supabase.from('resources').update({
      title: updatedResource.title,
      description: updatedResource.description,
      is_public: updatedResource.isPublic,
    }).eq('id', resourceId);
    if (error) { toast.error('Update failed: ' + error.message); return; }
    onUpdateResources(resources.map(r => r.id === resourceId ? { ...r, ...updatedResource } : r));
    toast.success('Resource updated successfully');
  };

  const handleSuspendUser = async (userId: string) => {
    await supabase.from('users').update({ status: 'suspended' }).eq('id', userId);
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: 'suspended' } : u));
    toast.warning('User suspended');
  };

  const handleActivateUser = async (userId: string) => {
    await supabase.from('users').update({ status: 'active' }).eq('id', userId);
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: 'active' } : u));
    toast.success('User activated');
  };

  const handleThemeToggle = () => setTheme(theme === 'light' ? 'dark' : 'light');

  const handleNavigate = (view: string) => {
    setCurrentView(view);
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
  };

  const pendingCount =
    accessRequests.filter(r => r.status === 'pending').length +
    uploadApprovals.filter(u => u.status === 'pending').length +
    reportedResources.filter(r => r.status === 'pending').length;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex flex-col h-screen overflow-hidden">
        <AdminHeader
          adminName={adminName}
          theme={theme}
          onThemeToggle={handleThemeToggle}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onLogout={onLogout}
        />
        <div className="flex flex-1 overflow-hidden">
          <AdminSidebar
            currentView={currentView}
            onNavigate={handleNavigate}
            onClose={() => setIsSidebarOpen(false)}
            isOpen={isSidebarOpen}
            pendingCount={pendingCount}
          />
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
