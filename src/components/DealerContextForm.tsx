import { useState, useMemo, FormEvent } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Building2, MapPin, TrendingUp, Users } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface DealerContextFormProps {
  onComplete: () => void;
  existingContext?: {
    brand_represented: string;
    brand_tier: string;
    market_type: string;
    annual_unit_sales: number;
    avg_gross_profit_per_unit?: number | null;
    avg_monthly_leads?: number | null;
  } | null;
}

const PREMIUM_BRANDS = ['BMW', 'Mercedes-Benz', 'Audi', 'Lexus', 'Volvo', 'Jaguar', 'Land Rover', 'Infiniti', 'Acura'];
const LUXURY_BRANDS = ['Porsche', 'Bentley', 'Rolls-Royce', 'Ferrari', 'Lamborghini', 'Maserati', 'Aston Martin', 'McLaren', 'Bugatti'];

const ALL_BRANDS = [
  'Audi', 'BMW', 'Mercedes-Benz', 'Volkswagen', 'Toyota', 'Ford', 'Honda', 
  'Porsche', 'Volvo', 'Hyundai', 'Kia', 'Nissan', 'Mazda', 'Subaru',
  'Chevrolet', 'Jeep', 'Ram', 'Dodge', 'Chrysler', 'Tesla', 'Rivian',
  'Jaguar', 'Land Rover', 'Lexus', 'Infiniti', 'Acura', 'Genesis',
  'Ferrari', 'Lamborghini', 'Maserati', 'Aston Martin', 'Bentley', 'Rolls-Royce',
  'SEAT', 'Skoda', 'Opel', 'Peugeot', 'Citroën', 'Renault', 'Fiat',
  'Other'
].sort();

