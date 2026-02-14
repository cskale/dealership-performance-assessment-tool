import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Save, Upload, X, Building2, ShoppingCart, Globe, Star, Palette, HelpCircle } from 'lucide-react';
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
  group_name: string | null;
  oem_brands: string[] | null;
  product_segments: string[] | null;
  operational_focus: string[] | null;
}

const BRAND_OPTIONS = ['BMW', 'Mercedes-Benz', 'Audi', 'Volkswagen', 'Porsche', 'Toyota', 'Honda', 'Ford', 'Hyundai', 'Kia', 'Volvo', 'Stellantis', 'Renault', 'Peugeot', 'Citroën', 'Other'];
const SEGMENT_OPTIONS = [
  { value: 'passenger', label: 'Passenger' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'two_wheeler', label: 'Two Wheeler' },
  { value: 'ev', label: 'EV' },
  { value: 'used_cars', label: 'Used Cars' },
];
const FOCUS_OPTIONS = [
  { value: 'new_vehicles', label: 'New Vehicles' },
  { value: 'used_vehicles', label: 'Used Vehicles' },
  { value: 'fleet', label: 'Fleet' },
  { value: 'digital_first', label: 'Digital First' },
];

interface Props {
  organizationId: string;
  isAdmin: boolean;
}

export const OrganizationSettings = ({ organizationId, isAdmin }: Props) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
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
    group_name: null,
    oem_brands: [],
    product_segments: [],
    operational_focus: [],
  });

  useEffect(() => {
    fetchSettings();
  }, [organizationId]);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', organizationId)
        .single();

      if (error) throw error;
      if (data) {
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
          group_name: data.group_name ?? null,
          oem_brands: data.oem_brands ?? [],
          product_segments: data.product_segments ?? [],
          operational_focus: data.operational_focus ?? [],
        });
      }
    } catch (error) {
      console.error('Error fetching org settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const validate = (): string | null => {
    if (!settings.brand_mode) return 'Brand mode is required';
    if (!settings.oem_brands || settings.oem_brands.length === 0) return 'At least one OEM brand is required';
    if (!settings.oem_authorization) return 'OEM authorization status is required';
    if (!settings.network_structure) return 'Network structure is required';
    if (!settings.business_model) return 'Business model is required';
    if (!settings.positioning) return 'Positioning is required';
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
          group_name: settings.group_name?.trim() || null,
          oem_brands: settings.oem_brands,
          product_segments: settings.product_segments,
          operational_focus: settings.operational_focus,
        } as any)
        .eq('id', organizationId);

      if (error) throw error;
      toast({ title: 'Settings saved', description: 'Organization settings updated successfully' });
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
    setSettings(prev => {
      const current = prev[field] || [];
      const next = current.includes(value) 
        ? current.filter(v => v !== value)
        : [...current, value];
      return { ...prev, [field]: next };
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
      </div>
    );
  }

  const disabled = !isAdmin;

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* 1. BRAND */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Brand</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Brand Mode *</Label>
              <Select value={settings.brand_mode || ''} onValueChange={v => setSettings(p => ({ ...p, brand_mode: v }))} disabled={disabled}>
                <SelectTrigger><SelectValue placeholder="Select brand mode" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="single_brand">Single Brand</SelectItem>
                  <SelectItem value="multi_brand">Multi Brand</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>OEM Brands * <span className="text-xs text-muted-foreground">(select at least 1)</span></Label>
              <div className="flex flex-wrap gap-2">
                {BRAND_OPTIONS.map(brand => (
                  <Badge
                    key={brand}
                    variant={settings.oem_brands?.includes(brand) ? 'default' : 'outline'}
                    className={`cursor-pointer transition-colors ${disabled ? 'opacity-50 pointer-events-none' : ''} ${settings.oem_brands?.includes(brand) ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                    onClick={() => !disabled && toggleArrayItem('oem_brands', brand)}
                  >
                    {brand}
                  </Badge>
                ))}
              </div>
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
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Products</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Product Segments</Label>
              <div className="flex flex-wrap gap-2">
                {SEGMENT_OPTIONS.map(seg => (
                  <Badge
                    key={seg.value}
                    variant={settings.product_segments?.includes(seg.value) ? 'default' : 'outline'}
                    className={`cursor-pointer transition-colors ${disabled ? 'opacity-50 pointer-events-none' : ''} ${settings.product_segments?.includes(seg.value) ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                    onClick={() => !disabled && toggleArrayItem('product_segments', seg.value)}
                  >
                    {seg.label}
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
              <div className="flex flex-wrap gap-2">
                {FOCUS_OPTIONS.map(opt => (
                  <Badge
                    key={opt.value}
                    variant={settings.operational_focus?.includes(opt.value) ? 'default' : 'outline'}
                    className={`cursor-pointer transition-colors ${disabled ? 'opacity-50 pointer-events-none' : ''} ${settings.operational_focus?.includes(opt.value) ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
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
        <Card>
          <CardHeader className="pb-4">
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

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Country *</Label>
                <Input value={settings.country || ''} onChange={e => setSettings(p => ({ ...p, country: e.target.value }))} placeholder="e.g. Germany" disabled={disabled} />
              </div>
              <div className="space-y-2">
                <Label>City *</Label>
                <Input value={settings.city || ''} onChange={e => setSettings(p => ({ ...p, city: e.target.value }))} placeholder="e.g. Munich" disabled={disabled} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 4. POSITIONING */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Positioning</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Market Positioning *</Label>
              <Select value={settings.positioning || ''} onValueChange={v => setSettings(p => ({ ...p, positioning: v }))} disabled={disabled}>
                <SelectTrigger><SelectValue placeholder="Select positioning" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="mass_market">Mass Market</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="luxury">Luxury</SelectItem>
                  <SelectItem value="super_luxury">Super Luxury</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Group Name <span className="text-xs text-muted-foreground">(optional)</span></Label>
              <Input value={settings.group_name || ''} onChange={e => setSettings(p => ({ ...p, group_name: e.target.value }))} placeholder="e.g. AutoGroup GmbH" disabled={disabled} />
            </div>
          </CardContent>
        </Card>

        {/* 5. BRANDING */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Branding</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
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
          </CardContent>
        </Card>

        {/* Save button */}
        {isAdmin && (
          <div className="flex justify-end">
            <Button onClick={saveSettings} disabled={saving} size="lg">
              <Save className="h-4 w-4 mr-2" />
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
