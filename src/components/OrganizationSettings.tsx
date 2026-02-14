import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Save, Upload, X, Building2, ShoppingCart, Globe, Star, Palette, HelpCircle, Pencil, Loader2, CheckCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface OrgSettings {
  brand_mode: string | null;
  oem_authorization: string | null;
  network_structure: string | null;
  business_model: string | null;
  positioning: string | null;
  default_language: string | null;
  country: string | null;
  city: string | null;
  logo_url: string | null;
  oem_brands: string[] | null;
  product_segments: string[] | null;
  operational_focus: string[] | null;
}

const BRAND_OPTIONS = ['BMW', 'Mercedes-Benz', 'Audi', 'Volkswagen', 'Porsche', 'Toyota', 'Honda', 'Ford', 'Hyundai', 'Kia', 'Volvo', 'Rolls-Royce', 'Bentley', 'Ferrari', 'Stellantis', 'Renault', 'Peugeot', 'Citroën', 'Other'];

const BRAND_TIER_MAP: Record<string, string[]> = {
  super_luxury: ['Rolls-Royce', 'Bentley'],
  luxury: ['Porsche', 'Ferrari'],
  premium: ['BMW', 'Mercedes-Benz', 'Audi', 'Volvo'],
  mass_market: ['Volkswagen', 'Toyota', 'Hyundai', 'Kia', 'Honda', 'Ford', 'Stellantis', 'Renault', 'Peugeot', 'Citroën'],
};

const TIER_ORDER = ['super_luxury', 'luxury', 'premium', 'mass_market'] as const;
const TIER_LABELS: Record<string, string> = {
  super_luxury: 'Super Luxury',
  luxury: 'Luxury',
  premium: 'Premium',
  mass_market: 'Mass Market',
};

function calculatePositioning(brands: string[] | null): string | null {
  if (!brands || brands.length === 0) return null;
  for (const tier of TIER_ORDER) {
    if (brands.some(b => BRAND_TIER_MAP[tier]?.includes(b))) {
      return tier;
    }
  }
  return null;
}

const SEGMENT_OPTIONS = [
  { value: 'passenger', label: 'Passenger Vehicles', mandatory: true },
  { value: 'ev', label: 'EV' },
  { value: 'used_cars', label: 'Used Cars' },
];

const FOCUS_OPTIONS = [
  { value: 'new_vehicles', label: 'New Vehicles' },
  { value: 'used_vehicles', label: 'Used Vehicles' },
  { value: 'fleet', label: 'Fleet' },
  { value: 'digital_first', label: 'Digital First' },
];

function isOrgComplete(s: OrgSettings): boolean {
  return (
    s.brand_mode != null &&
    (s.oem_brands?.length ?? 0) >= 1 &&
    s.oem_authorization != null &&
    s.network_structure != null &&
    s.business_model != null &&
    s.positioning != null &&
    (s.country?.trim()?.length ?? 0) > 0 &&
    (s.city?.trim()?.length ?? 0) > 0 &&
    s.default_language != null
  );
}

interface Props {
  organizationId: string;
  isAdmin: boolean;
}

