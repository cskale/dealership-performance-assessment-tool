import { OemNetworkSettings } from '@/components/OemNetworkSettings';

export default function OemSettings() {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Network Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure your OEM network and manage enrolled dealerships.
        </p>
      </div>
      <OemNetworkSettings />
    </div>
  );
}
