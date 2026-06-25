import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Auth = () => {
  const { user, signIn, signUp, signInWithMagicLink } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    await signIn(formData.get('email') as string, formData.get('password') as string);
    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    await signUp(formData.get('email') as string, formData.get('password') as string, formData.get('fullName') as string);
    setIsLoading(false);
  };

  const handleMagicLink = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    await signInWithMagicLink(formData.get('email') as string);
    setIsLoading(false);
  };

  const handleForgotPassword = async () => {
    const emailInput = document.getElementById('signin-email') as HTMLInputElement;
    const email = emailInput?.value?.trim();
    if (!email) {
      toast({ title: 'Enter your email first', description: 'Type your email in the field above, then click Forgot Password.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback`,
    });
    setIsLoading(false);
    if (error) {
      toast({ title: 'Reset failed', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Reset link sent', description: 'Check your inbox for the password reset link.' });
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white">
      {/* ── Left: dark branding ── */}
      <div
        className="relative overflow-hidden bg-dd-midnight text-white flex flex-col justify-between p-8 lg:p-14 min-h-[280px] lg:min-h-screen"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 0%, hsl(var(--brand-500) / 0.18), transparent 55%), linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)`,
          backgroundSize: 'auto, 40px 40px, 40px 40px',
        }}
      >
        <div className="relative flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-brand-500 flex items-center justify-center shadow-elevated">
            <span className="font-bold text-white text-lg">D</span>
          </div>
          <span className="text-[15px] font-semibold tracking-tight">Dealer Diagnostic</span>
        </div>

        <div className="relative max-w-md">
          <div className="text-xs font-bold tracking-[0.18em] uppercase text-brand-400 mb-4 hidden lg:block">
            <span className="inline-block w-5 h-px bg-brand-500 mr-2 align-middle" />
            Enterprise Diagnostic Platform
          </div>
          <h1 className="font-display text-4xl lg:text-6xl leading-[1.05] tracking-tight mb-4 lg:mb-6">
            Diagnose. Prioritise. Improve.
          </h1>
          <p className="text-white/60 text-sm lg:text-base leading-relaxed max-w-sm">
            Sign in to access your dealership assessment platform.
          </p>
        </div>

        <div className="relative text-[11px] tracking-wide text-white/40 hidden lg:block">
          Built for Dealer Principals · Field Coaches · OEM Programme Managers
        </div>
      </div>

      {/* ── Right: form ── */}
      <div className="flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-1.5">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground">Welcome back</h2>
            <p className="text-sm text-muted-foreground">Sign in to your account to continue.</p>
          </div>

          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="magic">Magic Link</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4 pt-4">
                <div className="space-y-1.5">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input id="signin-email" name="email" type="email" placeholder="you@company.com" required className="h-11" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="signin-password">Password</Label>
                  <Input id="signin-password" name="password" type="password" placeholder="Enter your password" required className="h-11" />
                </div>
                <Button type="submit" className="w-full h-11 rounded-full bg-brand-500 hover:bg-brand-600 text-white" disabled={isLoading}>
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </Button>
                <button type="button" onClick={handleForgotPassword} disabled={isLoading} className="w-full text-sm text-muted-foreground hover:text-brand-500 transition-colors">
                  Forgot password?
                </button>
              </form>
            </TabsContent>

            <TabsContent value="magic">
              <form onSubmit={handleMagicLink} className="space-y-4 pt-4">
                <div className="space-y-1.5">
                  <Label htmlFor="magic-email">Email</Label>
                  <Input id="magic-email" name="email" type="email" placeholder="you@company.com" required className="h-11" />
                </div>
                <Button type="submit" variant="outline" className="w-full h-11 rounded-full" disabled={isLoading}>
                  <Mail className="mr-2 h-4 w-4" />
                  {isLoading ? 'Sending...' : 'Sign in with Magic Link'}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  We'll send you a secure link to sign in without a password.
                </p>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4 pt-4">
                <div className="space-y-1.5">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <Input id="signup-name" name="fullName" type="text" placeholder="Your full name" required className="h-11" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input id="signup-email" name="email" type="email" placeholder="you@company.com" required className="h-11" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input id="signup-password" name="password" type="password" placeholder="Min. 6 characters" required minLength={6} className="h-11" />
                </div>
                <Button type="submit" className="w-full h-11 rounded-full bg-brand-500 hover:bg-brand-600 text-white" disabled={isLoading}>
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <p className="text-xs text-muted-foreground text-center">
            © {new Date().getFullYear()} Dealer Diagnostic. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
