import { Bell, CheckCheck, ExternalLink, Trash2, Coins, Send, Landmark, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotifications, Notification } from '@/hooks/useNotifications';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const getNotificationIcon = (title: string) => {
  if (title.toLowerCase().includes('mint')) return <Coins className="h-4 w-4" />;
  if (title.toLowerCase().includes('send') || title.toLowerCase().includes('transfer')) return <Send className="h-4 w-4" />;
  if (title.toLowerCase().includes('stake') || title.toLowerCase().includes('unstake') || title.toLowerCase().includes('claim')) return <Landmark className="h-4 w-4" />;
  return <Bell className="h-4 w-4" />;
};

const getTypeStyles = (type: Notification['type']) => {
  switch (type) {
    case 'success':
      return 'bg-green-500/10 border-green-500/20 text-green-500';
    case 'error':
      return 'bg-destructive/10 border-destructive/20 text-destructive';
    case 'warning':
      return 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500';
    default:
      return 'bg-primary/10 border-primary/20 text-primary';
  }
};

function NotificationItem({ notification, onMarkRead }: { notification: Notification; onMarkRead: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={`p-3 border rounded-lg mb-2 cursor-pointer transition-all hover:bg-accent/50 ${
        notification.read ? 'opacity-60' : ''
      }`}
      onClick={onMarkRead}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-full ${getTypeStyles(notification.type)}`}>
          {getNotificationIcon(notification.title)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="font-medium text-sm truncate">{notification.title}</p>
            {!notification.read && (
              <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notification.message}</p>
          {notification.txHash && (
            <a
              href={`https://sepolia.etherscan.io/tx/${notification.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1"
              onClick={(e) => e.stopPropagation()}
            >
              View Transaction <ExternalLink className="h-3 w-3" />
            </a>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export function NotificationPanel() {
  const { notifications, markAsRead, markAllAsRead, clearAll, unreadCount, soundEnabled, toggleSound } = useNotifications();
  const count = unreadCount();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <AnimatePresence>
              {count > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center px-1"
                >
                  {count > 9 ? '9+' : count}
                </motion.span>
              )}
            </AnimatePresence>
          </Button>
        </motion.div>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-3 border-b flex items-center justify-between">
          <h3 className="font-semibold">Notifications</h3>
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" onClick={toggleSound} className="h-8 w-8 p-0">
                  {soundEnabled ? (
                    <Volume2 className="h-4 w-4 text-primary" />
                  ) : (
                    <VolumeX className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{soundEnabled ? 'Mute sounds' : 'Enable sounds'}</p>
              </TooltipContent>
            </Tooltip>
            {count > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead} className="h-8 px-2">
                <CheckCheck className="h-4 w-4 mr-1" />
                <span className="text-xs">Read all</span>
              </Button>
            )}
            {notifications.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearAll} className="h-8 px-2 text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        <ScrollArea className="h-[300px]">
          <div className="p-2">
            <AnimatePresence>
              {notifications.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-8 text-muted-foreground"
                >
                  <Bell className="h-8 w-8 mb-2 opacity-50" />
                  <p className="text-sm">No notifications yet</p>
                </motion.div>
              ) : (
                notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkRead={() => markAsRead(notification.id)}
                  />
                ))
              )}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
