import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Save, Upload, X, Building2, ShoppingCart, Globe, Star, Palette, HelpCircle, Pencil, Loader2, CheckCircle, MapPin, Languages, Briefcase, Network } from 'lucide-react';
import { sanitizeFormData } from '@/lib/sanitize';
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
    if (brands.some(b => BRAND_TIER_MAP[tier]?.includes(b))) return tier;
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

// Section wrapper component for consistent styling
function SettingsSection({ icon: Icon, title, description, children }: { 
  icon: React.ElementType; 
  title: string; 
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Icon className="h-4.5 w-4.5 text-primary" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
        </div>
      </div>
      <div className="ml-12">{children}</div>
    </div>
  );
}

// Chip selector for multi-select values
function ChipSelector({ options, selected, onChange, disabled, mandatory }: {
  options: { value: string; label: string; mandatory?: boolean }[];
  selected: string[];
  onChange: (value: string) => void;
  disabled?: boolean;
  mandatory?: string[];
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => {
        const isSelected = selected.includes(opt.value);
        const isMandatory = opt.mandatory || mandatory?.includes(opt.value);
        return (
          <button
            key={opt.value}
            type="button"
            disabled={disabled || isMandatory}
            onClick={() => onChange(opt.value)}
            className={`
              inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all
              border
              ${isMandatory 
                ? 'bg-primary text-primary-foreground border-primary cursor-default' 
                : isSelected 
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm' 
                  : 'bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground'
              }
              ${disabled && !isMandatory ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            {opt.label}
            {isMandatory && <CheckCircle className="h-3 w-3" />}
          </button>
        );
      })}
    </div>
  );
}

export const OrganizationSettings = ({ organizationId, isAdmin }: Props) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [settings, setSettings] = useState<OrgSettings>({
    brand_mode: null, oem_authorization: null, network_structure: null,
    business_model: null, positioning: null, default_language: 'en',
    country: null, city: null, logo_url: null,
    oem_brands: [], product_segments: ['passenger'], operational_focus: [],
  });

  useEffect(() => { fetchSettings(); }, [organizationId]);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase.from('organizations').select('*').eq('id', organizationId).single();
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
          country: data.country ?? null, city: data.city ?? null,
          logo_url: data.logo_url ?? null,
          oem_brands: data.oem_brands ?? [],
          product_segments: filtered,
          operational_focus: data.operational_focus ?? [],
        });
      }
    } catch (error) {
      console.error('Error fetching org settings:', error);
    } finally { setLoading(false); }
  };

  const complete = useMemo(() => isOrgComplete(settings), [settings]);

  useEffect(() => {
    const newPos = calculatePositioning(settings.oem_brands);
    if (newPos !== settings.positioning) setSettings(p => ({ ...p, positioning: newPos }));
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
    const err = validate();
    if (err) { toast({ title: 'Validation Error', description: err, variant: 'destructive' }); return; }
    setSaving(true);
    try {
      const { error } = await supabase.from('organizations').update({
        brand_mode: settings.brand_mode, oem_authorization: settings.oem_authorization,
        network_structure: settings.network_structure, business_model: settings.business_model,
        positioning: settings.positioning, default_language: settings.default_language,
        country: settings.country?.trim(), city: settings.city?.trim(),
        logo_url: settings.logo_url, oem_brands: settings.oem_brands,
        product_segments: settings.product_segments, operational_focus: settings.operational_focus,
      } as any).eq('id', organizationId);
      if (error) throw error;
      toast({ title: 'Saved', description: 'Organization settings updated successfully' });
      setEditMode(false);
    } catch (error: any) {
      toast({ title: 'Save failed', description: error.message || 'Failed to save settings', variant: 'destructive' });
    } finally { setSaving(false); }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast({ title: 'File too large', description: 'Logo must be under 2MB', variant: 'destructive' }); return; }
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `${organizationId}/logo.${ext}`;
      const { error: uploadError } = await supabase.storage.from('organization-logos').upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from('organization-logos').getPublicUrl(path);
      setSettings(prev => ({ ...prev, logo_url: urlData.publicUrl }));
      toast({ title: 'Logo uploaded', description: 'Logo will be saved with your settings' });
    } catch (error: any) {
      toast({ title: 'Upload failed', description: error.message, variant: 'destructive' });
    } finally { setUploading(false); }
  };

  const toggleArrayItem = (field: 'oem_brands' | 'product_segments' | 'operational_focus', value: string) => {
    if (field === 'product_segments' && value === 'passenger') return;
    setSettings(prev => {
      const current = prev[field] || [];
      if (field === 'oem_brands' && prev.brand_mode === 'single_brand') {
        return current.includes(value) ? prev : { ...prev, [field]: [value] };
      }
      const next = current.includes(value) ? current.filter(v => v !== value) : [...current, value];
      return { ...prev, [field]: next };
    });
  };

  const handleBrandModeChange = (mode: string) => {
    setSettings(prev => {
      const brands = prev.oem_brands || [];
      const newBrands = mode === 'single_brand' && brands.length > 1 ? [brands[0]] : brands;
      return { ...prev, brand_mode: mode, oem_brands: newBrands };
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
      </div>
    );
  }

  const disabled = !isAdmin;

  // ─── CARD VIEW (complete + not editing) ───
  if (complete && !editMode) {
    return (
      <Card className="border-border">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-success/10 flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-success" />
              </div>
              <CardTitle className="text-base">Organization Profile</CardTitle>
            </div>
            {isAdmin && (
              <Button variant="ghost" size="sm" onClick={() => setEditMode(true)} className="text-muted-foreground hover:text-foreground gap-1.5">
                <Pencil className="h-3.5 w-3.5" /> Edit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Brands & Authorization */}
            <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                <Building2 className="h-3.5 w-3.5" /> Brands
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(settings.oem_brands || []).map(b => (
                  <span key={b} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                    {b}
                  </span>
                ))}
              </div>
              <div className="flex gap-2 text-xs text-muted-foreground">
                <span>{settings.brand_mode === 'single_brand' ? 'Single Brand' : 'Multi Brand'}</span>
                <span>•</span>
                <span className="capitalize">{settings.oem_authorization}</span>
              </div>
            </div>

            {/* Market Positioning */}
            <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                <Star className="h-3.5 w-3.5" /> Market Position
              </div>
              <p className="text-base font-semibold text-foreground">{TIER_LABELS[settings.positioning || ''] || '—'}</p>
              <p className="text-xs text-muted-foreground">Auto-derived from brand portfolio</p>
            </div>

            {/* Geography */}
            <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                <MapPin className="h-3.5 w-3.5" /> Location
              </div>
              <p className="text-base font-semibold text-foreground">{settings.city}, {settings.country}</p>
              <p className="text-xs text-muted-foreground capitalize">{settings.network_structure?.replace('_', ' ')}</p>
            </div>

            {/* Business Model & Products */}
            <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                <Briefcase className="h-3.5 w-3.5" /> Business Model
              </div>
              <p className="text-base font-semibold text-foreground capitalize">{settings.business_model?.replace(/_/g, ' ')}</p>
              <div className="flex flex-wrap gap-1.5">
                {(settings.product_segments || []).map(s => (
                  <span key={s} className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-secondary text-secondary-foreground border border-border capitalize">
                    {s.replace('_', ' ')}
                  </span>
                ))}
              </div>
            </div>

            {/* Localization */}
            <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                <Languages className="h-3.5 w-3.5" /> Reporting Language
              </div>
              <p className="text-base font-semibold text-foreground">
                {settings.default_language === 'de' ? 'Deutsch' : settings.default_language === 'fr' ? 'Français' : settings.default_language === 'es' ? 'Español' : settings.default_language === 'it' ? 'Italiano' : 'English'}
              </p>
              <p className="text-xs text-muted-foreground">Used for exports & reports</p>
            </div>

            {/* Logo */}
            <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                <Palette className="h-3.5 w-3.5" /> Brand Identity
              </div>
              <div className="flex items-center gap-3">
                {settings.logo_url ? (
                  <img src={settings.logo_url} alt="Logo" className="h-10 w-10 rounded-lg object-contain border border-border bg-background" />
                ) : (
                  <div className="h-10 w-10 rounded-lg border-2 border-dashed border-border flex items-center justify-center">
                    <Palette className="h-4 w-4 text-muted-foreground/40" />
                  </div>
                )}
                <span className="text-xs text-muted-foreground">{settings.logo_url ? 'Custom logo' : 'No logo uploaded'}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ─── FORM VIEW ───
  return (
    <TooltipProvider>
      <div className="space-y-8">
        {/* Incomplete banner */}
        {!complete && !editMode && (
          <div className="flex items-center gap-3 p-4 rounded-xl border border-primary/30 bg-primary/5">
            <Building2 className="h-5 w-5 text-primary flex-shrink-0" />
            <p className="text-sm text-foreground">Complete your organization profile to enable benchmarking and exports.</p>
          </div>
        )}

        {/* Section 1: Brand & Authorization */}
        <Card className="border-border">
          <CardContent className="pt-6 space-y-6">
            <SettingsSection icon={Building2} title="Brand & Authorization" description="Define your OEM portfolio and authorization status">
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Brand Mode *</Label>
                  <Select value={settings.brand_mode || ''} onValueChange={handleBrandModeChange} disabled={disabled}>
                    <SelectTrigger className="h-10"><SelectValue placeholder="Select brand mode" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single_brand">Single Brand</SelectItem>
                      <SelectItem value="multi_brand">Multi Brand</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-medium">
                    OEM Brands * <span className="text-muted-foreground font-normal">
                      ({settings.brand_mode === 'single_brand' ? 'select 1' : 'select at least 1'})
                    </span>
                  </Label>
                  {settings.brand_mode === 'single_brand' ? (
                    <Select value={settings.oem_brands?.[0] || ''} onValueChange={v => setSettings(p => ({ ...p, oem_brands: [v] }))} disabled={disabled}>
                      <SelectTrigger className="h-10"><SelectValue placeholder="Select brand" /></SelectTrigger>
                      <SelectContent>
                        {BRAND_OPTIONS.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  ) : (
                    <ChipSelector
                      options={BRAND_OPTIONS.map(b => ({ value: b, label: b }))}
                      selected={settings.oem_brands || []}
                      onChange={v => toggleArrayItem('oem_brands', v)}
                      disabled={disabled}
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-medium">OEM Authorization *</Label>
                  <Select value={settings.oem_authorization || ''} onValueChange={v => setSettings(p => ({ ...p, oem_authorization: v }))} disabled={disabled}>
                    <SelectTrigger className="h-10"><SelectValue placeholder="Select authorization" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="authorized">Authorized</SelectItem>
                      <SelectItem value="independent">Independent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </SettingsSection>

            {/* Market Positioning (read-only) */}
            <SettingsSection icon={Star} title="Market Positioning" description="Automatically determined by your brand portfolio">
              <div className="p-3 rounded-lg border border-border bg-muted/30">
                <div className="flex items-center gap-3">
                  <span className="text-base font-semibold text-foreground">
                    {settings.positioning ? TIER_LABELS[settings.positioning] : 'Not determined'}
                  </span>
                  {settings.positioning && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary/10 text-primary border border-primary/20">
                      Auto-detected
                    </span>
                  )}
                </div>
              </div>
            </SettingsSection>
          </CardContent>
        </Card>

        {/* Section 2: Dealer Footprint */}
        <Card className="border-border">
          <CardContent className="pt-6 space-y-6">
            <SettingsSection icon={Network} title="Dealer Footprint" description="Network structure and geographic presence">
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Network Structure *</Label>
                  <Select value={settings.network_structure || ''} onValueChange={v => setSettings(p => ({ ...p, network_structure: v }))} disabled={disabled}>
                    <SelectTrigger className="h-10"><SelectValue placeholder="Select structure" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single_outlet">Single Outlet</SelectItem>
                      <SelectItem value="multi_outlet_group">Multi-Outlet Group</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Country *</Label>
                    <Input value={settings.country || ''} onChange={e => setSettings(p => ({ ...p, country: e.target.value }))} placeholder="e.g. Germany" disabled={disabled} className="h-10" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">City *</Label>
                    <Input value={settings.city || ''} onChange={e => setSettings(p => ({ ...p, city: e.target.value }))} placeholder="e.g. Munich" disabled={disabled} className="h-10" />
                  </div>
                </div>
              </div>
            </SettingsSection>
          </CardContent>
        </Card>

        {/* Section 3: Operational Scope */}
        <Card className="border-border">
          <CardContent className="pt-6 space-y-6">
            <SettingsSection icon={Briefcase} title="Operational Scope" description="Business model, product segments, and operational focus">
              <div className="space-y-5">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label className="text-xs font-medium">Business Model *</Label>
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
                    <SelectTrigger className="h-10"><SelectValue placeholder="Select business model" /></SelectTrigger>
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
                  <Label className="text-xs font-medium">Product Segments</Label>
                  <ChipSelector
                    options={SEGMENT_OPTIONS}
                    selected={settings.product_segments || []}
                    onChange={v => toggleArrayItem('product_segments', v)}
                    disabled={disabled}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-medium">Operational Focus</Label>
                  <ChipSelector
                    options={FOCUS_OPTIONS}
                    selected={settings.operational_focus || []}
                    onChange={v => toggleArrayItem('operational_focus', v)}
                    disabled={disabled}
                  />
                </div>
              </div>
            </SettingsSection>
          </CardContent>
        </Card>

        {/* Section 4: Localization */}
        <Card className="border-border">
          <CardContent className="pt-6 space-y-6">
            <SettingsSection icon={Languages} title="Localization" description="Language used in exports, reports, and PDF generation">
              <div className="space-y-2 max-w-sm">
                <Label className="text-xs font-medium">Default Language *</Label>
                <Select value={settings.default_language || 'en'} onValueChange={v => setSettings(p => ({ ...p, default_language: v }))} disabled={disabled}>
                  <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="de">Deutsch</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="it">Italiano</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">This language is the authoritative setting for all report exports and PDF generation.</p>
              </div>
            </SettingsSection>
          </CardContent>
        </Card>

        {/* Section 5: Brand Identity */}
        <Card className="border-border">
          <CardContent className="pt-6 space-y-6">
            <SettingsSection icon={Palette} title="Brand Identity" description="Logo used in reports and exports">
              <div className="flex items-center gap-5">
                {settings.logo_url ? (
                  <div className="relative h-16 w-16 rounded-xl border border-border overflow-hidden bg-muted">
                    <img src={settings.logo_url} alt="Organization logo" className="h-full w-full object-contain" />
                    {isAdmin && (
                      <button onClick={() => setSettings(p => ({ ...p, logo_url: null }))} className="absolute top-0 right-0 p-0.5 bg-destructive text-destructive-foreground rounded-bl">
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="h-16 w-16 rounded-xl border-2 border-dashed border-border flex items-center justify-center bg-muted/30">
                    <Upload className="h-5 w-5 text-muted-foreground/40" />
                  </div>
                )}
                {isAdmin && (
                  <div className="space-y-1">
                    <label htmlFor="logo-upload">
                      <Button variant="outline" size="sm" asChild disabled={uploading}>
                        <span>{uploading ? 'Uploading...' : 'Upload Logo'}</span>
                      </Button>
                    </label>
                    <input id="logo-upload" type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                    <p className="text-xs text-muted-foreground">Max 2MB • PNG, JPG, SVG</p>
                  </div>
                )}
              </div>
            </SettingsSection>
          </CardContent>
        </Card>

        {/* Save / Cancel */}
        {isAdmin && (
          <div className="flex items-center justify-end gap-3 pt-2">
            {editMode && (
              <Button variant="ghost" onClick={() => { setEditMode(false); fetchSettings(); }}>
                Cancel
              </Button>
            )}
            <Button onClick={saveSettings} disabled={saving} size="lg" className="min-w-[200px]">
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