export function DealerContextForm({ onComplete, existingContext }: DealerContextFormProps) {
  const { language } = useLanguage();
  
  const [formData, setFormData] = useState({
    brandRepresented: existingContext?.brand_represented || '',
    marketType: existingContext?.market_type || '',
    annualUnitSales: existingContext?.annual_unit_sales?.toString() || '',
    avgGrossProfitPerUnit: existingContext?.avg_gross_profit_per_unit?.toString() || '',
    avgMonthlyLeads: existingContext?.avg_monthly_leads?.toString() || ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-detect brand tier
  const brandTier = useMemo(() => {
    if (LUXURY_BRANDS.includes(formData.brandRepresented)) return 'luxury';
    if (PREMIUM_BRANDS.includes(formData.brandRepresented)) return 'premium';
    return 'volume';
  }, [formData.brandRepresented]);

  const content = {
    en: {
      title: "Dealership Profile",
      subtitle: "Help us personalize your assessment results",
      brand: "Brand Represented",
      brandPlaceholder: "Select brand...",
      detectedTier: "Detected tier",
      marketType: "Market Type",
      marketTypes: {
        urban: { label: "Urban", description: "City center, high foot traffic" },
        suburban: { label: "Suburban", description: "Residential area, moderate traffic" },
        rural: { label: "Rural", description: "Countryside, lower traffic" }
      },
      annualSales: "Annual Unit Sales",
      annualSalesPlaceholder: "e.g., 850",
      annualSalesHint: "Total vehicles sold per year",
      avgProfit: "Average Gross Profit Per Unit (optional)",
      avgProfitPlaceholder: "e.g., 3200",
      avgProfitHint: "In euros (€)",
      avgLeads: "Average Monthly Leads (optional)",
      avgLeadsPlaceholder: "e.g., 320",
      avgLeadsHint: "Average sales inquiries per month",
      submit: "Save & Continue",
      submitting: "Saving...",
      tiers: {
        luxury: "Luxury",
        premium: "Premium",
        volume: "Volume"
      }
    },
    de: {
      title: "Händlerprofil",
      subtitle: "Helfen Sie uns, Ihre Bewertungsergebnisse zu personalisieren",
      brand: "Vertretene Marke",
      brandPlaceholder: "Marke auswählen...",
      detectedTier: "Erkannte Stufe",
      marketType: "Markttyp",
      marketTypes: {
        urban: { label: "Städtisch", description: "Stadtzentrum, hohe Besucherfrequenz" },
        suburban: { label: "Vorstädtisch", description: "Wohngebiet, mittlere Besucherfrequenz" },
        rural: { label: "Ländlich", description: "Landgebiet, geringere Besucherfrequenz" }
      },
      annualSales: "Jährliche Verkaufszahlen",
      annualSalesPlaceholder: "z.B. 850",
      annualSalesHint: "Gesamte verkaufte Fahrzeuge pro Jahr",
      avgProfit: "Durchschnittlicher Bruttogewinn pro Einheit (optional)",
      avgProfitPlaceholder: "z.B. 3200",
      avgProfitHint: "In Euro (€)",
      avgLeads: "Durchschnittliche monatliche Leads (optional)",
      avgLeadsPlaceholder: "z.B. 320",
      avgLeadsHint: "Durchschnittliche Verkaufsanfragen pro Monat",
      submit: "Speichern & Fortfahren",
      submitting: "Speichere...",
      tiers: {
        luxury: "Luxus",
        premium: "Premium",
        volume: "Volumen"
      }
    }
  };

  const t = content[language as keyof typeof content] || content.en;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error(language === 'de' ? 'Bitte melden Sie sich an' : 'Please sign in');
        return;
      }

      const { error } = await supabase
        .from('dealer_contexts')
        .upsert({
          user_id: user.id,
          brand_represented: formData.brandRepresented,
          brand_tier: brandTier,
          market_type: formData.marketType,
          annual_unit_sales: parseInt(formData.annualUnitSales),
          avg_gross_profit_per_unit: formData.avgGrossProfitPerUnit ? parseFloat(formData.avgGrossProfitPerUnit) : null,
          avg_monthly_leads: formData.avgMonthlyLeads ? parseInt(formData.avgMonthlyLeads) : null,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      toast.success(language === 'de' ? 'Händlerprofil gespeichert' : 'Dealer profile saved');
      onComplete();
    } catch (error) {
      console.error('Error saving context:', error);
      toast.error(language === 'de' ? 'Speichern fehlgeschlagen. Bitte versuchen Sie es erneut.' : 'Failed to save. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  const isFormValid = formData.brandRepresented && formData.marketType && formData.annualUnitSales && parseInt(formData.annualUnitSales) > 0;

  return (
    <Card className="max-w-2xl mx-auto shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl flex items-center justify-center gap-2">
          <Building2 className="h-6 w-6 text-primary" />
          {t.title}
        </CardTitle>
        <p className="text-muted-foreground">{t.subtitle}</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Brand Selector */}
          <div className="space-y-2">
            <Label htmlFor="brand" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              {t.brand} *
            </Label>
            <select
              id="brand"
              value={formData.brandRepresented}
              onChange={(e) => setFormData({...formData, brandRepresented: e.target.value})}
              required
              className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">{t.brandPlaceholder}</option>
              {ALL_BRANDS.map((brand) => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
            {formData.brandRepresented && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm text-muted-foreground">{t.detectedTier}:</span>
                <Badge 
                  variant={brandTier === 'luxury' ? 'default' : brandTier === 'premium' ? 'secondary' : 'outline'}
                  className="capitalize"
                >
                  {t.tiers[brandTier as keyof typeof t.tiers]}
                </Badge>
              </div>
            )}
          </div>

          {/* Market Type */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {t.marketType} *
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(['urban', 'suburban', 'rural'] as const).map((type) => (
                <label
                  key={type}
                  className={`flex flex-col p-4 border rounded-lg cursor-pointer transition-all hover:border-primary ${
                    formData.marketType === type ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="marketType"
                    value={type}
                    checked={formData.marketType === type}
                    onChange={(e) => setFormData({...formData, marketType: e.target.value})}
                    required
                    className="sr-only"
                  />
                  <span className="font-medium">{t.marketTypes[type].label}</span>
                  <span className="text-xs text-muted-foreground mt-1">{t.marketTypes[type].description}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Annual Unit Sales */}
          <div className="space-y-2">
            <Label htmlFor="annualSales" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              {t.annualSales} *
            </Label>
            <Input
              id="annualSales"
              type="number"
              value={formData.annualUnitSales}
              onChange={(e) => setFormData({...formData, annualUnitSales: e.target.value})}
              placeholder={t.annualSalesPlaceholder}
              min="1"
              required
            />
            <p className="text-xs text-muted-foreground">{t.annualSalesHint}</p>
          </div>

          {/* Optional Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="avgProfit" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                {t.avgProfit}
              </Label>
              <Input
                id="avgProfit"
                type="number"
                value={formData.avgGrossProfitPerUnit}
                onChange={(e) => setFormData({...formData, avgGrossProfitPerUnit: e.target.value})}
                placeholder={t.avgProfitPlaceholder}
                min="0"
                step="0.01"
              />
              <p className="text-xs text-muted-foreground">{t.avgProfitHint}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="avgLeads">
                {t.avgLeads}
              </Label>
              <Input
                id="avgLeads"
                type="number"
                value={formData.avgMonthlyLeads}
                onChange={(e) => setFormData({...formData, avgMonthlyLeads: e.target.value})}
                placeholder={t.avgLeadsPlaceholder}
                min="0"
              />
              <p className="text-xs text-muted-foreground">{t.avgLeadsHint}</p>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            size="lg"
            disabled={isSubmitting || !isFormValid}
          >
            {isSubmitting ? t.submitting : t.submit}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
