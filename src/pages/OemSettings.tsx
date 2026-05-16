import { useActiveRole } from '@/hooks/useActiveRole';
import { OemNetworkSettings } from '@/components/OemNetworkSettings';
import { InviteOemUser } from '@/components/InviteOemUser';

export default function OemSettings() {
  const { actorType } = useActiveRole();

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Network Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure your OEM network and manage enrolled dealerships.
        </p>
      </div>
      <OemNetworkSettings />
      {actorType === 'oem' && <InviteOemUser />}
    </div>
  );
}
