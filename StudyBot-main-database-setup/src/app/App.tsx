import { useState, useEffect, useMemo, useCallback } from 'react';
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
import {
  auth,
  resources as resourcesApi,
  user as userApi,
  setSession,
  clearSession,
  getStoredUser,
  type AuthResponse,
} from './services/api';
import {
  apiUserToAppUser,
  countUserResources,
  getErrorMessage,
  mapApiResource,
  normalizeCategory,
  type AppUser,
} from './services/mappers';

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

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [currentView, setCurrentView] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const [user, setUser] = useState<AppUser>({
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
  });

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [authLoading, setAuthLoading] = useState(false);

  const [resources, setResources] = useState<Resource[]>([]);
  const [resourcesLoading, setResourcesLoading] = useState(true);
  const [detailResource, setDetailResource] = useState<Resource | null>(null);


  // Modals
  const [accessRequestModal, setAccessRequestModal] = useState<{
    isOpen: boolean;
    resourceId: string | null;
  }>({ isOpen: false, resourceId: null });

  const [ratingModal, setRatingModal] = useState<{
    isOpen: boolean;
    resourceId: string | null;
  }>({ isOpen: false, resourceId: null });

  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const [resourceListModal, setResourceListModal] = useState<{
    isOpen: boolean;
    type: 'uploads' | 'accessed' | null;
  }>({ isOpen: false, type: null });

  const [resourceDetailModal, setResourceDetailModal] = useState<{
    isOpen: boolean;
    resourceId: string | null;
  }>({ isOpen: false, resourceId: null });

  // Apply theme
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const loadResources = useCallback(async () => {
    setResourcesLoading(true);
    try {
      const { data } = await resourcesApi.list({ limit: 100, sort: 'latest' });
      const mapped = (data as Record<string, unknown>[]).map(mapApiResource);
      setResources(mapped);
      return mapped;
    } catch {
      toast.error('Could not load resources. Is the API server running?');
      return [];
    } finally {
      setResourcesLoading(false);
    }
  }, []);

  const loadUserData = useCallback(async () => {
    try {
      const [acts, notifs, events] = await Promise.all([
        userApi.getActivities(),
        userApi.getNotifications(),
        userApi.getCalendar(),
      ]);
      setActivities(
        (acts.data as Array<Record<string, unknown>>).map((a) => ({
          id: String(a.id),
          type: String(a.type),
          message: String(a.message),
          time: String(a.time),
        })),
      );
      setNotifications(
        (notifs.data as Array<Record<string, unknown>>).map((n) => ({
          id: String(n.id),
          message: String(n.message),
          time: String(n.time),
          read: Boolean(n.read),
        })),
      );
      setCalendarEvents(
        (events.data as Array<Record<string, unknown>>).map((e) => ({
          id: String(e.id),
          title: String(e.title),
          date: new Date(String(e.event_date)),
          type: (e.type as CalendarEvent['type']) || 'reminder',
          description: e.description ? String(e.description) : undefined,
        })),
      );
    } catch {
      /* optional when offline */
    }
  }, []);

  const refreshProfile = useCallback(
    async (resourceList?: Resource[]) => {
      try {
        const { data } = await auth.getProfile();
        const list = resourceList ?? resources;
        const counts = user.id ? countUserResources(list, user.id) : { uploadCount: 0, accessCount: 0 };
        setUser(apiUserToAppUser(data, counts));
      } catch {
        /* ignore */
      }
    },
    [resources],
  );

  const applyAuthResponse = useCallback(
    async (data: AuthResponse) => {
      setSession(data);
      const adminUser = data.user.role === 'admin';
      setIsAdmin(adminUser);
      setIsAuthenticated(true);
      setShowAuthModal(false);

      const list = await loadResources();
      const counts = countUserResources(list, data.user.id);
      setUser(apiUserToAppUser(data.user, counts));

      if (!adminUser) {
        await loadUserData();
        setCurrentView('dashboard');
      } else {
        setCurrentView('admin-dashboard');
      }
    },
    [loadResources, loadUserData],
  );

  const refreshResourceInList = useCallback(async (resourceId: string) => {
    try {
      const { data } = await resourcesApi.get(resourceId);
      const mapped = mapApiResource(data as Record<string, unknown>);
      setResources((prev) => {
        const idx = prev.findIndex((r) => r.id === resourceId);
        if (idx === -1) return [mapped, ...prev];
        const next = [...prev];
        next[idx] = mapped;
        return next;
      });
      setDetailResource(mapped);
      return mapped;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    loadResources();
  }, [loadResources]);

  useEffect(() => {
    const stored = getStoredUser();
    const token = localStorage.getItem('access_token');
    if (!stored || !token) return;

    (async () => {
      try {
        const { data } = await auth.getProfile();
        const adminUser = data.role === 'admin';
        setIsAdmin(adminUser);
        setIsAuthenticated(true);
        const list = await loadResources();
        setUser(apiUserToAppUser(data, countUserResources(list, data.id)));
        if (!adminUser) await loadUserData();
      } catch {
        clearSession();
      }
    })();
  }, [loadResources, loadUserData]);

  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return calendarEvents
      .filter((e) => e.date >= now)
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, 3)
      .map((e) => ({
        id: e.id,
        title: e.title,
        date: e.date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        type: e.type,
      }));
  }, [calendarEvents]);

  const handleLogin = async (email: string, password: string) => {
    setAuthLoading(true);
    try {
      const { data } = await auth.login(email, password);
      await applyAuthResponse(data);
      toast.success(
        data.user.role === 'admin'
          ? 'Welcome back, Administrator'
          : 'Welcome back to StudyBot!',
      );
    } catch (error) {
      toast.error(getErrorMessage(error, 'Login failed'));
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignup = async (data: {
    name: string;
    email: string;
    password: string;
    role: 'student' | 'faculty' | 'researcher' | 'visitor' | 'admin';
    institution?: string;
    major?: string;
    year?: string;
  }) => {
    setAuthLoading(true);
    try {
      const { data: res } = await auth.register(data);
      await applyAuthResponse(res);
      const bonus = res.user.points > 0 ? ` You received ${res.user.points} bonus points!` : '';
      toast.success(`Account created as ${data.role}!${bonus}`, { icon: '🎉' });
    } catch (error) {
      toast.error(getErrorMessage(error, 'Signup failed'));
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    clearSession();
    setIsAuthenticated(false);
    setIsAdmin(false);
    setCurrentView('courses');
    setIsSidebarOpen(true);
    setNotifications([]);
    setActivities([]);
    setCalendarEvents([]);
    setDetailResource(null);
    setUser({
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
    });
    loadResources();
    toast.success('Logged out successfully');
  };

  const handleThemeToggle = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleNotificationClick = async (id: string) => {
    try {
      await userApi.markNotificationRead(id);
    } catch {
      /* still update UI */
    }
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
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
    const resourceId = accessRequestModal.resourceId;
    if (!resourceId) return;

    if (user.points < 4) {
      toast.error('You need at least 4 points to request access');
      return;
    }

    try {
      await resourcesApi.requestAccess(resourceId, message);
      await refreshResourceInList(resourceId);
      await refreshProfile();
      await loadUserData();
      setAccessRequestModal({ isOpen: false, resourceId: null });
      toast.success('Access request sent successfully!');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not submit access request'));
    }
  };

  const handleViewResource = async (resourceId: string) => {
    if (!isAuthenticated) {
      toast.error('Please login to view resources');
      setShowAuthModal(true);
      return;
    }
    setResourceDetailModal({ isOpen: true, resourceId });
    await refreshResourceInList(resourceId);
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
    const resourceId = ratingModal.resourceId;
    if (!resourceId) return;

    try {
      await resourcesApi.addReview(resourceId, rating, comment);
      await refreshResourceInList(resourceId);
      await loadUserData();
      setRatingModal({ isOpen: false, resourceId: null });
      toast.success('Review submitted successfully!');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not submit review'));
    }
  };

  const handleUpdateProfile = async (updates: Partial<AppUser>) => {
    try {
      const { data } = await auth.updateProfile({
        name: updates.name,
        institution: updates.institution,
        major: updates.major,
        year: updates.year,
      });
      const counts = countUserResources(resources, data.id);
      setUser(apiUserToAppUser(data, counts));
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not update profile'));
    }
  };

  const handleUploadResource = async (resource: {
    title: string;
    category: string;
    description: string;
    isPublic: boolean;
  }) => {
    try {
      await resourcesApi.create({
        title: resource.title,
        description: resource.description,
        category: normalizeCategory(resource.category),
        is_public: resource.isPublic,
      });
      const list = await loadResources();
      await refreshProfile(list);
      await loadUserData();
      toast.success('Resource submitted! +2 points when approved.', { icon: '🎉' });
    } catch (error) {
      toast.error(getErrorMessage(error, 'Upload failed'));
    }
  };

  const handleAddCalendarEvent = async (event: Omit<CalendarEvent, 'id'>) => {
    try {
      const { data } = await userApi.addCalendarEvent({
        title: event.title,
        description: event.description,
        event_date: event.date.toISOString(),
        type: event.type,
      });
      setCalendarEvents((prev) => [
        ...prev,
        {
          id: String(data.id),
          title: String(data.title),
          date: new Date(String(data.event_date)),
          type: (data.type as CalendarEvent['type']) || 'reminder',
          description: data.description ? String(data.description) : undefined,
        },
      ]);
      toast.success('Event added to calendar!');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not add event'));
    }
  };

  const handleSaveSettings = () => {
    toast.success('Settings saved successfully!');
  };

  const handleViewUploads = () => {
    setResourceListModal({ isOpen: true, type: 'uploads' });
  };

  const handleViewAccessed = () => {
    setResourceListModal({ isOpen: true, type: 'accessed' });
  };

  const handleDownloadFile = (fileId: string) => {
    toast.success('File download started!', {
      description: 'Your download will begin shortly.',
    });
  };

  const handleMarkAllRead = async () => {
    try {
      await userApi.markAllNotificationsRead();
    } catch {
      /* still update UI */
    }
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
    toast.success('All notifications marked as read');
  };

  const handleNavigate = (view: string) => {
    // Check if view requires authentication
    const requiresAuth = ['profile', 'uploads', 'activity', 'settings'].includes(view);
    
    if (requiresAuth && !isAuthenticated) {
      toast.error('Please login to access this page');
      setShowAuthModal(true);
      return;
    }

    setCurrentView(view);
    // Close sidebar on mobile when navigating
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  // Filter resources by search
  const filteredResources = resources.filter((r) =>
    searchQuery
      ? r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.description ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.category.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  const selectedAccessResource = accessRequestModal.resourceId
    ? resources.find((r) => r.id === accessRequestModal.resourceId)
    : null;

  const selectedRatingResource = ratingModal.resourceId
    ? resources.find((r) => r.id === ratingModal.resourceId)
    : null;

  const selectedDetailResource =
    detailResource ??
    (resourceDetailModal.resourceId
      ? resources.find((r) => r.id === resourceDetailModal.resourceId) ?? null
      : null);

  return (
    <>
      {/* Render AdminApp if user is admin, otherwise render regular StudyBot */}
      {isAdmin ? (
        <AdminApp
          adminName={user.name}
          adminEmail={user.email}
          resources={resources}
          onLogout={handleLogout}
          onUpdateResources={setResources}
        />
      ) : (
        <div className={`min-h-screen ${theme}`}>
          <div className="flex flex-col h-screen bg-background text-foreground">
            {/* Only show Header and Sidebar if not on landing page */}
            {currentView !== 'landing' && (
              <Header
                theme={theme}
                onThemeToggle={handleThemeToggle}
                points={isAuthenticated ? user.points : undefined}
                onSearch={setSearchQuery}
                onNotificationClick={isAuthenticated ? () => setIsNotificationPanelOpen(true) : undefined}
                unreadCount={isAuthenticated ? notifications.filter((n) => !n.read).length : 0}
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
                    onGetStarted={() => {
                      setShowAuthModal(true);
                    }}
                    onBrowseResources={() => {
                      setCurrentView('courses');
                    }}
                    theme={theme}
                  />
                )}

                {currentView === 'dashboard' && (
                  <>
                    {!isAuthenticated ? (
                      <LandingPage
                        onGetStarted={() => {
                          setShowAuthModal(true);
                        }}
                        onBrowseResources={() => {
                          setCurrentView('courses');
                        }}
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
                    )}
                  </>
                )}

                {(currentView === 'courses' ||
                  currentView === 'documents' ||
                  currentView === 'projects' ||
                  currentView === 'research') && (
                  <ResourcesView
                    loading={resourcesLoading}
                    resources={filteredResources.filter((r) => {
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
                    <AuthScreen
                      onLogin={handleLogin}
                      onSignup={handleSignup}
                      loading={authLoading}
                    />
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
                    ? resources.filter((r) => r.uploaderId === user.id)
                    : resources.filter((r) => r.hasAccess && r.uploaderId !== user.id)
                }
                emptyMessage={
                  resourceListModal.type === 'uploads'
                    ? 'You haven\'t uploaded any resources yet'
                    : 'You haven\'t accessed any resources yet'
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