import { motion, AnimatePresence } from 'motion/react';
import { X, Bell, Check } from 'lucide-react';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';

interface Notification {
  id: string;
  message: string;
  time: string;
  read: boolean;
}

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onNotificationClick: (id: string) => void;
  onMarkAllRead: () => void;
}

export function NotificationPanel({
  isOpen,
  onClose,
  notifications,
  onNotificationClick,
  onMarkAllRead,
}: NotificationPanelProps) {
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, x: 300, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full sm:w-96 bg-background border-l shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 flex items-center justify-center"
                    >
                      <span className="text-[10px] text-white font-bold">
                        {unreadCount}
                      </span>
                    </motion.div>
                  )}
                </div>
                <div>
                  <h2 className="font-bold">Notifications</h2>
                  <p className="text-xs text-muted-foreground">
                    {unreadCount} unread
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onMarkAllRead}
                    className="text-xs"
                  >
                    <Check className="h-3 w-3 mr-1" />
                    Mark all
                  </Button>
                )}
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Notifications List */}
            <ScrollArea className="flex-1">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64">
                  <Bell className="h-12 w-12 text-muted-foreground opacity-20 mb-4" />
                  <p className="text-muted-foreground text-sm">
                    No notifications yet
                  </p>
                </div>
              ) : (
                <div className="p-2">
                  {notifications.map((notification, index) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => onNotificationClick(notification.id)}
                      className={`p-4 mb-2 rounded-lg cursor-pointer transition-all hover:bg-muted/50 ${
                        !notification.read
                          ? 'bg-primary/5 border-l-4 border-primary'
                          : 'bg-muted/30'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className={`text-sm ${!notification.read ? 'font-medium' : ''}`}>
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {notification.time}
                          </p>
                        </div>
                        {!notification.read && (
                          <Badge
                            variant="default"
                            className="bg-primary/10 text-primary hover:bg-primary/20"
                          >
                            New
                          </Badge>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
