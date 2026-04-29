import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useMultiTenant } from '@/hooks/useMultiTenant';
import { Button } from '@/components/ui/button';
import { ChipInput } from '@/components/ui/ChipInput';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { Loader2, Search, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import type { Tables } from '@/integrations/supabase/types';

type OemNetwork = Tables<'oem_networks'>;

interface LookupResult {
  found: boolean;
  reason?: 'no_account' | 'no_dealership';
  dealership_id?: string;
  dealership_name?: string;
  location?: string;
  organization_id?: string;
  error?: string;
}

interface DealershipDetail {
  id: string;
  name: string;
  location: string;
}

interface RosterEntry {
  membershipId: string;
  dealershipId: string;
  name: string;
  location: string;
  programmeTier: string;
  enrolledAt: string | null;
}

const PROGRAMME_TIERS = ['Standard', 'Silver', 'Gold', 'Platinum'] as const;

export function OemNetworkSettings() {
  const { currentOrganization, userMemberships } = useMultiTenant();

  const [network, setNetwork] = useState<OemNetwork | null>(null);
  const [networkLoading, setNetworkLoading] = useState(true);
  const [networkSaving, setNetworkSaving] = useState(false);
  const [formName, setFormName] = useState('');
  const [formBrand, setFormBrand] = useState('');
  const [formCountries, setFormCountries] = useState<string[]>([]);

  const [lookupEmail, setLookupEmail] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupResult, setLookupResult] = useState<LookupResult | null>(null);
  const [selectedTier, setSelectedTier] = useState<string>('Standard');
  const [addingDealer, setAddingDealer] = useState(false);

  const [roster, setRoster] = useState<RosterEntry[]>([]);
  const [rosterLoading, setRosterLoading] = useState(false);

  const canManage = userMemberships.some(
    m =>
      m.organization_id === currentOrganization?.id &&
      ['owner', 'admin'].includes(m.role) &&
      m.is_active,
  );

  const loadRoster = useCallback(async (networkId: string) => {
    setRosterLoading(true);
    const { data: memberships } = await supabase
      .from('dealer_network_memberships')
      .select('id, dealership_id, programme_tier, enrolled_at')
      .eq('network_id', networkId)
      .eq('is_active', true)
      .order('enrolled_at', { ascending: false });

    if (!memberships?.length) {
      setRoster([]);
      setRosterLoading(false);
      return;
    }

    const ids = memberships
      .map(m => m.dealership_id)
      .filter((id): id is string => id != null);

    const { data: detailsRaw } = await supabase.rpc('get_dealership_details', { p_ids: ids });
    const details = (detailsRaw as unknown as DealershipDetail[] | null) ?? [];
    const detailMap = new Map(details.map(d => [d.id, d]));

    setRoster(
      memberships.map(m => ({
        membershipId: m.id,
        dealershipId: m.dealership_id ?? '',
        name: detailMap.get(m.dealership_id ?? '')?.name ?? 'Unknown',
        location: detailMap.get(m.dealership_id ?? '')?.location ?? '',
        programmeTier: m.programme_tier ?? 'Standard',
        enrolledAt: m.enrolled_at,
      })),
    );
    setRosterLoading(false);
  }, []);

  useEffect(() => {
    if (!currentOrganization?.id) return;
    const load = async () => {
      setNetworkLoading(true);
      const { data } = await supabase
        .from('oem_networks')
        .select('*')
        .eq('owner_org_id', currentOrganization.id)
        .eq('status', 'active')
        .maybeSingle();
      if (data) {
        setNetwork(data);
        setFormName(data.name);
        setFormBrand(data.oem_brand);
        setFormCountries(data.country_scope ?? []);
        loadRoster(data.id);
      }
      setNetworkLoading(false);
    };
    load();
  }, [currentOrganization?.id, loadRoster]);

  const handleSaveNetwork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrganization?.id) return;
    setNetworkSaving(true);
    const countryArray = formCountries;

    if (network) {
      await supabase
        .from('oem_networks')
        .update({ name: formName, oem_brand: formBrand, country_scope: countryArray })
        .eq('id', network.id);
      setNetwork(prev =>
        prev ? { ...prev, name: formName, oem_brand: formBrand, country_scope: countryArray } : prev,
      );
    } else {
      const { data } = await supabase
        .from('oem_networks')
        .insert({
          name: formName,
          oem_brand: formBrand,
          country_scope: countryArray,
          owner_org_id: currentOrganization.id,
          status: 'active',
        })
        .select()
        .single();
      if (data) {
        setNetwork(data);
        loadRoster(data.id);
      }
    }
    toast.success('Network saved.');
    setNetworkSaving(false);
  };

  const handleLookup = async () => {
    if (!lookupEmail.trim() || !network) return;
    setLookupLoading(true);
    setLookupResult(null);
    const { data } = await supabase.rpc('lookup_dealer_by_email', {
      p_email: lookupEmail.trim().toLowerCase(),
    });
    setLookupResult(data as unknown as LookupResult);
    setLookupLoading(false);
  };

  const handleAddDealer = async () => {
    if (!lookupResult?.found || !network) return;
    if (roster.some(r => r.dealershipId === lookupResult.dealership_id)) {
      toast.error('This dealer is already enrolled in your network.');
      return;
    }
    setAddingDealer(true);
    const { error } = await supabase.from('dealer_network_memberships').upsert(
      {
        network_id: network.id,
        dealership_id: lookupResult.dealership_id!,
        organization_id: lookupResult.organization_id!,
        programme_tier: selectedTier,
        is_active: true,
        enrolled_at: new Date().toISOString(),
      },
      { onConflict: 'network_id,organization_id,dealership_id' },
    );
    if (error) {
      toast.error('Failed to add dealer. Please try again.');
    } else {
      toast.success(`${lookupResult.dealership_name} added to your network.`);
      setLookupEmail('');
      setLookupResult(null);
      setSelectedTier('Standard');
      loadRoster(network.id);
    }
    setAddingDealer(false);
  };

  const handleTierChange = async (membershipId: string, tier: string) => {
    await supabase
      .from('dealer_network_memberships')
      .update({ programme_tier: tier })
      .eq('id', membershipId);
    setRoster(prev =>
      prev.map(r => (r.membershipId === membershipId ? { ...r, programmeTier: tier } : r)),
    );
  };

  const handleRemove = async (membershipId: string, dealerName: string) => {
    await supabase
      .from('dealer_network_memberships')
      .update({ is_active: false })
      .eq('id', membershipId);
    setRoster(prev => prev.filter(r => r.membershipId !== membershipId));
    toast.success(`${dealerName} removed from network.`);
  };

  if (!canManage) return null;

  if (networkLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Card 1: Network Details ── */}
      <Card className="shadow-card rounded-xl">
        <CardHeader>
          <CardTitle>{network ? 'Edit network details' : 'Create your network'}</CardTitle>
          <CardDescription>
            Define the name and brand for your OEM network. These appear on the OEM Dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveNetwork} className="space-y-4 max-w-md">
            <div className="space-y-1.5">
              <Label htmlFor="net-name">Network name</Label>
              <Input
                id="net-name"
                placeholder="e.g. Audi Germany Pilot Network"
                value={formName}
                onChange={e => setFormName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="net-brand">OEM brand</Label>
              <Input
                id="net-brand"
                placeholder="e.g. Audi"
                value={formBrand}
                onChange={e => setFormBrand(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="net-countries">Country scope</Label>
              <Input
                id="net-countries"
                placeholder="e.g. Germany, Austria, Switzerland"
                value={formCountries}
                onChange={e => setFormCountries(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Comma-separated list of countries</p>
            </div>
            <Button type="submit" disabled={networkSaving || !formName || !formBrand}>
              {networkSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {network ? 'Save changes' : 'Create network'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* ── Card 2: Dealer Roster ── */}
      {network && (
        <Card className="shadow-card rounded-xl">
          <CardHeader>
            <CardTitle>Dealer roster</CardTitle>
            <CardDescription>
              Look up a dealer by email to add them to your network. They must already have an
              account and completed dealership setup.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Lookup row */}
            <div className="space-y-3">
              <div className="flex gap-2 max-w-md">
                <div className="flex-1 space-y-1.5">
                  <Label htmlFor="lookup-email">Dealer contact email</Label>
                  <Input
                    id="lookup-email"
                    type="email"
                    placeholder="manager@dealership.com"
                    value={lookupEmail}
                    onChange={e => {
                      setLookupEmail(e.target.value);
                      setLookupResult(null);
                    }}
                    onKeyDown={e => e.key === 'Enter' && handleLookup()}
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleLookup}
                    disabled={lookupLoading || !lookupEmail.trim()}
                  >
                    {lookupLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                    <span className="ml-1.5">Look up</span>
                  </Button>
                </div>
              </div>

              {/* Lookup result */}
              {lookupResult && (
                <div className="max-w-md">
                  {lookupResult.error === 'unauthorized' && (
                    <p className="text-sm text-destructive">
                      Permission denied. Ensure your network is active.
                    </p>
                  )}
                  {!lookupResult.error && !lookupResult.found && lookupResult.reason === 'no_account' && (
                    <p className="text-sm text-muted-foreground">
                      No account found for this email. Ask the dealer to sign up first.
                    </p>
                  )}
                  {!lookupResult.error && !lookupResult.found && lookupResult.reason === 'no_dealership' && (
                    <p className="text-sm text-muted-foreground">
                      This user hasn't completed dealership setup yet.
                    </p>
                  )}
                  {lookupResult.found && (
                    <div className="flex items-start justify-between gap-3 rounded-lg border p-3 bg-muted/30">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
                        <div>
                          <p className="text-sm font-medium">{lookupResult.dealership_name}</p>
                          <p className="text-xs text-muted-foreground">{lookupResult.location}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Select value={selectedTier} onValueChange={setSelectedTier}>
                          <SelectTrigger className="h-8 w-28 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {PROGRAMME_TIERS.map(t => (
                              <SelectItem key={t} value={t} className="text-xs">
                                {t}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          size="sm"
                          onClick={handleAddDealer}
                          disabled={
                            addingDealer ||
                            roster.some(r => r.dealershipId === lookupResult.dealership_id)
                          }
                        >
                          {addingDealer && <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />}
                          {roster.some(r => r.dealershipId === lookupResult.dealership_id)
                            ? 'Already enrolled'
                            : 'Add to network'}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Roster table */}
            {rosterLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : roster.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No dealers added yet. Use the email lookup above to add your first dealer.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Dealer</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Programme Tier</TableHead>
                    <TableHead>Enrolled</TableHead>
                    <TableHead className="w-20" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roster.map(entry => (
                    <TableRow key={entry.membershipId}>
                      <TableCell className="font-medium">{entry.name}</TableCell>
                      <TableCell className="text-muted-foreground">{entry.location}</TableCell>
                      <TableCell>
                        <Select
                          value={entry.programmeTier}
                          onValueChange={tier => handleTierChange(entry.membershipId, tier)}
                        >
                          <SelectTrigger className="h-8 w-28 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {PROGRAMME_TIERS.map(t => (
                              <SelectItem key={t} value={t} className="text-xs">
                                {t}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {entry.enrolledAt
                          ? format(new Date(entry.enrolledAt), 'dd MMM yyyy')
                          : '—'}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleRemove(entry.membershipId, entry.name)}
                        >
                          Remove
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
