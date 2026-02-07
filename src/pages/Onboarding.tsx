/**
 * Onboarding Page
 * 
 * Guides users through setting up their organization and dealership
 * before they can access the assessment.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Building2, Car, ArrowRight, Check, Loader2, AlertCircle } from 'lucide-react';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { AUTOMOTIVE_BRANDS, COUNTRIES } from '@/types/dealership';
import { toast } from 'sonner';

type OnboardingStep = 'organization' | 'dealership' | 'complete';

export default function Onboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const { status, context, isLoading, createOrganization, createDealership, setActiveDealership } = useOnboarding();

  const [currentStep, setCurrentStep] = useState<OnboardingStep>('organization');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingDealerships, setExistingDealerships] = useState<Array<{ id: string; name: string; brand: string }>>([]);
  
  // Organization form
  const [orgName, setOrgName] = useState('');
  
  // Dealership form
  const [dealershipForm, setDealershipForm] = useState({
    name: '',
    brand: '',
    country: '',
    location: '',
  });

  // Determine initial step based on onboarding status
  useEffect(() => {
    if (status === 'needs_organization') {
      setCurrentStep('organization');
    } else if (status === 'needs_dealership') {
      setCurrentStep('dealership');
      loadExistingDealerships();
    } else if (status === 'complete') {
      // Already completed, redirect to assessment
      navigate('/app/assessment');
    }
  }, [status, navigate]);

  const loadExistingDealerships = async () => {
    if (!context.organizationId) return;
    
    try {
      const { data, error } = await supabase
        .from('dealerships')
        .select('id, name, brand')
        .eq('organization_id', context.organizationId)
        .order('name');
      
      if (!error && data) {
        setExistingDealerships(data);
      }
    } catch (err) {
      console.error('Error loading dealerships:', err);
    }
  };

  const handleCreateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!orgName.trim()) {
      toast.error('Please enter an organization name');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const result = await createOrganization(orgName.trim());
      
      if (result.success) {
        toast.success('Organization created successfully!');
        setCurrentStep('dealership');
        loadExistingDealerships();
      } else {
        toast.error(result.error || 'Failed to create organization');
      }
    } catch (err) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateDealership = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { name, brand, country, location } = dealershipForm;
    
    if (!name.trim() || !brand || !country || !location.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const result = await createDealership({
        name: name.trim(),
        brand,
        country,
        location: location.trim(),
      });
      
      if (result.success) {
        toast.success('Dealership created successfully!');
        navigate('/app/assessment');
      } else {
        toast.error(result.error || 'Failed to create dealership');
      }
    } catch (err) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectExistingDealership = async (dealershipId: string) => {
    setIsSubmitting(true);
    
    try {
      const success = await setActiveDealership(dealershipId);
      
      if (success) {
        toast.success('Dealership selected!');
        navigate('/app/assessment');
      } else {
        toast.error('Failed to select dealership');
      }
    } catch (err) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-primary-foreground font-bold text-lg">D</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold">Dealer Performance Assessment</h1>
              <p className="text-xs text-muted-foreground">Setup Wizard</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className={`flex items-center gap-2 ${currentStep === 'organization' ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep === 'organization' ? 'bg-primary text-primary-foreground' :
                currentStep === 'dealership' || currentStep === 'complete' ? 'bg-primary text-primary-foreground' : 'bg-muted'
              }`}>
                {currentStep !== 'organization' ? <Check className="h-4 w-4" /> : '1'}
              </div>
              <span className="font-medium hidden sm:inline">Organization</span>
            </div>
            
            <div className="w-16 h-0.5 bg-muted">
              <div className={`h-full bg-primary transition-all ${currentStep !== 'organization' ? 'w-full' : 'w-0'}`} />
            </div>
            
            <div className={`flex items-center gap-2 ${currentStep === 'dealership' ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep === 'dealership' ? 'bg-primary text-primary-foreground' :
                currentStep === 'complete' ? 'bg-primary text-primary-foreground' : 'bg-muted'
              }`}>
                {currentStep === 'complete' ? <Check className="h-4 w-4" /> : '2'}
              </div>
              <span className="font-medium hidden sm:inline">Dealership</span>
            </div>
          </div>

          {/* Organization Step */}
          {currentStep === 'organization' && (
            <Card className="border-2">
              <CardHeader className="text-center pb-2">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Building2 className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">Create Your Organization</CardTitle>
                <CardDescription className="max-w-md mx-auto">
                  Organizations help you manage multiple dealerships and team members. 
                  Start by giving your organization a name.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateOrganization} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="orgName">Organization Name *</Label>
                    <Input
                      id="orgName"
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      placeholder="e.g., Premium Auto Group"
                      className="text-lg py-6"
                      disabled={isSubmitting}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      This will be visible to team members you invite.
                    </p>
                  </div>

                  <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        Continue
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Dealership Step */}
          {currentStep === 'dealership' && (
            <div className="space-y-6">
              {/* Existing Dealerships */}
              {existingDealerships.length > 0 && (
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle className="text-lg">Select Existing Dealership</CardTitle>
                    <CardDescription>
                      Choose a dealership from your organization to assess.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {existingDealerships.map((dealership) => (
                      <Button
                        key={dealership.id}
                        variant="outline"
                        className="w-full justify-start h-auto py-3"
                        onClick={() => handleSelectExistingDealership(dealership.id)}
                        disabled={isSubmitting}
                      >
                        <Car className="mr-3 h-5 w-5 text-primary" />
                        <div className="text-left">
                          <div className="font-medium">{dealership.name}</div>
                          <div className="text-xs text-muted-foreground">{dealership.brand}</div>
                        </div>
                      </Button>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Create New Dealership */}
              <Card className="border-2">
                <CardHeader className="text-center pb-2">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Car className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">
                    {existingDealerships.length > 0 ? 'Or Create New Dealership' : 'Add Your Dealership'}
                  </CardTitle>
                  <CardDescription className="max-w-md mx-auto">
                    Enter the details of the dealership you want to assess.
                  </CardDescription>
                  {context.organizationName && (
                    <Badge variant="secondary" className="mx-auto mt-2">
                      <Building2 className="h-3 w-3 mr-1" />
                      {context.organizationName}
                    </Badge>
                  )}
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateDealership} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="dealershipName">Dealership Name *</Label>
                      <Input
                        id="dealershipName"
                        value={dealershipForm.name}
                        onChange={(e) => setDealershipForm({ ...dealershipForm, name: e.target.value })}
                        placeholder="e.g., Downtown BMW"
                        disabled={isSubmitting}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Brand *</Label>
                        <Select
                          value={dealershipForm.brand}
                          onValueChange={(value) => setDealershipForm({ ...dealershipForm, brand: value })}
                          disabled={isSubmitting}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select brand" />
                          </SelectTrigger>
                          <SelectContent>
                            {AUTOMOTIVE_BRANDS.map((brand) => (
                              <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Country *</Label>
                        <Select
                          value={dealershipForm.country}
                          onValueChange={(value) => setDealershipForm({ ...dealershipForm, country: value })}
                          disabled={isSubmitting}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                          <SelectContent>
                            {COUNTRIES.map((country) => (
                              <SelectItem key={country} value={country}>{country}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">Location *</Label>
                      <Input
                        id="location"
                        value={dealershipForm.location}
                        onChange={(e) => setDealershipForm({ ...dealershipForm, location: e.target.value })}
                        placeholder="e.g., 123 Main Street, Berlin"
                        disabled={isSubmitting}
                        required
                      />
                    </div>

                    <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          Create & Start Assessment
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