export const OrganizationSettings = ({ organizationId, isAdmin }: Props) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [settings, setSettings] = useState<OrgSettings>({
    brand_mode: null,
    oem_authorization: null,
    network_structure: null,
    business_model: null,
    positioning: null,
    default_language: 'en',
    country: null,
    city: null,
    logo_url: null,
    oem_brands: [],
    product_segments: ['passenger'],
    operational_focus: [],
  });

  useEffect(() => { fetchSettings(); }, [organizationId]);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', organizationId)
        .single();
      if (error) throw error;
      if (data) {
        const segs = (data.product_segments as string[] | null) ?? ['passenger'];
        const filtered = segs.filter(s => ['passenger', 'ev', 'used_cars'].includes(s));
        if (!filtered.includes('passenger')) filtered.unshift('passenger');
        setSettings({
          brand_mode: data.brand_mode ?? null,
          oem_authorization: data.oem_authorization ?? null,
          network_structure: data.network_structure ?? null,
          business_model: data.business_model ?? null,
          positioning: data.positioning ?? null,
          default_language: data.default_language ?? 'en',
          country: data.country ?? null,
          city: data.city ?? null,
          logo_url: data.logo_url ?? null,
          oem_brands: data.oem_brands ?? [],
          product_segments: filtered,
          operational_focus: data.operational_focus ?? [],
        });
      }
    } catch (error) {
      console.error('Error fetching org settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const complete = useMemo(() => isOrgComplete(settings), [settings]);

  // Auto-recalculate positioning whenever brands change
  useEffect(() => {
    const newPos = calculatePositioning(settings.oem_brands);
    if (newPos !== settings.positioning) {
      setSettings(p => ({ ...p, positioning: newPos }));
    }
  }, [settings.oem_brands]);

  const validate = (): string | null => {
    if (!settings.brand_mode) return 'Brand mode is required';
    if (!settings.oem_brands || settings.oem_brands.length === 0) return 'At least one OEM brand is required';
    if (!settings.oem_authorization) return 'OEM authorization status is required';
    if (!settings.network_structure) return 'Network structure is required';
    if (!settings.business_model) return 'Business model is required';
    if (!settings.positioning) return 'Positioning is required — select recognized brands';
    if (!settings.country?.trim()) return 'Country is required';
    if (!settings.city?.trim()) return 'City is required';
    if (!settings.default_language) return 'Default language is required';
    return null;
  };

  const saveSettings = async () => {
    const validationError = validate();
    if (validationError) {
      toast({ title: 'Validation Error', description: validationError, variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase
        .from('organizations')
        .update({
          brand_mode: settings.brand_mode,
          oem_authorization: settings.oem_authorization,
          network_structure: settings.network_structure,
          business_model: settings.business_model,
          positioning: settings.positioning,
          default_language: settings.default_language,
          country: settings.country?.trim(),
          city: settings.city?.trim(),
          logo_url: settings.logo_url,
          oem_brands: settings.oem_brands,
          product_segments: settings.product_segments,
          operational_focus: settings.operational_focus,
        } as any)
        .eq('id', organizationId);
      if (error) throw error;
      toast({ title: 'Saved!', description: 'Organization settings updated successfully' });
      setEditMode(false);
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast({ title: 'Save failed', description: error.message || 'Failed to save settings', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Logo must be under 2MB', variant: 'destructive' });
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `${organizationId}/logo.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('organization-logos')
        .upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage
        .from('organization-logos')
        .getPublicUrl(path);
      setSettings(prev => ({ ...prev, logo_url: urlData.publicUrl }));
      toast({ title: 'Logo uploaded', description: 'Logo will be saved with your settings' });
    } catch (error: any) {
      console.error('Error uploading logo:', error);
      toast({ title: 'Upload failed', description: error.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const toggleArrayItem = (field: 'oem_brands' | 'product_segments' | 'operational_focus', value: string) => {
    if (field === 'product_segments' && value === 'passenger') return; // mandatory
    setSettings(prev => {
      const current = prev[field] || [];
      const next = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];

      // P2: brand_mode enforcement
      if (field === 'oem_brands' && prev.brand_mode === 'single_brand') {
        // For single brand, only allow one selection
        if (!current.includes(value)) {
          return { ...prev, [field]: [value] };
        } else {
          return prev; // can't deselect single brand
        }
      }
      return { ...prev, [field]: next };
    });
  };

  const handleBrandModeChange = (mode: string) => {
    setSettings(prev => {
      const brands = prev.oem_brands || [];
      // If switching to single, keep first brand only
      const newBrands = mode === 'single_brand' && brands.length > 1
        ? [brands[0]]
        : brands;
      return { ...prev, brand_mode: mode, oem_brands: newBrands };
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
      </div>
    );
  }

  // ─── CARD VIEW (complete + not editing) ───
  if (complete && !editMode) {
    return (
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-success" />
              <CardTitle className="text-base">Organization Configuration</CardTitle>
            </div>
            {isAdmin && (
              <Button variant="ghost" size="sm" onClick={() => setEditMode(true)} className="text-muted-foreground hover:text-foreground">
                <Pencil className="h-4 w-4 mr-1" /> Edit Profile
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {/* Brand */}
            <div className="p-4 rounded-lg border border-border space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Building2 className="h-4 w-4" /> Brand
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(settings.oem_brands || []).map(b => (
                  <Badge key={b} variant="secondary" className="text-xs">{b}</Badge>
                ))}
              </div>
              <div className="flex gap-3 text-xs text-muted-foreground">
                <span>{settings.brand_mode === 'single_brand' ? 'Single Brand' : 'Multi Brand'}</span>
                <span>•</span>
                <span className="capitalize">{settings.oem_authorization}</span>
              </div>
            </div>
            {/* Positioning */}
            <div className="p-4 rounded-lg border border-border space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Star className="h-4 w-4" /> Positioning
              </div>
              <p className="font-semibold">{TIER_LABELS[settings.positioning || ''] || '—'}</p>
              <p className="text-xs text-muted-foreground">Auto-detected from brands</p>
            </div>
            {/* Network */}
            <div className="p-4 rounded-lg border border-border space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Globe className="h-4 w-4" /> Network
              </div>
              <p className="font-semibold">{settings.city}, {settings.country}</p>
              <p className="text-xs text-muted-foreground capitalize">{settings.network_structure?.replace('_', ' ')}</p>
            </div>
            {/* Products */}
            <div className="p-4 rounded-lg border border-border space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <ShoppingCart className="h-4 w-4" /> Products
              </div>
              <p className="font-semibold capitalize">{settings.business_model?.replace(/_/g, ' ')}</p>
              <div className="flex flex-wrap gap-1.5">
                {(settings.product_segments || []).map(s => (
                  <Badge key={s} variant="outline" className="text-xs capitalize">{s.replace('_', ' ')}</Badge>
                ))}
              </div>
            </div>
            {/* Branding */}
            <div className="p-4 rounded-lg border border-border space-y-2 md:col-span-2">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Palette className="h-4 w-4" /> Branding
              </div>
              <div className="flex items-center gap-4">
                {settings.logo_url && (
                  <img src={settings.logo_url} alt="Logo" className="h-10 w-10 rounded object-contain border border-border" />
                )}
                <span className="text-sm">Language: {(settings.default_language || 'en').toUpperCase()}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ─── FORM VIEW (incomplete or editing) ───
  const disabled = !isAdmin;

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Incomplete banner */}
        {!complete && !editMode && (
          <div className="flex items-center gap-3 p-4 rounded-lg border border-primary/30 bg-primary/5">
            <Building2 className="h-5 w-5 text-primary flex-shrink-0" />
            <p className="text-sm text-foreground">Complete your organization profile to enable benchmarking.</p>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {/* 1. BRAND */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">Brand</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Brand Mode *</Label>
                <Select value={settings.brand_mode || ''} onValueChange={handleBrandModeChange} disabled={disabled}>
                  <SelectTrigger><SelectValue placeholder="Select brand mode" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single_brand">Single Brand</SelectItem>
                    <SelectItem value="multi_brand">Multi Brand</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>OEM Brands * <span className="text-xs text-muted-foreground">
                  ({settings.brand_mode === 'single_brand' ? 'select 1' : 'select at least 1'})
                </span></Label>
                {settings.brand_mode === 'single_brand' ? (
                  <Select
                    value={settings.oem_brands?.[0] || ''}
                    onValueChange={v => setSettings(p => ({ ...p, oem_brands: [v] }))}
                    disabled={disabled}
                  >
                    <SelectTrigger><SelectValue placeholder="Select brand" /></SelectTrigger>
                    <SelectContent>
                      {BRAND_OPTIONS.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {BRAND_OPTIONS.map(brand => (
                      <Badge
                        key={brand}
                        variant={settings.oem_brands?.includes(brand) ? 'default' : 'outline'}
                        className={`cursor-pointer text-xs transition-colors ${disabled ? 'opacity-50 pointer-events-none' : ''} ${settings.oem_brands?.includes(brand) ? 'bg-primary/80 text-primary-foreground' : 'hover:bg-muted'}`}
                        onClick={() => !disabled && toggleArrayItem('oem_brands', brand)}
                      >
                        {brand}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>OEM Authorization *</Label>
                <Select value={settings.oem_authorization || ''} onValueChange={v => setSettings(p => ({ ...p, oem_authorization: v }))} disabled={disabled}>
                  <SelectTrigger><SelectValue placeholder="Select authorization" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="authorized">Authorized</SelectItem>
                    <SelectItem value="independent">Independent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* 2. PRODUCTS */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">Products</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Product Segments</Label>
                <div className="flex flex-wrap gap-1.5">
                  {SEGMENT_OPTIONS.map(seg => (
                    <Badge
                      key={seg.value}
                      variant={settings.product_segments?.includes(seg.value) ? 'default' : 'outline'}
                      className={`text-xs transition-colors ${seg.mandatory ? 'pointer-events-none bg-primary/80 text-primary-foreground' : `cursor-pointer ${disabled ? 'opacity-50 pointer-events-none' : ''} ${settings.product_segments?.includes(seg.value) ? 'bg-primary/80 text-primary-foreground' : 'hover:bg-muted'}`}`}
                      onClick={() => !disabled && !seg.mandatory && toggleArrayItem('product_segments', seg.value)}
                    >
                      {seg.label}{seg.mandatory ? ' ✓' : ''}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label>Business Model *</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs max-w-[200px]">2S = Sales + Service, 3S = + Spares, 4S = + Bodyshop</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Select value={settings.business_model || ''} onValueChange={v => setSettings(p => ({ ...p, business_model: v }))} disabled={disabled}>
                  <SelectTrigger><SelectValue placeholder="Select business model" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sales_only">Sales Only</SelectItem>
                    <SelectItem value="service_only">Service Only</SelectItem>
                    <SelectItem value="2s">2S (Sales + Service)</SelectItem>
                    <SelectItem value="3s">3S (+ Spares)</SelectItem>
                    <SelectItem value="4s">4S (+ Bodyshop)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Operational Focus</Label>
                <div className="flex flex-wrap gap-1.5">
                  {FOCUS_OPTIONS.map(opt => (
                    <Badge
                      key={opt.value}
                      variant={settings.operational_focus?.includes(opt.value) ? 'default' : 'outline'}
                      className={`cursor-pointer text-xs transition-colors ${disabled ? 'opacity-50 pointer-events-none' : ''} ${settings.operational_focus?.includes(opt.value) ? 'bg-primary/80 text-primary-foreground' : 'hover:bg-muted'}`}
                      onClick={() => !disabled && toggleArrayItem('operational_focus', opt.value)}
                    >
                      {opt.label}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 3. NETWORK */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">Network</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Network Structure *</Label>
                <Select value={settings.network_structure || ''} onValueChange={v => setSettings(p => ({ ...p, network_structure: v }))} disabled={disabled}>
                  <SelectTrigger><SelectValue placeholder="Select structure" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single_outlet">Single Outlet</SelectItem>
                    <SelectItem value="multi_outlet_group">Multi-Outlet Group</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Country *</Label>
                <Input value={settings.country || ''} onChange={e => setSettings(p => ({ ...p, country: e.target.value }))} placeholder="e.g. Germany" disabled={disabled} />
              </div>
              <div className="space-y-2">
                <Label>City *</Label>
                <Input value={settings.city || ''} onChange={e => setSettings(p => ({ ...p, city: e.target.value }))} placeholder="e.g. Munich" disabled={disabled} />
              </div>
            </CardContent>
          </Card>

          {/* 4. POSITIONING (READ-ONLY) */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">Positioning</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Market Positioning</Label>
                <div className="p-3 rounded-lg border border-border bg-muted/30">
                  <p className="font-semibold">
                    {settings.positioning ? TIER_LABELS[settings.positioning] : 'Not determined'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Auto-detected from brands</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 5. BRANDING (full width) */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Branding</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Organization Logo <span className="text-xs text-muted-foreground">(max 2MB)</span></Label>
                <div className="flex items-center gap-4">
                  {settings.logo_url ? (
                    <div className="relative h-16 w-16 rounded-lg border border-border overflow-hidden bg-muted">
                      <img src={settings.logo_url} alt="Organization logo" className="h-full w-full object-contain" />
                      {isAdmin && (
                        <button onClick={() => setSettings(p => ({ ...p, logo_url: null }))} className="absolute top-0 right-0 p-0.5 bg-destructive text-destructive-foreground rounded-bl">
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="h-16 w-16 rounded-lg border-2 border-dashed border-border flex items-center justify-center bg-muted/30">
                      <Upload className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                  {isAdmin && (
                    <div>
                      <label htmlFor="logo-upload">
                        <Button variant="outline" size="sm" asChild disabled={uploading}>
                          <span>{uploading ? 'Uploading...' : 'Upload Logo'}</span>
                        </Button>
                      </label>
                      <input id="logo-upload" type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Default Language *</Label>
                <Select value={settings.default_language || 'en'} onValueChange={v => setSettings(p => ({ ...p, default_language: v }))} disabled={disabled}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="de">Deutsch</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="it">Italiano</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save / Cancel */}
        {isAdmin && (
          <div className="flex items-center justify-end gap-3">
            {editMode && (
              <Button variant="ghost" onClick={() => { setEditMode(false); fetchSettings(); }}>
                Cancel
              </Button>
            )}
            <Button onClick={saveSettings} disabled={saving} size="lg">
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              {saving ? 'Saving...' : 'Save Organization Settings'}
            </Button>
          </div>
        )}

        {!isAdmin && (
          <div className="text-center text-sm text-muted-foreground py-2">
            You don't have permission to edit organization settings.
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};
