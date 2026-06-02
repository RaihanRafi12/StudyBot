import { motion, AnimatePresence } from 'motion/react';
import {
  Shield,
  LayoutDashboard,
  Activity,
  FolderOpen,
  Users,
  Settings,
  X,
} from 'lucide-react';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';

interface AdminSidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onClose: () => void;
  isOpen: boolean;
  pendingCount: number;
}

const navItems = [
  { id: 'admin-dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'admin-activity', label: 'Activity Log', icon: Activity },
  { id: 'admin-resources', label: 'All Resources', icon: FolderOpen },
  { id: 'admin-users', label: 'User Management', icon: Users },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function AdminSidebar({ currentView, onNavigate, onClose, isOpen, pendingCount }: AdminSidebarProps) {
  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed lg:sticky top-0 left-0 z-50 h-screen w-[280px] border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
          >
            <div className="flex h-full flex-col">
              {/* Admin Badge */}
              <div className="flex h-16 items-center justify-between px-4 border-b bg-gradient-to-r from-amber-500/10 to-orange-500/10">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold">Admin Panel</h2>
                    <p className="text-xs text-muted-foreground">Full Control</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden"
                  onClick={onClose}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Navigation */}
              <ScrollArea className="flex-1 px-3 py-4">
                <nav className="space-y-2">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentView === item.id;

                    return (
                      <motion.button
                        key={item.id}
                        whileHover={{ x: 4 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onNavigate(item.id)}
                        className={`
                          group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors
                          ${
                            isActive
                              ? 'bg-primary text-primary-foreground shadow-sm'
                              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                          }
                        `}
                      >
                        <Icon className="h-5 w-5 shrink-0" />
                        <span className="flex-1 text-left">{item.label}</span>
                        {item.id === 'admin-dashboard' && pendingCount > 0 && (
                          <Badge
                            variant="secondary"
                            className="ml-auto bg-amber-500 text-white hover:bg-amber-600"
                          >
                            {pendingCount}
                          </Badge>
                        )}
                        {isActive && (
                          <motion.div
                            layoutId="activeTab"
                            className="absolute inset-0 rounded-lg bg-primary -z-10"
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                          />
                        )}
                      </motion.button>
                    );
                  })}
                </nav>
              </ScrollArea>

              {/* Footer */}
              <div className="border-t p-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Shield className="h-4 w-4 text-amber-500" />
                  <span>Administrator privileges active</span>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
