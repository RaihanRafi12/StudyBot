import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Settings,
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Trash2,
  Save,
  LogOut,
} from 'lucide-react';
import { motion } from 'motion/react';

interface SettingsViewProps {
  theme: 'light' | 'dark';
  onThemeChange: (theme: 'light' | 'dark') => void;
  onSaveSettings: (settings: any) => void;
  onLogout?: () => void;
}

export function SettingsView({ theme, onThemeChange, onSaveSettings, onLogout }: SettingsViewProps) {
  // Account Settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [accessRequests, setAccessRequests] = useState(true);
  const [newUploads, setNewUploads] = useState(false);
  const [weeklyDigest, setWeeklyDigest] = useState(true);

  // Privacy Settings
  const [profileVisibility, setProfileVisibility] = useState('public');
  const [showEmail, setShowEmail] = useState(false);
  const [showActivityHistory, setShowActivityHistory] = useState(true);

  // Preferences
  const [language, setLanguage] = useState('en');
  const [resourcesPerPage, setResourcesPerPage] = useState('12');
  const [autoApproveRequests, setAutoApproveRequests] = useState(false);

  const handleSaveSettings = () => {
    const settings = {
      notifications: {
        email: emailNotifications,
        push: pushNotifications,
        accessRequests,
        newUploads,
        weeklyDigest,
      },
      privacy: {
        profileVisibility,
        showEmail,
        showActivityHistory,
      },
      preferences: {
        theme,
        language,
        resourcesPerPage,
        autoApproveRequests,
      },
    };
    onSaveSettings(settings);
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <Tabs defaultValue="account" className="space-y-6">
        <TabsList>
          <TabsTrigger value="account" className="gap-2">
            <User className="h-4 w-4" />
            Account
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="privacy" className="gap-2">
            <Shield className="h-4 w-4" />
            Privacy
          </TabsTrigger>
          <TabsTrigger value="preferences" className="gap-2">
            <Palette className="h-4 w-4" />
            Preferences
          </TabsTrigger>
        </TabsList>

        {/* Account Settings */}
        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>
                Update your account details and password
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input id="current-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input id="new-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input id="confirm-password" type="password" />
              </div>
              <Button className="w-full sm:w-auto">Update Password</Button>
            </CardContent>
          </Card>

          <Card className="border-red-500/20">
            <CardHeader>
              <CardTitle className="text-red-600">Danger Zone</CardTitle>
              <CardDescription>
                Irreversible actions that affect your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-red-500/10">
                <div>
                  <p className="font-medium text-red-600">Delete Account</p>
                  <p className="text-sm text-muted-foreground">
                    Permanently delete your account and all data
                  </p>
                </div>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
              <CardDescription>
                Configure how you receive email notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications via email
                  </p>
                </div>
                <Switch
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Access Requests</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when someone requests access to your resources
                  </p>
                </div>
                <Switch
                  checked={accessRequests}
                  onCheckedChange={setAccessRequests}
                  disabled={!emailNotifications}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>New Uploads</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified about new resources in your categories
                  </p>
                </div>
                <Switch
                  checked={newUploads}
                  onCheckedChange={setNewUploads}
                  disabled={!emailNotifications}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Weekly Digest</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive a weekly summary of platform activity
                  </p>
                </div>
                <Switch
                  checked={weeklyDigest}
                  onCheckedChange={setWeeklyDigest}
                  disabled={!emailNotifications}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Push Notifications</CardTitle>
              <CardDescription>
                Manage in-app push notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Show notifications in your browser
                  </p>
                </div>
                <Switch
                  checked={pushNotifications}
                  onCheckedChange={setPushNotifications}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Settings */}
        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Privacy</CardTitle>
              <CardDescription>
                Control who can see your profile information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Profile Visibility</Label>
                <Select value={profileVisibility} onValueChange={setProfileVisibility}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public - Anyone can view</SelectItem>
                    <SelectItem value="students">Students Only</SelectItem>
                    <SelectItem value="private">Private - Only me</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Show Email Address</Label>
                  <p className="text-sm text-muted-foreground">
                    Display your email on your public profile
                  </p>
                </div>
                <Switch checked={showEmail} onCheckedChange={setShowEmail} />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Show Activity History</Label>
                  <p className="text-sm text-muted-foreground">
                    Let others see your recent activities
                  </p>
                </div>
                <Switch
                  checked={showActivityHistory}
                  onCheckedChange={setShowActivityHistory}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data & Privacy</CardTitle>
              <CardDescription>
                Manage your data and privacy settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full sm:w-auto">
                Download My Data
              </Button>
              <Button variant="outline" className="w-full sm:w-auto">
                Privacy Policy
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences */}
        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize how StudyBot looks and feels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Theme</Label>
                <div className="grid grid-cols-2 gap-4">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      variant={theme === 'light' ? 'default' : 'outline'}
                      className="w-full h-20 flex flex-col gap-2"
                      onClick={() => onThemeChange('light')}
                    >
                      <div className="h-6 w-6 rounded-full bg-white border-2 border-gray-300" />
                      Light
                    </Button>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      variant={theme === 'dark' ? 'default' : 'outline'}
                      className="w-full h-20 flex flex-col gap-2"
                      onClick={() => onThemeChange('dark')}
                    >
                      <div className="h-6 w-6 rounded-full bg-gray-900 border-2 border-gray-700" />
                      Dark
                    </Button>
                  </motion.div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Regional Settings</CardTitle>
              <CardDescription>
                Set your language and region preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Language</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                    <SelectItem value="zh">Chinese</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resource Preferences</CardTitle>
              <CardDescription>
                Customize your resource browsing experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Resources Per Page</Label>
                <Select value={resourcesPerPage} onValueChange={setResourcesPerPage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6">6 items</SelectItem>
                    <SelectItem value="12">12 items</SelectItem>
                    <SelectItem value="24">24 items</SelectItem>
                    <SelectItem value="48">48 items</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-approve Access Requests</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically approve all access requests to your resources
                  </p>
                </div>
                <Switch
                  checked={autoApproveRequests}
                  onCheckedChange={setAutoApproveRequests}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex justify-end gap-2">
        {onLogout && (
          <Button size="lg" onClick={onLogout} variant="outline">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        )}
        <Button size="lg" onClick={handleSaveSettings}>
          <Save className="h-4 w-4 mr-2" />
          Save All Settings
        </Button>
      </div>
    </div>
  );
}