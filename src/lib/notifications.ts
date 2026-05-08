import { supabase } from '@/integrations/supabase/client';

export interface NotificationPayload {
  user_id: string;
  organization_id: string;
  type: 'stale_action' | 'milestone' | 'digest' | 'coach_comment' | 'google_review_alert';
  channel: 'in_app' | 'email';
  entity_type?: string;
  entity_id?: string;
  title: string;
  body: string;
  email_to?: string;
}

export interface Notification {
  id: string;
  user_id: string;
  organization_id: string;
  type: string;
  channel: string;
  entity_type: string | null;
  entity_id: string | null;
  title: string;
  body: string;
  read: boolean;
  sent_at: string;
  created_at: string;
}

/**
 * Dispatch a notification via the notify-dispatcher edge function.
 * Never throws - notifications must not break primary flows.
 */
export async function dispatchNotification(payload: NotificationPayload): Promise<void> {
  try {
    const { error } = await supabase.functions.invoke('notify-dispatcher', {
      body: payload,
    });
    if (error) {
      console.warn('[notifications] dispatch failed silently:', error.message);
    }
  } catch (err) {
    console.warn('[notifications] dispatch threw silently:', err);
  }
}

/**
 * Mark a single notification as read.
 * Never throws.
 */
export async function markNotificationRead(notificationId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);
    if (error) {
      console.warn('[notifications] markRead failed silently:', error.message);
    }
  } catch (err) {
    console.warn('[notifications] markRead threw silently:', err);
  }
}

/**
 * Mark all unread notifications for the current user as read.
 * Never throws.
 */
export async function markAllNotificationsRead(): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false);
    if (error) {
      console.warn('[notifications] markAllRead failed silently:', error.message);
    }
  } catch (err) {
    console.warn('[notifications] markAllRead threw silently:', err);
  }
}
