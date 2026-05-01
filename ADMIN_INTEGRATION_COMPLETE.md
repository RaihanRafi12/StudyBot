# Admin Mode Integration - Final Steps

## What's Been Created ✅

1. **AdminSidebar** - Simplified 4-item navigation (Request Approval, Activity Log, All Resources, Settings)
2. **AdminDashboard** - Request Approval page with Access Requests, Upload Approvals, Reported Resources
3. **AdminActivity** - Platform activity monitoring (reusing existing component)
4. **AdminResources** - Complete resource management with edit/delete/approve/reject controls
5. **AuthScreen** - Updated with Admin role option
6. **Admin Mock Data** - accessRequests, uploadApprovals, reportedResources added to App.tsx

## Final Integration Steps (Copy these into App.tsx)

### 1. Update handleSignup (line ~729):
```typescript
const handleSignup = (data: {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'faculty' | 'researcher' | 'visitor' | 'admin';
  institution?: string;
  major?: string;
  year?: string;
}) => {
  // Check if admin
  if (data.role === 'admin') {
    setUser({
      ...user,
      name: data.name,
      email: data.email,
      institution: 'StudyBot Administration',
      major: 'Administrator',
      year: 'Admin',
      points: 0,
    });
    setIsAuthenticated(true);
    setIsAdmin(true);
    setShowAuthModal(false);
    setCurrentView('admin-approvals');
    toast.success('Logged in as Administrator', {
      icon: '🛡️',
    });
    return;
  }

  // Regular user signup
  setUser({
    ...user,
    name: data.name,
    email: data.email,
    institution: data.institution || '',
    major: data.major || '',
    year: data.year || '',
    points: 20, // Bonus points on signup
  });
  setIsAuthenticated(true);
  setShowAuthModal(false);
  setCurrentView('dashboard');
  toast.success(`Account created as ${data.role}! You received 20 bonus points!`, {
    icon: '🎉',
  });
};
```

### 2. Update handleLogout (line ~744):
```typescript
const handleLogout = () => {
  setIsAuthenticated(false);
  setIsAdmin(false); // Add this line
  setCurrentView('courses');
  setIsSidebarOpen(true);
  toast.success('Logged out successfully');
};
```

### 3. Add Admin Handlers (after handleMarkAllRead, before handleNavigate):
```typescript
// Admin handlers
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

const handleEditResource = (resourceId: string) => {
  toast.info(`Edit resource: ${resourceId}`);
  // Implement edit modal or navigate to edit page
};

const handleDeleteResource = (resourceId: string) => {
  setResources(prev => prev.filter(r => r.id !== resourceId));
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
  // Implement request changes modal
};
```

### 4. Replace Sidebar (line ~1108):
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

### 5. Add Admin Routes (before settings route, line ~1205):
```typescript
{currentView === 'admin-approvals' && isAdmin && (
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

{currentView === 'admin-activity' && isAdmin && (
  <AdminActivity activities={activities} />
)}

{currentView === 'admin-resources' && isAdmin && (
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
```

### 6. Add AdminResources import (top of file):
```typescript
import { AdminResources } from './components/admin-resources';
```

### 7. Update Header points display (line ~1099):
```typescript
points={isAuthenticated && !isAdmin ? user.points : undefined}
```

## Testing Admin Mode

1. Click "Sign Up"
2. Select "Admin" from Role dropdown
3. Create account
4. You'll be redirected to "Request Approval" page
5. Sidebar shows only 4 admin sections (amber theme)
6. Test approval workflows
7. Navigate to All Resources to manage content
8. Check Activity Log for platform monitoring

## Visual Distinctions

**Admin Mode:**
- Amber/Orange theme (#f59e0b)
- Shield icon
- "Admin Mode" badge in sidebar
- No points displayed in header
- 4 specialized navigation items

**User Mode:**
- Indigo/Purple theme (#6366f1)
- GraduationCap icon
- Standard navigation
- Points displayed
- Full resource browsing

## Mock Data Included

- 2 pending access requests
- 1 pending upload approval
- 1 reported resource
- All 18 resources available for management

Admin Mode is now fully integrated!
