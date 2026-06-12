import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';
import { Header } from './components/header';
import { Sidebar } from './components/sidebar';
import { Dashboard } from './components/dashboard';
import { ResourcesView } from './components/resources-view';
import { UserProfile } from './components/user-profile';
import { AuthScreen } from './components/auth-screen';
import { AccessRequestModal } from './components/access-request-modal';
import { RatingModal } from './components/rating-modal';
import { UploadView } from './components/upload-view';
import { ActivityLog } from './components/activity-log';
import { FullCalendar } from './components/full-calendar';
import { SettingsView } from './components/settings-view';
import { NotificationPanel } from './components/notification-panel';
import { ResourceListModal } from './components/resource-list-modal';
import { ResourceDetailModal } from './components/resource-detail-modal';
import { LandingPage } from './components/landing-page';
import { Resource } from './components/resource-card';
import { AdminApp } from './components/admin-app';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';
import { AnimatePresence, motion } from 'motion/react';
import { Button } from './components/ui/button';
import { X } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  institution: string;
  major: string;
  year: string;
  points: number;
  uploadCount: number;
  accessCount: number;
  monthlyAccess: number;
}

interface Notification {
  id: string;
  message: string;
  time: string;
  read: boolean;
}

interface Activity {
  id: string;
  type: string;
  message: string;
  time: string;
}

interface UpcomingEvent {
  id: string;
  title: string;
  date: string;
  type: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: 'exam' | 'deadline' | 'reminder' | 'class';
  description?: string;
}

