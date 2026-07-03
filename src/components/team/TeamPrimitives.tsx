import { ReactNode } from 'react';
import { Copy, RefreshCw, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/* ---------- Section header inside a card ---------- */

export function TeamSubHeader({
  title,
  count,
  action,
}: {
  title: string;
  count?: number;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <h4 className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          {title}
        </h4>
        {typeof count === 'number' && count > 0 && (
          <span className="text-[11px] font-medium text-muted-foreground bg-muted rounded-full px-2 py-0.5">
            {count}
          </span>
        )}
      </div>
      {action}
    </div>
  );
}

/* ---------- Avatar / initials chip ---------- */

export function InitialsAvatar({
  initials,
  variant = 'accent',
  size = 'md',
}: {
  initials: string;
  variant?: 'accent' | 'muted' | 'coach' | 'oem';
  size?: 'sm' | 'md';
}) {
  const sizeClasses = size === 'sm' ? 'w-7 h-7 text-[10px]' : 'w-9 h-9 text-xs';
  const variantClasses = {
    accent: 'bg-[hsl(var(--dd-accent-light))] text-[hsl(var(--dd-accent))]',
    muted: 'bg-muted text-muted-foreground',
    coach: 'bg-emerald-50 text-emerald-700',
    oem: 'bg-amber-50 text-amber-700',
  }[variant];
  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-semibold shrink-0 ring-1 ring-inset ring-black/5',
        sizeClasses,
        variantClasses,
      )}
    >
      {initials}
    </div>
  );
}

/* ---------- Pending invite row (shared) ---------- */

interface PendingInviteRowProps {
  email: string;
  expiresAt: string;
  roleLabel: string;
  onCopy: () => void;
  onResend?: () => void;
  onRevoke: () => void;
  avatarVariant?: 'accent' | 'coach' | 'oem';
}

export function PendingInviteRow({
  email,
  expiresAt,
  roleLabel,
  onCopy,
  onResend,
  onRevoke,
  avatarVariant = 'accent',
}: PendingInviteRowProps) {
  const isExpired = new Date(expiresAt) <= new Date();
  const initials = email.slice(0, 2).toUpperCase();
  return (
    <div
      className={cn(
        'group flex flex-col sm:flex-row sm:items-center gap-3 rounded-lg border border-[hsl(var(--dd-rule))] bg-white p-3 transition-colors hover:border-[hsl(var(--dd-accent-mid))] hover:bg-[hsl(var(--dd-accent-light))]/30',
        isExpired && 'opacity-60',
      )}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <InitialsAvatar initials={initials} variant={avatarVariant} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium truncate">{email}</p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 font-medium">
              {roleLabel}
            </Badge>
            {isExpired ? (
              <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-4 font-medium">
                Expired
              </Badge>
            ) : (
              <span className="text-[11px] text-muted-foreground">
                Expires {new Date(expiresAt).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-0.5 self-end sm:self-auto sm:opacity-60 sm:group-hover:opacity-100 transition-opacity">
        <Button
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0 hover:bg-[hsl(var(--dd-accent-light))] hover:text-[hsl(var(--dd-accent))]"
          onClick={onCopy}
          title="Copy invite link"
        >
          <Copy className="h-3.5 w-3.5" />
        </Button>
        {onResend && (
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 hover:bg-[hsl(var(--dd-accent-light))] hover:text-[hsl(var(--dd-accent))]"
            onClick={onResend}
            title="Resend invite"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        )}
        <Button
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          onClick={onRevoke}
          title="Revoke invite"
        >
          <XCircle className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

/* ---------- Member row ---------- */

export function MemberRow({
  name,
  initials,
  roleLabel,
}: {
  name: string;
  initials: string;
  roleLabel: string;
}) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-[hsl(var(--dd-rule))] last:border-0">
      <InitialsAvatar initials={initials} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{name}</p>
      </div>
      <span className="bg-[hsl(var(--dd-accent-light))] text-[hsl(var(--dd-accent))] text-[11px] font-medium px-2 py-0.5 rounded-full capitalize">
        {roleLabel}
      </span>
    </div>
  );
}

/* ---------- Copyable link block ---------- */

import { Input } from '@/components/ui/input';

export function InviteLinkBlock({
  url,
  onCopy,
}: {
  url: string;
  onCopy: () => void;
}) {
  return (
    <div className="rounded-lg border border-dashed border-[hsl(var(--dd-accent-mid))] bg-[hsl(var(--dd-accent-light))]/40 p-3 flex items-center gap-2">
      <Input value={url} readOnly className="text-xs bg-white h-9" />
      <Button size="sm" variant="outline" onClick={onCopy} className="shrink-0">
        <Copy className="h-3.5 w-3.5 mr-1.5" />
        Copy
      </Button>
    </div>
  );
}
