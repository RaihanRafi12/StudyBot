import {
  LayoutDashboard,
  User,
  BookOpen,
  FileText,
  Briefcase,
  GraduationCap,
  Upload,
  Activity,
  Calendar,
  Settings,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onClose: () => void;
  isOpen: boolean;
  isAuthenticated: boolean;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, requiresAuth: false },
  { id: 'profile', label: 'Profile', icon: User, requiresAuth: true },
  { id: 'courses', label: 'Courses', icon: BookOpen, requiresAuth: false },
  { id: 'documents', label: 'Documents', icon: FileText, requiresAuth: false },
  { id: 'projects', label: 'Projects', icon: Briefcase, requiresAuth: false },
  { id: 'research', label: 'Research Papers', icon: GraduationCap, requiresAuth: false },
  { id: 'uploads', label: 'Uploads', icon: Upload, requiresAuth: true },
  { id: 'activity', label: 'Activity Log', icon: Activity, requiresAuth: true },
  { id: 'calendar', label: 'Calendar', icon: Calendar, requiresAuth: false },
  { id: 'settings', label: 'Settings', icon: Settings, requiresAuth: true },
];

export function Sidebar({ currentView, onNavigate, onClose, isOpen, isAuthenticated }: SidebarProps) {
  // Filter nav items based on authentication
  const visibleNavItems = navItems.filter(
    (item) => !item.requiresAuth || isAuthenticated
  );

  return (
    <>
      {/* Backdrop for mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: isOpen ? 0 : -280 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed lg:relative inset-y-0 left-0 z-40 w-64 border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 top-16"
      >
        <ScrollArea className="h-[calc(100vh-4rem)] py-4">
          <nav className="space-y-1 px-3">
            {visibleNavItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    variant={isActive ? 'default' : 'ghost'}
                    className={`w-full justify-start gap-3 ${
                      isActive
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                        : 'hover:bg-muted'
                    }`}
                    onClick={() => onNavigate(item.id)}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Button>
                </motion.div>
              );
            })}
          </nav>
        </ScrollArea>
      </motion.aside>
    </>
  );
}
