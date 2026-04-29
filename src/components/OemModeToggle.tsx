import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useActiveRole } from '@/hooks/useActiveRole';
import { useMultiTenant } from '@/hooks/useMultiTenant';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Globe, Check } from 'lucide-react';

export function OemModeToggle() {
  const { actorType } = useActiveRole();
  const { userMemberships, currentOrganization } = useMultiTenant();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Only org owners see this
  const isOwner = userMemberships.some(
    m =>
      m.organization_id === currentOrganization?.id &&
      m.role === 'owner' &&
      m.is_active,
  );
  if (!isOwner) return null;

  const isOem = actorType === 'oem';

  const handleActivate = async () => {
    setLoading(true);
    const { data } = await supabase.rpc('toggle_oem_mode', { p_activate: true });
    const result = data as { success: boolean; error?: string } | null;
    if (!result?.success) {
      toast.error(
        result?.error === 'owner_required'
          ? 'Only organisation owners can activate OEM mode.'
          : 'Failed to activate OEM mode. Please try again.',
      );
      setLoading(false);
      return;
    }
    toast.success('OEM mode activated. Taking you to Network Settings…');
    // Full reload so useActiveRole picks up the new actor_type
    setTimeout(() => { window.location.href = '/app/oem-settings'; }, 1000);
  };

  const handleDeactivate = async () => {
    if (
      !confirm(
        'Deactivate OEM mode? You will lose access to the OEM Dashboard and Network Settings until you re-activate.',
      )
    )
      return;

    setLoading(true);
    const { data } = await supabase.rpc('toggle_oem_mode', { p_activate: false });
    const result = data as { success: boolean; error?: string } | null;
    if (!result?.success) {
      toast.error('Failed to deactivate OEM mode. Please try again.');
      setLoading(false);
      return;
    }
    toast.success('OEM mode deactivated.');
    setTimeout(() => { window.location.href = '/app/dashboard'; }, 1000);
  };

  return (
    <Card className={`rounded-xl border ${isOem ? 'border-[hsl(var(--brand-300))] bg-[hsl(var(--brand-050))] shadow-card' : 'border-[hsl(var(--neutral-200))] shadow-none'}`}>
      <CardHeader className="space-y-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-[hsl(var(--neutral-900))]">
          <Globe className="h-4 w-4 text-[hsl(var(--brand-500))]" />
          OEM Programme
        </CardTitle>
        {isOem && (
          <div className="flex items-center gap-2 rounded-lg border border-[hsl(var(--brand-200))] bg-background p-3">
            <Globe className="h-4 w-4 fill-[hsl(var(--brand-500))] text-[hsl(var(--brand-500))]" />
            <span className="text-sm font-medium text-[hsl(var(--neutral-900))]">OEM Programme Active</span>
          </div>
        )}
        <CardDescription className="text-body-sm text-[hsl(var(--neutral-600))]">
          {isOem
            ? 'Your account has OEM admin access. You can manage your dealer network and view the leaderboard.'
            : 'Activate OEM mode to access the OEM Dashboard, Network Settings, and dealer leaderboard. Only available to organisation owners.'}
        </CardDescription>
        {!isOem && (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {['Network leaderboard', 'Dealer score tracking', 'Programme tier management'].map(feature => (
              <div key={feature} className="flex items-center gap-2">
                <Check className="h-3 w-3 text-[hsl(var(--brand-400))]" />
                <span className="text-xs text-[hsl(var(--neutral-600))]">{feature}</span>
              </div>
            ))}
          </div>
        )}
      </CardHeader>
      <CardContent>
        {isOem ? (
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/app/oem-settings')}
            >
              Go to Network Settings
            </Button>
            <button
              type="button"
              className="text-xs text-[hsl(var(--neutral-500))] hover:text-destructive disabled:cursor-not-allowed disabled:opacity-60"
              onClick={handleDeactivate}
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
              Deactivate
            </button>
          </div>
        ) : (
          <Button variant="default" onClick={handleActivate} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Globe className="mr-2 h-4 w-4" />
            Activate OEM Mode
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
