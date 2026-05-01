import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { motion } from 'motion/react';
import {
  Shield,
  Bell,
  Lock,
  Palette,
  Database,
  Mail,
  LogOut,
} from 'lucide-react';

interface AdminSettingsProps {
  theme: 'light' | 'dark';
  onThemeChange: (theme: 'light' | 'dark') => void;
  adminName: string;
  adminEmail: string;
  onLogout: () => void;
}

export function AdminSettings({
  theme,
  onThemeChange,
  adminName,
  adminEmail,
  onLogout,
}: AdminSettingsProps) {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage administrator preferences and system settings</p>
      </div>

      {/* Admin Profile */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-amber-500" />
              <CardTitle>Administrator Profile</CardTitle>
            </div>
            <CardDescription>Your admin account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <p className="p-2 rounded-lg bg-muted/50 font-medium">{adminName}</p>
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <p className="p-2 rounded-lg bg-muted/50 font-medium">{adminEmail}</p>
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <p className="p-2 rounded-lg bg-amber-500/10 text-amber-600 font-medium border border-amber-500/20">
                  Administrator
                </p>
              </div>
              <div className="space-y-2">
                <Label>Access Level</Label>
                <p className="p-2 rounded-lg bg-amber-500/10 text-amber-600 font-medium border border-amber-500/20">
                  Full Control
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Appearance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              <CardTitle>Appearance</CardTitle>
            </div>
            <CardDescription>Customize the admin interface appearance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Dark Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Switch between light and dark theme
                </p>
              </div>
              <Switch
                checked={theme === 'dark'}
                onCheckedChange={(checked) => onThemeChange(checked ? 'dark' : 'light')}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Notifications */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              <CardTitle>Notifications</CardTitle>
            </div>
            <CardDescription>Configure admin notification preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Access Request Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications for new access requests
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Upload Approval Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications for new resource uploads
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Report Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications for reported resources
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Send email alerts for critical events
                </p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Security */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              <CardTitle>Security</CardTitle>
            </div>
            <CardDescription>Security and authentication settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">
                  Add an extra layer of security to your admin account
                </p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Session Timeout</Label>
                <p className="text-sm text-muted-foreground">
                  Auto-logout after 30 minutes of inactivity
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* System */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              <CardTitle>System</CardTitle>
            </div>
            <CardDescription>Platform-wide system settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-Approve Public Resources</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically approve public resource uploads
                </p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Maintenance Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Temporarily disable user access for maintenance
                </p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Danger Zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="border-red-500/20">
          <CardHeader>
            <CardTitle className="text-red-600">Danger Zone</CardTitle>
            <CardDescription>Irreversible and destructive actions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-lg bg-red-500/5 border border-red-500/20">
              <div className="space-y-0.5">
                <Label className="text-red-600">Logout from Admin Panel</Label>
                <p className="text-sm text-muted-foreground">
                  End your admin session and return to login
                </p>
              </div>
              <Button
                variant="destructive"
                onClick={onLogout}
                className="w-full sm:w-auto"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
