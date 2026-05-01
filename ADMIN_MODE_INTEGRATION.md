# Admin Mode Integration Guide

## Overview
Admin Mode has been implemented with all necessary components. This guide explains how to integrate it into App.tsx.

## Components Created
- ✅ `admin-dashboard.tsx` - Request Approval page
- ✅ `admin-sidebar.tsx` - Admin-specific sidebar  
- ✅ `admin-users.tsx` - User Management
- ✅ `admin-activity.tsx` - Platform Activity monitoring
- ✅ Updated `auth-screen.tsx` - Added Admin role

## Integration Steps for App.tsx

### 1. Add Admin State
```typescript
const [isAdmin, setIsAdmin] = useState(false);
const [userRole, setUserRole] = useState<'student' | 'faculty' | 'researcher' | 'visitor' | 'admin' | null>(null);
```

### 2. Add Admin Data States
```typescript
// Admin-specific data
const [accessRequests, setAccessRequests] = useState([]);
const [uploadApprovals, setUploadApprovals] = useState([]);
const [reportedResources, setReportedResources] = useState([]);
const [allUsers, setAllUsers] = useState([]);
```

### 3. Update handleSignup
```typescript
const handleSignup = (data) => {
  setUserRole(data.role);
  
  if (data.role === 'admin') {
    setIsAdmin(true);
    setCurrentView('admin-dashboard');
    toast.success('Logged in as Administrator', { icon: '🛡️' });
  } else {
    setCurrentView('dashboard');
    toast.success(`Account created as ${data.role}!`);
  }
  
  setIsAuthenticated(true);
  setShowAuthModal(false);
};
```

### 4. Conditional Sidebar Rendering
```typescript
{currentView !== 'landing' && (
  <>
    {isAdmin ? (
      <AdminSidebar 
        currentView={currentView} 
        onNavigate={handleNavigate}
        isOpen={isSidebarOpen}
        pendingCount={
          accessRequests.filter(r => r.status === 'pending').length +
          uploadApprovals.filter(u => u.status === 'pending').length +
          reportedResources.filter(r => r.status === 'pending').length
        }
      />
    ) : (
      <Sidebar 
        currentView={currentView} 
        onNavigate={handleNavigate}
        isOpen={isSidebarOpen}
        isAuthenticated={isAuthenticated}
      />
    )}
  </>
)}
```

### 5. Add Admin Route Handlers
```typescript
const handleApproveAccess = (requestId: string) => {
  setAccessRequests(prev => 
    prev.map(r => r.id === requestId ? { ...r, status: 'approved' } : r)
  );
  toast.success('Access request approved');
};

const handleRejectAccess = (requestId: string) => {
  setAccessRequests(prev => 
    prev.map(r => r.id === requestId ? { ...r, status: 'rejected' } : r)
  );
  toast.info('Access request rejected');
};

const handleApproveUpload = (uploadId: string) => {
  setUploadApprovals(prev => 
    prev.map(u => u.id === uploadId ? { ...u, status: 'approved' } : u)
  );
  toast.success('Upload approved');
};

const handleRejectUpload = (uploadId: string) => {
  setUploadApprovals(prev => 
    prev.map(u => u.id === uploadId ? { ...u, status: 'rejected' } : u)
  );
  toast.info('Upload rejected');
};

const handleResolveReport = (reportId: string) => {
  setReportedResources(prev => 
    prev.map(r => r.id === reportId ? { ...r, status: 'resolved' } : r)
  );
  toast.success('Report resolved');
};

const handleDismissReport = (reportId: string) => {
  setReportedResources(prev => 
    prev.map(r => r.id === reportId ? { ...r, status: 'dismissed' } : r)
  );
  toast.info('Report dismissed');
};

const handleSuspendUser = (userId: string) => {
  setAllUsers(prev => 
    prev.map(u => u.id === userId ? { ...u, status: 'suspended' } : u)
  );
  toast.warning('User suspended');
};

const handleActivateUser = (userId: string) => {
  setAllUsers(prev => 
    prev.map(u => u.id === userId ? { ...u, status: 'active' } : u)
  );
  toast.success('User activated');
};
```

