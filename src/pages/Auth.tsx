import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { Apple, Facebook, Mail } from 'lucide-react';

const Auth = () => {
  const { user, signIn, signUp, signInWithMagicLink, signInWithOAuth } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [magicLinkMode, setMagicLinkMode] = useState(false);

  // Redirect if already authenticated
  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    await signIn(email, password);
    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const fullName = formData.get('fullName') as string;

    await signUp(email, password, fullName);
    setIsLoading(false);
  };

  const handleMagicLink = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;

    await signInWithMagicLink(email);
    setIsLoading(false);
  };

  const handleOAuthSignIn = async (provider: 'google' | 'apple' | 'facebook') => {
    setIsLoading(true);
    await signInWithOAuth(provider);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-accent/20 to-background p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-3">
          <CardTitle className="text-3xl font-bold text-primary">Welcome</CardTitle>
          <CardDescription className="text-base">
            Sign in to access your dealership assessment platform
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Social Auth Buttons */}
          <div className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full h-11 font-medium"
              onClick={() => handleOAuthSignIn('google')}
              disabled={isLoading}
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full h-11 font-medium"
              onClick={() => handleOAuthSignIn('apple')}
              disabled={isLoading}
            >
              <Apple className="mr-2 h-4 w-4" />
              Continue with Apple
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full h-11 font-medium"
              onClick={() => handleOAuthSignIn('facebook')}
              disabled={isLoading}
            >
              <Facebook className="mr-2 h-4 w-4" />
              Continue with Facebook
            </Button>
          </div>

          <div className="relative">
            <Separator />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="bg-background px-2 text-xs text-muted-foreground">OR</span>
            </div>
          </div>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="magic">Magic Link</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    required
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <Input
                    id="signin-password"
                    name="password"
                    type="password"
                    placeholder="Enter your password"
                    required
                    className="h-11"
                  />
                </div>
                <Button type="submit" className="w-full h-11 font-medium" disabled={isLoading}>
                  {isLoading ? "Signing In..." : "Sign In with Email"}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="magic">
              <form onSubmit={handleMagicLink} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="magic-email">Email</Label>
                  <Input
                    id="magic-email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    required
                    className="h-11"
                  />
                </div>
                <Button type="submit" className="w-full h-11 font-medium" disabled={isLoading}>
                  <Mail className="mr-2 h-4 w-4" />
                  {isLoading ? "Sending..." : "Send Magic Link"}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  We'll send you a secure link to sign in without a password
                </p>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <Input
                    id="signup-name"
                    name="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    required
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    required
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    name="password"
                    type="password"
                    placeholder="Create a password (min. 6 characters)"
                    required
                    minLength={6}
                    className="h-11"
                  />
                </div>
                <Button type="submit" className="w-full h-11 font-medium" disabled={isLoading}>
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;