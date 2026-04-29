import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useActiveRole } from '@/hooks/useActiveRole';
import { useMultiTenant } from '@/hooks/useMultiTenant';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Globe } from 'lucide-react';

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
    <Card className="shadow-card rounded-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Globe className="h-4 w-4" />
          OEM Programme
          {isOem && (
            <Badge className="bg-[#16a34a]/10 text-[#16a34a] border-[#16a34a]/20 ml-1">
              Active
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          {isOem
            ? 'Your account has OEM admin access. You can manage your dealer network and view the leaderboard.'
            : 'Activate OEM mode to access the OEM Dashboard, Network Settings, and dealer leaderboard. Only available to organisation owners.'}
        </CardDescription>
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
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              onClick={handleDeactivate}
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
              Deactivate
            </Button>
          </div>
        ) : (
          <Button onClick={handleActivate} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Activate OEM Mode
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