### 6. Add Admin Views in Main
```typescript
{currentView === 'admin-dashboard' && isAdmin && (
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

{currentView === 'admin-users' && isAdmin && (
  <AdminUsers
    users={allUsers}
    onSuspendUser={handleSuspendUser}
    onActivateUser={handleActivateUser}
  />
)}

{currentView === 'admin-activity' && isAdmin && (
  <AdminActivity activities={activities} />
)}
```

### 7. Update Header for Admin Mode
```typescript
<Header
  theme={theme}
  onThemeToggle={handleThemeToggle}
  points={isAuthenticated && !isAdmin ? user.points : undefined}
  onSearch={setSearchQuery}
  onNotificationClick={isAuthenticated ? () => setIsNotificationPanelOpen(true) : undefined}
  unreadCount={isAuthenticated ? notifications.filter((n) => !n.read).length : 0}
  onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
  isAuthenticated={isAuthenticated}
  onLoginClick={() => setShowAuthModal(true)}
  onLogout={handleLogout}
  userName={isAuthenticated ? user.name : undefined}
  isAdmin={isAdmin} // Add this prop to Header
/>
```

### 8. Update handleLogout
```typescript
const handleLogout = () => {
  setIsAuthenticated(false);
  setIsAdmin(false);
  setUserRole(null);
  setCurrentView('courses');
  setIsSidebarOpen(true);
  toast.success('Logged out successfully');
};
```

### 9. Initialize Mock Admin Data
```typescript
// Add to initial state or useEffect
const [allUsers] = useState([
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
  // Add more mock users
]);

const [accessRequests] = useState([
  {
    id: 'req-1',
    userId: 'user-1',
    userName: 'Alex Johnson',
    resourceId: 'res-3',
    resourceTitle: 'Web Development Bootcamp',
    message: 'Need this for my final year project',
    timestamp: '2 hours ago',
    status: 'pending',
  },
]);

const [uploadApprovals] = useState([
  {
    id: 'upload-1',
    userId: 'user-5',
    userName: 'James Wilson',
    resourceTitle: 'Advanced React Patterns',
    category: 'Documents',
    timestamp: '1 hour ago',
    status: 'pending',
  },
]);

const [reportedResources] = useState([
  {
    id: 'report-1',
    resourceId: 'res-8',
    resourceTitle: 'Task Management System',
    reportedBy: 'User456',
    reason: 'Contains outdated or incorrect information',
    timestamp: '30 minutes ago',
    status: 'pending',
  },
]);
```

## Visual Distinctions

### Admin Mode
- **Color Theme:** Amber/Orange (#f59e0b)
- **Icon:** Shield
- **Sidebar Header:** "Admin Mode" with "Full Access" subtitle
- **Badge Background:** bg-amber-500

### User Mode  
- **Color Theme:** Indigo/Purple (#6366f1)
- **Icon:** GraduationCap
- **Sidebar Header:** Navigation items
- **Badge Background:** bg-primary

## Admin Features

1. **Request Approval Dashboard**
   - Pending access requests with approve/reject
   - Upload approvals
   - Reported resources management

2. **User Management**
   - View all users
   - Suspend/activate accounts
   - View user statistics

3. **Platform Activity**
   - Monitor all activities
   - Filter by type (uploads, access, reviews)
   - View trends and statistics

4. **Full Resource Control** (to be implemented)
   - Edit any resource
   - Request changes from uploaders
   - Approve/reject resources
   - Permanently remove resources

## Testing Admin Mode

1. Sign up/Login with role "Admin"
2. View changes to:
   - Sidebar (amber theme with Shield icon)
   - Dashboard replaced with Request Approval
   - New admin-specific navigation items
3. Test approval workflows
4. Check user management features

## Notes

- Admin users don't see points in header
- Admin can still view all resource pages (Courses, Documents, etc.)
- Admin sidebar includes both admin pages and resource pages
- All other pages work the same for admin (Settings, Calendar, etc.)
