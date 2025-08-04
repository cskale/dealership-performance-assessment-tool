import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Building2, Globe, MapPin, Mail, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DealershipInfo, AUTOMOTIVE_BRANDS, COUNTRIES } from '@/types/dealership';
import { useAssessmentData } from '@/hooks/useAssessmentData';
import { useToast } from '@/hooks/use-toast';

interface DealershipInfoFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (data: DealershipInfo) => void;
  initialData?: DealershipInfo;
}

export const DealershipInfoForm: React.FC<DealershipInfoFormProps> = ({
  open,
  onOpenChange,
  onSubmit,
  initialData,
}) => {
  const navigate = useNavigate();
  const { saveDealership, isLoading } = useAssessmentData();
  const { toast } = useToast();
  const [formData, setFormData] = useState<DealershipInfo>({
    name: initialData?.name || '',
    brand: initialData?.brand || '',
    country: initialData?.country || '',
    location: initialData?.location || '',
    contactEmail: initialData?.contactEmail || '',
    phone: initialData?.phone || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Dealership name is required';
    }
    if (!formData.brand) {
      newErrors.brand = 'Brand selection is required';
    }
    if (!formData.country) {
      newErrors.country = 'Country selection is required';
    }
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }
    if (formData.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
      newErrors.contactEmail = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const dealershipData: DealershipInfo = {
          ...formData,
          id: crypto.randomUUID()
        };
        
        await saveDealership(dealershipData);
        
        toast({
          title: "Success!",
          description: "Dealership information saved successfully.",
        });
        
        onOpenChange(false);
        
        // Always navigate to assessment page after successful save
        navigate('/assessment');
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to save dealership information. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleInputChange = (field: keyof DealershipInfo, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Building2 className="h-8 w-8 text-primary" />
            Dealership Information
          </DialogTitle>
          <DialogDescription>
            Please provide your dealership details to begin the assessment
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Dealership Name *
              </Label>
              <Input
                id="name"
                placeholder="e.g., BMW Downtown Showroom"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="brand" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Automotive Brand *
              </Label>
              <Select value={formData.brand} onValueChange={(value) => handleInputChange('brand', value)}>
                <SelectTrigger className={errors.brand ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Select your brand" />
                </SelectTrigger>
                <SelectContent>
                  {AUTOMOTIVE_BRANDS.map((brand) => (
                    <SelectItem key={brand} value={brand}>
                      {brand}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.brand && <p className="text-sm text-destructive">{errors.brand}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="country" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Country *
              </Label>
              <Select value={formData.country} onValueChange={(value) => handleInputChange('country', value)}>
                <SelectTrigger className={errors.country ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Select your country" />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map((country) => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.country && <p className="text-sm text-destructive">{errors.country}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                City/Location *
              </Label>
              <Input
                id="location"
                placeholder="e.g., Munich, Frankfurt"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className={errors.location ? 'border-destructive' : ''}
              />
              {errors.location && <p className="text-sm text-destructive">{errors.location}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactEmail" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Contact Email (Optional)
              </Label>
              <Input
                id="contactEmail"
                type="email"
                placeholder="contact@dealership.com"
                value={formData.contactEmail}
                onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                className={errors.contactEmail ? 'border-destructive' : ''}
              />
              {errors.contactEmail && <p className="text-sm text-destructive">{errors.contactEmail}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone Number (Optional)
              </Label>
              <Input
                id="phone"
                placeholder="+49 89 1234567"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
              />
            </div>
          </div>

          <div className="pt-4">
            <Button 
              type="submit" 
              className="w-full h-12 text-lg"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Continue to Assessment'}
            </Button>
          </div>
        </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};