import { useState, useEffect, useCallback } from 'react';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { markNotificationRead, markAllNotificationsRead, type Notification } from '@/lib/notifications';
import { cn } from '@/lib/utils';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function truncate(text: string, max = 80): string {
  return text.length <= max ? text : text.slice(0, max).trimEnd() + '...';
}

interface NotificationBellProps {
  /** collapsed = icon-only mode (sidebar collapsed state) */
  collapsed?: boolean;
  /** headerMode = renders on a light background (AppHeader), uses muted-foreground colors */
  headerMode?: boolean;
}

export function NotificationBell({ collapsed = false, headerMode = false }: NotificationBellProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .eq('read', false)
      .order('created_at', { ascending: false })
      .limit(20);
    if (!error && data) {
      setNotifications(data as Notification[]);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Realtime subscription
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel('notifications-bell')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
        () => { fetchNotifications(); }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, fetchNotifications]);

  const handleMarkRead = async (n: Notification) => {
    await markNotificationRead(n.id);
    setNotifications(prev => prev.filter(x => x.id !== n.id));
    if (n.entity_type === 'improvement_action') {
      navigate('/app/actions');
      setOpen(false);
    }
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead();
    setNotifications([]);
    setOpen(false);
  };

  const unreadCount = notifications.length;

  if (!user) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'relative h-9 w-9 p-0',
            headerMode
              ? 'text-muted-foreground hover:text-foreground hover:bg-accent'
              : 'text-white/55 hover:text-white/85 hover:bg-white/5',
            collapsed && 'justify-center'
          )}
          aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground leading-none">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        side="right"
        align="end"
        sideOffset={8}
        className="w-80 p-0 shadow-floating"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <span className="text-body-sm font-medium text-foreground">Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto py-0.5 px-2 text-caption text-muted-foreground hover:text-foreground"
              onClick={handleMarkAllRead}
            >
              Mark all read
            </Button>
          )}
        </div>

        {/* List */}
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <Bell className="h-6 w-6 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-body-sm text-muted-foreground">No unread notifications</p>
            </div>
          ) : (
            notifications.map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => handleMarkRead(n)}
                className="w-full text-left px-4 py-3 border-b border-border/50 last:border-0 hover:bg-muted/40 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-body-sm font-medium text-foreground leading-snug flex-1">
                    {n.title}
                  </p>
                  <span className="text-caption text-muted-foreground shrink-0 mt-0.5">
                    {timeAgo(n.created_at)}
                  </span>
                </div>
                <p className="text-body-sm text-muted-foreground mt-0.5 leading-snug">
                  {truncate(n.body)}
                </p>
                {n.entity_type === 'improvement_action' && (
                  <Badge variant="outline" className="mt-1.5 text-caption px-1.5 py-0">
                    Action item
                  </Badge>
                )}
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
