import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { sanitizeText } from '@/lib/sanitize';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { format, formatDistanceToNow } from 'date-fns';
import { MessageSquare, GitCommit, Send, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface AuditEntry {
  type: 'audit';
  id: string;
  field_name: string;
  old_value: string | null;
  new_value: string;
  changed_by: string;
  changed_at: string;
}

interface CommentEntry {
  type: 'comment';
  id: string;
  comment_text: string;
  user_id: string;
  author_email: string;
  created_at: string;
}

type ActivityEntry = AuditEntry | CommentEntry;

interface AuthorProfile {
  user_id: string;
  display_name: string | null;
  full_name: string | null;
  email: string | null;
  actor_type: string | null;
}

function auditLabel(entry: AuditEntry): string {
  switch (entry.field_name) {
    case 'created':
      return 'Action created';
    case 'status':
      return `Status changed: ${entry.old_value ?? '—'} → ${entry.new_value}`;
    case 'action_title':
      return `Title changed: "${entry.old_value}" → "${entry.new_value}"`;
    default:
      return `${entry.field_name} updated`;
  }
}

function displayName(userId: string, profiles: Map<string, AuthorProfile>, currentUserId: string): string {
  if (userId === currentUserId) return 'You';
  const p = profiles.get(userId);
  if (!p) return 'A team member';
  const name = p.display_name || p.full_name;
  if (name) return name;
  const role = p.actor_type ? p.actor_type.charAt(0).toUpperCase() + p.actor_type.slice(1) : 'User';
  if (p.email) return `${role} (${p.email.split('@')[0]})`;
  return role;
}

function authorInitials(label: string): string {
  const words = label.split(' ');
  return words.length >= 2
    ? (words[0][0] + words[1][0]).toUpperCase()
    : label.slice(0, 2).toUpperCase();
}

interface ActionActivityFeedProps {
  actionId: string;
}

export function ActionActivityFeed({ actionId }: ActionActivityFeedProps) {
  const { user } = useAuth();
  const [entries, setEntries] = useState<ActivityEntry[]>([]);
  const [profiles, setProfiles] = useState<Map<string, AuthorProfile>>(new Map());
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [posting, setPosting] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchActivity = async () => {
    const [auditRes, commentsRes] = await Promise.all([
      supabase
        .from('action_audit_log')
        .select('id, field_name, old_value, new_value, changed_by, changed_at')
        .eq('action_id', actionId)
        .order('changed_at', { ascending: true }),
      supabase
        .from('action_comments')
        .select('id, comment_text, user_id, author_email, created_at')
        .eq('action_id', actionId)
        .order('created_at', { ascending: true }),
    ]);

    const auditEntries: AuditEntry[] = (auditRes.data ?? []).map(a => ({
      type: 'audit',
      id: a.id,
      field_name: a.field_name,
      old_value: a.old_value,
      new_value: a.new_value,
      changed_by: a.changed_by,
      changed_at: a.changed_at,
    }));

    const commentEntries: CommentEntry[] = (commentsRes.data ?? []).map(c => ({
      type: 'comment',
      id: c.id,
      comment_text: c.comment_text,
      user_id: c.user_id,
      author_email: c.author_email,
      created_at: c.created_at ?? new Date().toISOString(),
    }));

    // Merge and sort chronologically
    const merged: ActivityEntry[] = [
      ...auditEntries,
      ...commentEntries,
    ].sort((a, b) => {
      const aTime = a.type === 'audit' ? a.changed_at : a.created_at;
      const bTime = b.type === 'audit' ? b.changed_at : b.created_at;
      return new Date(aTime).getTime() - new Date(bTime).getTime();
    });

    setEntries(merged);

    // Batch fetch profiles for all unique user_ids
    const userIds = new Set<string>();
    auditEntries.forEach(e => userIds.add(e.changed_by));
    commentEntries.forEach(e => userIds.add(e.user_id));

    if (userIds.size > 0) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('user_id, display_name, full_name, email, actor_type')
        .in('user_id', Array.from(userIds));

      const map = new Map<string, AuthorProfile>();
      (profileData ?? []).forEach(p => map.set(p.user_id, p as AuthorProfile));
      setProfiles(map);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (!actionId) return;
    setLoading(true);
    fetchActivity();
  }, [actionId]);

  // Real-time: re-fetch when comments or audit entries change
  useEffect(() => {
    if (!actionId) return;
    const channel = supabase
      .channel(`action-feed-${actionId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'action_comments', filter: `action_id=eq.${actionId}` }, fetchActivity)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'action_audit_log', filter: `action_id=eq.${actionId}` }, fetchActivity)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [actionId]);

  // Scroll to bottom when new entries arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [entries.length]);

  const handlePost = async () => {
    if (!comment.trim() || !user) return;
    setPosting(true);
    try {
      const { error } = await supabase.from('action_comments').insert({
        action_id: actionId,
        user_id: user.id,
        author_email: user.email ?? '',
        comment_text: sanitizeText(comment.trim()),
      });
      if (error) throw error;
      setComment('');
    } catch {
      toast.error('Failed to post comment');
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    const { error } = await supabase
      .from('action_comments')
      .delete()
      .eq('id', commentId);
    if (error) toast.error('Failed to delete comment');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handlePost();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6 gap-2 text-muted-foreground text-sm">
        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading activity…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 pt-2">
        <div className="h-px flex-1 bg-border" />
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium px-2">Activity</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      {/* Timeline */}
      {entries.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-3">No activity yet</p>
      ) : (
        <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
          {entries.map(entry => {
            const isAudit = entry.type === 'audit';
            const userId = isAudit ? entry.changed_by : entry.user_id;
            const author = displayName(userId, profiles, user?.id ?? '');
            const timestamp = isAudit ? entry.changed_at : entry.created_at;
            const isOwn = userId === user?.id;

            return (
              <div key={entry.id} className={cn('flex gap-2.5 group', isAudit ? 'items-center' : 'items-start')}>
                {/* Avatar / icon */}
                {isAudit ? (
                  <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <GitCommit className="h-2.5 w-2.5 text-muted-foreground" />
                  </div>
                ) : (
                  <div className={cn(
                    'h-6 w-6 rounded-full flex items-center justify-center text-[9px] font-semibold shrink-0 mt-0.5',
                    isOwn ? 'bg-[hsl(var(--brand-500))] text-white' : 'bg-muted text-muted-foreground'
                  )}>
                    {authorInitials(author)}
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {isAudit ? (
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      <span className="font-medium text-foreground">{author}</span>
                      {' · '}
                      {auditLabel(entry as AuditEntry)}
                      <span className="ml-2 text-[10px] text-muted-foreground/60">
                        {formatDistanceToNow(new Date(timestamp), { addSuffix: true })}
                      </span>
                    </p>
                  ) : (
                    <div className="rounded-lg bg-muted/50 border border-border/50 px-3 py-2 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-semibold text-foreground">{author}</span>
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-muted-foreground/60">
                            {format(new Date(timestamp), 'dd MMM HH:mm')}
                          </span>
                          {isOwn && (
                            <button
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                              onClick={() => handleDelete(entry.id)}
                              aria-label="Delete comment"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-foreground leading-relaxed">{(entry as CommentEntry).comment_text}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      )}

      {/* Comment input */}
      <div className="flex gap-2 items-end">
        <Textarea
          placeholder="Add a comment… (Ctrl+Enter to post)"
          value={comment}
          onChange={e => setComment(e.target.value)}
          onKeyDown={handleKeyDown}
          className="resize-none text-xs min-h-[60px] max-h-32"
          rows={2}
        />
        <Button
          size="sm"
          className="h-9 px-3 shrink-0"
          disabled={!comment.trim() || posting}
          onClick={handlePost}
        >
          {posting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
        </Button>
      </div>
      <p className="text-[10px] text-muted-foreground/60">
        <MessageSquare className="h-2.5 w-2.5 inline mr-1" />
        Comments are visible to both coach and dealer. Audit log is automatic.
      </p>
    </div>
  );
}
