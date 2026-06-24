import { supabase } from '@/integrations/supabase/client';

export type NotificationType =
  | 'stale_action' | 'milestone' | 'digest' | 'coach_comment'
  | 'google_review_alert' | 'visit_date';

export interface NotificationPayload {
  user_id: string;
  organization_id: string;
  type: NotificationType;
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

// ── Visit-date notifications ────────────────────────────────────────────────

export type VisitEvent = 'proposed' | 'counter_proposed' | 'confirmed' | 'declined';

async function resolveOrgId(dealershipId: string): Promise<string | null> {
  const { data } = await supabase
    .from('dealerships')
    .select('organization_id')
    .eq('id', dealershipId)
    .single();
  return data?.organization_id ?? null;
}

const VISIT_TITLES: Record<VisitEvent, (name: string) => string> = {
  proposed: (name) => `New visit proposed – ${name}`,
  counter_proposed: (name) => `Visit date counter-proposed – ${name}`,
  confirmed: (name) => `Visit confirmed – ${name}`,
  declined: (name) => `Visit declined – ${name}`,
};

const VISIT_BODIES: Record<VisitEvent, (date: string, name: string) => string> = {
  proposed: (date, name) => `A coach has proposed a visit on ${date} for ${name}.`,
  counter_proposed: (date, name) => `The dealer has proposed an alternative date: ${date} for ${name}.`,
  confirmed: (date, name) => `The visit on ${date} for ${name} has been confirmed.`,
  declined: (_date, name) => `The proposed visit for ${name} has been declined.`,
};

export async function sendVisitNotification(opts: {
  event: VisitEvent;
  recipientUserId: string;
  dealershipId: string;
  visitId: string;
  visitDate: string;
  dealershipName: string;
}): Promise<void> {
  const { event, recipientUserId, dealershipId, visitId, visitDate, dealershipName } = opts;
  const orgId = await resolveOrgId(dealershipId);
  if (!orgId) return;

  await dispatchNotification({
    user_id: recipientUserId,
    organization_id: orgId,
    type: 'visit_date',
    channel: 'in_app',
    entity_type: 'coach_visit',
    entity_id: visitId,
    title: VISIT_TITLES[event](dealershipName),
    body: VISIT_BODIES[event](visitDate, dealershipName),
  });

  // ponytail: in_app only — add email channel when email resolution RPC exists
}

export async function notifyOemVisitConfirmed(opts: {
  dealershipId: string;
  visitId: string;
  visitDate: string;
  dealershipName: string;
}): Promise<void> {
  const { dealershipId, visitId, visitDate, dealershipName } = opts;

  const { data: membership } = await supabase
    .from('dealer_network_memberships')
    .select('network_id')
    .eq('dealership_id', dealershipId)
    .eq('is_active', true)
    .limit(1)
    .maybeSingle();
  if (!membership) return;

  const { data: network } = await supabase
    .from('oem_networks')
    .select('owner_org_id')
    .eq('id', membership.network_id)
    .single();
  if (!network) return;

  const { data: oemMembers } = await supabase
    .from('memberships')
    .select('user_id')
    .eq('organization_id', network.owner_org_id)
    .in('role', ['owner', 'admin']);
  if (!oemMembers?.length) return;

  const title = `Visit confirmed – ${dealershipName}`;
  const body = `A coach visit on ${visitDate} for ${dealershipName} has been confirmed.`;

  for (const member of oemMembers) {
    await dispatchNotification({
      user_id: member.user_id,
      organization_id: network.owner_org_id,
      type: 'visit_date',
      channel: 'in_app',
      entity_type: 'coach_visit',
      entity_id: visitId,
      title,
      body,
    });
  }
}
