/**
 * Onboarding Page
 * 
 * Guides users through setting up their dealership.
 * Organization is auto-created by DB trigger on signup — never shown to users.
 * Two paths: Create New Dealership or Join Existing via Invite.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Building2, Car, ArrowRight, Loader2, Mail, Plus } from 'lucide-react';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { AUTOMOTIVE_BRANDS, COUNTRIES } from '@/types/dealership';
import { toast } from 'sonner';

type OnboardingPath = 'choose' | 'create' | 'join';

export default function Onboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { status, context, isLoading, createDealership, setActiveDealership } = useOnboarding();

  const [activePath, setActivePath] = useState<OnboardingPath>('choose');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingDealerships, setExistingDealerships] = useState<Array<{ id: string; name: string; brand: string }>>([]);
  
  const [dealershipForm, setDealershipForm] = useState({
    name: '',
    brand: '',
    country: '',
    location: '',
  });

  useEffect(() => {
    if (status === 'complete') {
      navigate('/app/assessment');
    } else if (status === 'needs_dealership' || status === 'needs_organization') {
      loadExistingDealerships();
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

  const handleCreateDealership = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { name, brand, country, location } = dealershipForm;
    
    if (!name.trim() || !brand || !country || !location.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Org-scoped duplicate check
    if (context.organizationId) {
      const { data: orgMatch } = await supabase
        .from('dealerships')
        .select('id, name')
        .eq('organization_id', context.organizationId)
        .ilike('name', name.trim())
        .limit(1);

      if (orgMatch && orgMatch.length > 0) {
        toast.error(
          'A dealership with this name already exists in your organization. Select it from the list instead of creating a duplicate.'
        );
        return;
      }
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
        <div className="max-w-3xl mx-auto">
          {/* Existing Dealerships in Org */}
          {existingDealerships.length > 0 && activePath === 'choose' && (
            <Card className="-2 mb-6 shadow-card rounded-xl">
              <CardHeader>
                <CardTitle className="text-lg">Your Organization's Dealerships</CardTitle>
                <CardDescription>
                  Select a dealership to continue.
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

          {/* Two-Path Split Screen */}
          {activePath === 'choose' && (
            <>
              <h2 className="text-2xl font-bold text-center mb-2">Set Up Your Dealership</h2>
              <p className="text-center text-muted-foreground mb-8">
                {existingDealerships.length > 0 
                  ? 'Or choose one of the options below'
                  : 'Choose how you want to get started'
                }
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                {/* New Dealership Card */}
                <Card className="-2 hover:-primary/50 transition-colors cursor-pointer group shadow-card rounded-xl"
                      onClick={() => setActivePath('create')}>
                  <CardHeader className="text-center pb-2">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                      <Plus className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-xl">New Dealership</CardTitle>
                    <CardDescription>
                      I am setting up this dealership for the first time
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <Button variant="default" className="w-full">
                      Create Dealership
                    </Button>
                  </CardContent>
                </Card>

                {/* Join Existing Card */}
                <Card className="-2 hover:-primary/50 transition-colors cursor-pointer group shadow-card rounded-xl"
                      onClick={() => setActivePath('join')}>
                  <CardHeader className="text-center pb-2">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                      <Mail className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-xl">Join Existing</CardTitle>
                    <CardDescription>
                      I was invited by my dealership admin
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <Button variant="outline" className="w-full">
                      I Have an Invite Link
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {/* Create Dealership Form */}
          {activePath === 'create' && (
            <Card className="-2 shadow-card rounded-xl">
              <CardHeader className="text-center pb-2">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Car className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">Create Your Dealership</CardTitle>
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

                  <div className="flex gap-3">
                    <Button type="button" variant="outline" onClick={() => setActivePath('choose')} disabled={isSubmitting}>
                      Back
                    </Button>
                    <Button type="submit" className="flex-1" size="lg" disabled={isSubmitting}>
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
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Join Existing - Static Instructions */}
          {activePath === 'join' && (
            <Card className="-2 shadow-card rounded-xl">
              <CardHeader className="text-center pb-2">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">Join an Existing Dealership</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-muted-foreground max-w-md mx-auto">
                  To join an existing dealership, open the invite link your dealership admin sent you. 
                  If you don't have one, ask your admin to go to{' '}
                  <span className="font-semibold text-foreground">Settings → Team Members → Invite</span>{' '}
                  and send you a link.
                </p>
                <Button variant="outline" onClick={() => setActivePath('choose')}>
                  Back
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