const EMPTY_USER: User = {
  id: '',
  name: '',
  email: '',
  institution: '',
  major: '',
  year: '',
  points: 0,
  uploadCount: 0,
  accessCount: 0,
  monthlyAccess: 0,
};

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [currentView, setCurrentView] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);

  const [user, setUser] = useState<User>(EMPTY_USER);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);

  const [upcomingEvents] = useState<UpcomingEvent[]>([
    { id: 'event-1', title: 'Computer Networks Midterm', date: 'Jan 5, 2026', type: 'exam' },
    { id: 'event-2', title: 'Project Submission Deadline', date: 'Jan 10, 2026', type: 'deadline' },
    { id: 'event-3', title: 'Research Paper Upload', date: 'Jan 15, 2026', type: 'reminder' },
  ]);

  const [accessRequestModal, setAccessRequestModal] = useState<{ isOpen: boolean; resourceId: string | null }>({ isOpen: false, resourceId: null });
  const [ratingModal, setRatingModal] = useState<{ isOpen: boolean; resourceId: string | null }>({ isOpen: false, resourceId: null });
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const [resourceListModal, setResourceListModal] = useState<{ isOpen: boolean; type: 'uploads' | 'accessed' | null }>({ isOpen: false, type: null });
  const [resourceDetailModal, setResourceDetailModal] = useState<{ isOpen: boolean; resourceId: string | null }>({ isOpen: false, resourceId: null });

  // ── Apply theme ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [theme]);

  // ── Load user profile from DB ────────────────────────────────────────────
  const loadUserProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    if (error || !data) return;

    setUser({
      id: data.id,
      name: data.name,
      email: data.email,
      institution: data.institution ?? '',
      major: data.major ?? '',
      year: data.study_year ?? '',
      points: data.points ?? 0,
      uploadCount: data.upload_count ?? 0,
      accessCount: data.access_count ?? 0,
      monthlyAccess: data.monthly_access ?? 0,
    });

    setIsAdmin(data.role === 'admin');
    if (data.role === 'admin') setCurrentView('admin-dashboard');
    else setCurrentView('dashboard');
  }, []);

  // ── Load resources ───────────────────────────────────────────────────────
  const loadResources = useCallback(async () => {
    const { data, error } = await supabase
      .from('resources')
      .select(`
        *,
        users ( name ),
        resource_topics ( topic_name ),
        resource_files ( id, file_name, file_size, file_type, file_url )
      `)
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (error) { console.error('Resources load error:', error); return; }

    const mapped: Resource[] = (data ?? []).map((r: any) => ({
      id: r.id,
      title: r.title,
      category: r.category,
      uploader: r.users?.name ?? 'Unknown',
      uploaderId: r.uploader_id,
      uploadDate: new Date(r.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      isPublic: r.is_public,
      rating: parseFloat(r.rating) || 0,
      reviewCount: r.review_count ?? 0,
      description: r.description ?? '',
      fullDetails: r.full_details ?? '',
      topics: (r.resource_topics ?? []).map((t: any) => t.topic_name),
      files: (r.resource_files ?? []).map((f: any) => ({
        id: f.id, name: f.file_name, size: f.file_size, type: f.file_type,
      })),
      externalLink: r.external_link ?? undefined,
      hasAccess: false,
    }));
    setResources(mapped);
  }, []);

  // ── Load user access (which resources they've unlocked) ─────────────────
  const loadUserAccess = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('user_resource_access')
      .select('resource_id')
      .eq('user_id', userId);

    if (!data) return;
    const accessedIds = new Set(data.map((a: any) => a.resource_id));
    setResources(prev =>
      prev.map(r => ({ ...r, hasAccess: accessedIds.has(r.id) }))
    );
  }, []);

  // ── Load notifications ───────────────────────────────────────────────────
  const loadNotifications = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    setNotifications(
      (data ?? []).map((n: any) => ({
        id: n.id,
        message: n.message,
        time: new Date(n.created_at).toLocaleTimeString(),
        read: n.is_read,
      }))
    );
  }, []);

  // ── Load activities ──────────────────────────────────────────────────────
  const loadActivities = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    setActivities(
      (data ?? []).map((a: any) => ({
        id: a.id,
        type: a.activity_type,
        message: a.message,
        time: new Date(a.created_at).toLocaleTimeString(),
      }))
    );
  }, []);

  // ── Load calendar events ─────────────────────────────────────────────────
  const loadCalendarEvents = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('user_id', userId)
      .order('event_date', { ascending: true });

    setCalendarEvents(
      (data ?? []).map((e: any) => ({
        id: e.id,
        title: e.title,
        date: new Date(e.event_date),
        type: e.event_type,
        description: e.description ?? undefined,
      }))
    );
  }, []);

  // ── Auth state listener ──────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        setIsAuthenticated(true);
        loadUserProfile(session.user.id);
        loadResources().then(() => loadUserAccess(session.user.id));
        loadNotifications(session.user.id);
        loadActivities(session.user.id);
        loadCalendarEvents(session.user.id);
      } else {
        loadResources();
      }
      setLoadingAuth(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        setIsAuthenticated(true);
        loadUserProfile(session.user.id);
        loadResources().then(() => loadUserAccess(session.user.id));
        loadNotifications(session.user.id);
        loadActivities(session.user.id);
        loadCalendarEvents(session.user.id);
      } else {
        setIsAuthenticated(false);
        setIsAdmin(false);
        setUser(EMPTY_USER);
        setNotifications([]);
        setActivities([]);
        setCalendarEvents([]);
      }
    });

    return () => subscription.unsubscribe();
  }, [loadUserProfile, loadResources, loadUserAccess, loadNotifications, loadActivities, loadCalendarEvents]);

  // ── Realtime notifications ───────────────────────────────────────────────
  useEffect(() => {
    if (!session?.user) return;
    const userId = session.user.id;

    const channel = supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      }, payload => {
        const n = payload.new as any;
        setNotifications(prev => [{
          id: n.id,
          message: n.message,
          time: 'Just now',
          read: false,
        }, ...prev]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [session?.user]);

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleLogin = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error(error.message);
      return;
    }
    setShowAuthModal(false);
    toast.success('Welcome back to StudyBot!');
  };

  const handleSignup = async (data: {
    name: string; email: string; password: string;
    role: 'student' | 'faculty' | 'researcher' | 'visitor' | 'admin';
    institution?: string; major?: string; year?: string;
  }) => {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });

    if (authError) { toast.error(authError.message); return; }
    if (!authData.user) { toast.error('Signup failed, please try again.'); return; }

    // Insert user profile row
    const { error: profileError } = await supabase.from('users').insert({
      id: authData.user.id,
      name: data.name,
      email: data.email,
      role: data.role,
      institution: data.institution ?? null,
      major: data.major ?? null,
      study_year: data.year ?? null,
      points: 20,
    });

    if (profileError) { toast.error('Profile creation failed: ' + profileError.message); return; }

    setShowAuthModal(false);
    toast.success(`Welcome ${data.name}! You received 20 bonus points 🎉`);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentView('dashboard');
    setIsSidebarOpen(true);
    toast.success('Logged out successfully');
  };

  const handleThemeToggle = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleNotificationClick = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
  };

  const handleMarkAllRead = async () => {
    if (!session?.user) return;
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    await supabase.from('notifications')
      .update({ is_read: true })
      .eq('user_id', session.user.id);
    toast.success('All notifications marked as read');
  };

  const handleRequestAccess = (resourceId: string) => {
    if (!isAuthenticated) {
      toast.error('Please login to request access to resources');
      setShowAuthModal(true);
      return;
    }
    setAccessRequestModal({ isOpen: true, resourceId });
  };

  const handleSubmitAccessRequest = async (message: string) => {
    if (!accessRequestModal.resourceId || !session?.user) return;
    const resource = resources.find(r => r.id === accessRequestModal.resourceId);

    if (user.points < 4) {
      toast.error('You need at least 4 points to request access');
      return;
    }

    // Insert access request
    const { error: reqError } = await supabase.from('access_requests').insert({
      user_id: session.user.id,
      resource_id: accessRequestModal.resourceId,
      message,
    });
    if (reqError) { toast.error('Failed to send request: ' + reqError.message); return; }

    // Deduct 4 points
    const newPoints = user.points - 4;
    await supabase.from('users').update({ points: newPoints }).eq('id', session.user.id);
    setUser(prev => ({ ...prev, points: newPoints }));

    // Mark resource as requested locally
    setResources(prev =>
      prev.map(r => r.id === accessRequestModal.resourceId ? { ...r, accessRequested: true } : r)
    );

    // Insert notification
    await supabase.from('notifications').insert({
      user_id: session.user.id,
      message: `Access request sent for "${resource?.title}"`,
    });

    // Log activity
    await supabase.from('activity_logs').insert({
      user_id: session.user.id,
      activity_type: 'request',
      message: `Requested access to "${resource?.title}"`,
    });

    await loadNotifications(session.user.id);
    await loadActivities(session.user.id);

    toast.success('Access request sent successfully!');
  };

  const handleViewResource = (resourceId: string) => {
    if (!isAuthenticated) {
      toast.error('Please login to view resources');
      setShowAuthModal(true);
      return;
    }
    setResourceDetailModal({ isOpen: true, resourceId });
  };

  const handleRateResource = (resourceId: string) => {
    if (!isAuthenticated) {
      toast.error('Please login to rate resources');
      setShowAuthModal(true);
      return;
    }
    setRatingModal({ isOpen: true, resourceId });
  };

  const handleSubmitRating = async (rating: number, comment: string) => {
    if (!ratingModal.resourceId || !session?.user) return;
    const resource = resources.find(r => r.id === ratingModal.resourceId);

    const { error } = await supabase.from('reviews').upsert({
      resource_id: ratingModal.resourceId,
      user_id: session.user.id,
      rating,
      comment,
    });
    if (error) { toast.error('Failed to submit review: ' + error.message); return; }

    // Recalculate rating locally
    setResources(prev =>
      prev.map(r =>
        r.id === ratingModal.resourceId
          ? {
              ...r,
              rating: (r.rating * r.reviewCount + rating) / (r.reviewCount + 1),
              reviewCount: r.reviewCount + 1,
            }
          : r
      )
    );

    // Log activity
    await supabase.from('activity_logs').insert({
      user_id: session.user.id,
      activity_type: 'review',
      message: `Reviewed "${resource?.title}" with ${rating} stars`,
    });
    await loadActivities(session.user.id);

    toast.success('Review submitted successfully!');
  };

  const handleUpdateProfile = async (updates: Partial<User>) => {
    if (!session?.user) return;
    const dbUpdates: Record<string, any> = {};
    if (updates.name) dbUpdates.name = updates.name;
    if (updates.institution !== undefined) dbUpdates.institution = updates.institution;
    if (updates.major !== undefined) dbUpdates.major = updates.major;
    if (updates.year !== undefined) dbUpdates.study_year = updates.year;

    await supabase.from('users').update(dbUpdates).eq('id', session.user.id);
    setUser(prev => ({ ...prev, ...updates }));
    toast.success('Profile updated successfully!');
  };

  const handleUploadResource = async (resource: {
    title: string; category: string; description: string; isPublic: boolean;
  }) => {
    if (!session?.user) return;

    const { data, error } = await supabase.from('resources').insert({
      title: resource.title,
      category: resource.category,
      uploader_id: session.user.id,
      description: resource.description,
      is_public: resource.isPublic,
      status: 'approved',
    }).select().single();

    if (error) { toast.error('Upload failed: ' + error.message); return; }

    // Award +2 points
    const newPoints = user.points + 2;
    const newUploadCount = user.uploadCount + 1;
    await supabase.from('users').update({ points: newPoints, upload_count: newUploadCount }).eq('id', session.user.id);
    setUser(prev => ({ ...prev, points: newPoints, uploadCount: newUploadCount }));

    // Log activity
    await supabase.from('activity_logs').insert({
      user_id: session.user.id,
      activity_type: 'upload',
      message: `Uploaded "${resource.title}"`,
    });
    await loadActivities(session.user.id);
    await loadResources();

    toast.success('Resource uploaded successfully! +2 points earned 🎉');
  };

  const handleAddCalendarEvent = async (event: Omit<CalendarEvent, 'id'>) => {
    if (!session?.user) return;

    const { data, error } = await supabase.from('calendar_events').insert({
      user_id: session.user.id,
      title: event.title,
      description: event.description ?? null,
      event_type: event.type,
      event_date: event.date.toISOString(),
    }).select().single();

    if (error) { toast.error('Failed to add event: ' + error.message); return; }

    setCalendarEvents(prev => [...prev, { id: data.id, title: event.title, date: event.date, type: event.type, description: event.description }]);
    toast.success('Event added to calendar!');
  };

  const handleSaveSettings = (_settings: any) => {
    toast.success('Settings saved successfully!');
  };

  const handleNavigate = (view: string) => {
    const requiresAuth = ['profile', 'uploads', 'activity', 'settings'].includes(view);
    if (requiresAuth && !isAuthenticated) {
      toast.error('Please login to access this page');
      setShowAuthModal(true);
      return;
    }
    setCurrentView(view);
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
  };

  const handleViewUploads = () => setResourceListModal({ isOpen: true, type: 'uploads' });
  const handleViewAccessed = () => setResourceListModal({ isOpen: true, type: 'accessed' });

  const handleDownloadFile = (_fileId: string) => {
    toast.success('File download started!', { description: 'Your download will begin shortly.' });
  };

  const handleUpdateResources = async (updated: Resource[]) => {
    setResources(updated);
  };

  // ── Derived values ────────────────────────────────────────────────────────
  const filteredResources = resources.filter(r =>
    searchQuery
      ? r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.category.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  const selectedAccessResource = accessRequestModal.resourceId
    ? resources.find(r => r.id === accessRequestModal.resourceId)
    : null;
  const selectedRatingResource = ratingModal.resourceId
    ? resources.find(r => r.id === ratingModal.resourceId)
    : null;
  const selectedDetailResource = resourceDetailModal.resourceId
    ? resources.find(r => r.id === resourceDetailModal.resourceId)
    : null;

  if (loadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500" />
      </div>
    );
  }

  return (
    <>
      {isAdmin ? (
        <AdminApp
          adminName={user.name}
          adminEmail={user.email}
          resources={resources}
          onLogout={handleLogout}
          onUpdateResources={handleUpdateResources}
        />
      ) : (
        <div className={`min-h-screen ${theme}`}>
          <div className="flex flex-col h-screen bg-background text-foreground">
            {currentView !== 'landing' && (
              <Header
                theme={theme}
                onThemeToggle={handleThemeToggle}
                points={isAuthenticated ? user.points : undefined}
                onSearch={setSearchQuery}
                onNotificationClick={isAuthenticated ? () => setIsNotificationPanelOpen(true) : undefined}
                unreadCount={isAuthenticated ? notifications.filter(n => !n.read).length : 0}
                onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                isAuthenticated={isAuthenticated}
                onLoginClick={() => setShowAuthModal(true)}
                onLogout={handleLogout}
                userName={isAuthenticated ? user.name : undefined}
              />
            )}

            <div className="flex flex-1 overflow-hidden relative">
              {currentView !== 'landing' && (
                <Sidebar
                  currentView={currentView}
                  onNavigate={handleNavigate}
                  onClose={() => setIsSidebarOpen(false)}
                  isOpen={isSidebarOpen}
                  isAuthenticated={isAuthenticated}
                />
              )}

              <main className="flex-1 overflow-y-auto">
                {currentView === 'landing' && (
                  <LandingPage
                    onGetStarted={() => setShowAuthModal(true)}
                    onBrowseResources={() => setCurrentView('courses')}
                    theme={theme}
                  />
                )}

                {currentView === 'dashboard' && (
                  !isAuthenticated ? (
                    <LandingPage
                      onGetStarted={() => setShowAuthModal(true)}
                      onBrowseResources={() => setCurrentView('courses')}
                      theme={theme}
                    />
                  ) : (
                    <Dashboard
                      points={user.points}
                      monthlyAccess={user.monthlyAccess}
                      uploadCount={user.uploadCount}
                      activities={activities}
                      upcomingEvents={upcomingEvents}
                    />
                  )
                )}

                {(['courses', 'documents', 'projects', 'research'] as const).includes(currentView as any) && (
                  <ResourcesView
                    resources={filteredResources.filter(r => {
                      if (currentView === 'courses') return r.category.toLowerCase() === 'courses';
                      if (currentView === 'documents') return r.category.toLowerCase() === 'documents';
                      if (currentView === 'projects') return r.category.toLowerCase() === 'projects';
                      if (currentView === 'research') return r.category.toLowerCase() === 'research';
                      return true;
                    })}
                    onRequestAccess={handleRequestAccess}
                    onView={handleViewResource}
                    onRate={handleRateResource}
                    viewType={currentView as 'courses' | 'documents' | 'projects' | 'research'}
                  />
                )}

                {currentView === 'profile' && isAuthenticated && (
                  <UserProfile
                    user={user}
                    points={user.points}
                    uploadCount={user.uploadCount}
                    accessCount={user.accessCount}
                    activities={activities}
                    onUpdateProfile={handleUpdateProfile}
                    onViewUploads={handleViewUploads}
                    onViewAccessed={handleViewAccessed}
                  />
                )}

                {currentView === 'uploads' && isAuthenticated && (
                  <UploadView onUpload={handleUploadResource} />
                )}

                {currentView === 'activity' && isAuthenticated && (
                  <ActivityLog activities={activities} />
                )}

                {currentView === 'calendar' && (
                  <FullCalendar
                    events={calendarEvents}
                    onAddEvent={handleAddCalendarEvent}
                    isAuthenticated={isAuthenticated}
                  />
                )}

                {currentView === 'settings' && isAuthenticated && (
                  <SettingsView
                    theme={theme}
                    onThemeChange={setTheme}
                    onSaveSettings={handleSaveSettings}
                    onLogout={handleLogout}
                  />
                )}
              </main>
            </div>
          </div>

          {/* Auth Modal */}
          <AnimatePresence>
            {showAuthModal && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                  onClick={() => setShowAuthModal(false)}
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50"
                >
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute -top-2 -right-2 z-10"
                      onClick={() => setShowAuthModal(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <AuthScreen onLogin={handleLogin} onSignup={handleSignup} />
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Modals */}
          <AccessRequestModal
            isOpen={accessRequestModal.isOpen}
            onClose={() => setAccessRequestModal({ isOpen: false, resourceId: null })}
            resourceTitle={selectedAccessResource?.title || ''}
            onSubmit={handleSubmitAccessRequest}
            currentPoints={user.points}
          />
          <RatingModal
            isOpen={ratingModal.isOpen}
            onClose={() => setRatingModal({ isOpen: false, resourceId: null })}
            resourceTitle={selectedRatingResource?.title || ''}
            onSubmit={handleSubmitRating}
          />
          <ResourceDetailModal
            isOpen={resourceDetailModal.isOpen}
            onClose={() => setResourceDetailModal({ isOpen: false, resourceId: null })}
            resource={selectedDetailResource}
            onDownload={handleDownloadFile}
          />

          {isAuthenticated && (
            <>
              <NotificationPanel
                isOpen={isNotificationPanelOpen}
                onClose={() => setIsNotificationPanelOpen(false)}
                notifications={notifications}
                onNotificationClick={handleNotificationClick}
                onMarkAllRead={handleMarkAllRead}
              />
              <ResourceListModal
                isOpen={resourceListModal.isOpen}
                onClose={() => setResourceListModal({ isOpen: false, type: null })}
                title={resourceListModal.type === 'uploads' ? 'My Uploaded Resources' : 'My Accessed Resources'}
                resources={
                  resourceListModal.type === 'uploads'
                    ? resources.filter(r => r.uploaderId === user.id)
                    : resources.filter(r => r.hasAccess && r.uploaderId !== user.id)
                }
                emptyMessage={
                  resourceListModal.type === 'uploads'
                    ? "You haven't uploaded any resources yet"
                    : "You haven't accessed any resources yet"
                }
              />
            </>
          )}

          <Toaster />
        </div>
      )}
    </>
  );
}
