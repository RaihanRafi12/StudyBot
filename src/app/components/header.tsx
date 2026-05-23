import { Bell, Moon, Sun, Search, Menu, LogIn, User, LogOut } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { motion } from 'motion/react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface HeaderProps {
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
  points?: number;
  onSearch: (query: string) => void;
  onNotificationClick?: () => void;
  unreadCount?: number;
  onToggleSidebar: () => void;
  isAuthenticated: boolean;
  onLoginClick?: () => void;
  onLogout?: () => void;
  userName?: string;
}

export function Header({
  theme,
  onThemeToggle,
  points,
  onSearch,
  onNotificationClick,
  unreadCount = 0,
  onToggleSidebar,
  isAuthenticated,
  onLoginClick,
  onLogout,
  userName,
}: HeaderProps) {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container flex h-16 items-center gap-4 px-4">
        {/* Hamburger Menu */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className="shrink-0"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Logo */}
        <motion.div
          className="flex items-center gap-2 shrink-0"
          animate={{
            filter: [
              'drop-shadow(0 0 0px rgba(99, 102, 241, 0))',
              'drop-shadow(0 0 8px rgba(99, 102, 241, 0.5))',
              'drop-shadow(0 0 0px rgba(99, 102, 241, 0))',
            ],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <motion.div
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600"
            animate={{
              rotate: [0, 5, -5, 0],
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <span className="font-bold text-white">SB</span>
          </motion.div>
          <span className="text-xl font-bold hidden sm:inline">StudyBot</span>
        </motion.div>

        {/* Search Bar */}
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search courses, documents, projects..."
              className="pl-10 bg-muted/50 border-muted"
              onChange={(e) => onSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2">
          {/* Points - Only show if authenticated */}
          {isAuthenticated && points !== undefined && (
            <motion.div
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20"
              whileHover={{ scale: 1.05 }}
            >
              <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                {points} Points
              </span>
            </motion.div>
          )}

          {/* Notifications - Only show if authenticated */}
          {isAuthenticated && onNotificationClick && (
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={onNotificationClick}
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"
                />
              )}
            </Button>
          )}

          {/* Theme Toggle */}
          <Button variant="ghost" size="icon" onClick={onThemeToggle}>
            {theme === 'light' ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
          </Button>

          {/* Login Button - Only show if not authenticated */}
          {!isAuthenticated && onLoginClick && (
            <Button onClick={onLoginClick} className="hidden sm:flex">
              <LogIn className="h-4 w-4 mr-2" />
              Login
            </Button>
          )}

          {/* User Dropdown - Only show if authenticated */}
          {isAuthenticated && onLogout && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  {userName ? userName : 'My Account'}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}