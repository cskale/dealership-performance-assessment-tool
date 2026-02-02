import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LanguageSelectorWithFlags } from './LanguageSelectorWithFlags';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRoleContext } from '@/contexts/RoleContext';
import { useMultiTenant } from '@/hooks/useMultiTenant';
import { User, Settings, LogOut, ClipboardList, BarChart3, Building2, UserCog, Shield } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

interface HomeHeaderProps {
  hasCompletedAssessment: boolean;
}

export function HomeHeader({ hasCompletedAssessment }: HomeHeaderProps) {
  const { user, signOut } = useAuth();
  const { language } = useLanguage();
  const { testRole, setTestRole } = useRoleContext();
  const { organizations, currentOrganization, switchOrganization } = useMultiTenant();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/', { replace: true });
  };

  const getUserInitials = () => {
    if (!user?.email) return 'U';
    return user.email.substring(0, 2).toUpperCase();
  };

  const content = {
    en: {
      assessment: 'Assessment',
      results: 'Results',
      profile: 'Profile',
      security: 'Security',
      signOut: 'Sign Out',
      testRole: 'Test Role',
      organization: 'Organization',
      coach: 'Coach',
      dealer: 'Dealer',
      account: 'Account Settings',
    },
    de: {
      assessment: 'Bewertung',
      results: 'Ergebnisse',
      profile: 'Profil',
      security: 'Sicherheit',
      signOut: 'Abmelden',
      testRole: 'Testrolle',
      organization: 'Organisation',
      coach: 'Coach',
      dealer: 'Händler',
      account: 'Kontoeinstellungen',
    }
  };

  const t = content[language as keyof typeof content] || content.en;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b shadow-sm">
      <div className="flex h-16 items-center justify-between px-4 lg:px-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-8">
          <Link to="/" className="text-xl font-bold text-primary hover:opacity-80 transition-opacity">
            Dealership Assessment
          </Link>
          
          {/* Navigation Links - Only show after assessment completion */}
          {user && (
            <nav className="hidden md:flex items-center gap-2">
              <Link to="/app/assessment">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ClipboardList className="h-4 w-4" />
                  {t.assessment}
                </Button>
              </Link>
              
              {hasCompletedAssessment && (
                <Link to="/app/results">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <BarChart3 className="h-4 w-4" />
                    {t.results}
                  </Button>
                </Link>
              )}
            </nav>
          )}
        </div>

        <div className="flex items-center gap-3">
          <LanguageSelectorWithFlags />
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10 border-2 border-primary/20">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.email}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {t.account}
                    </p>
                  </div>
                </DropdownMenuLabel>
                
                <DropdownMenuSeparator />
                
                {/* Test Role Selector */}
                <DropdownMenuLabel className="text-xs text-muted-foreground flex items-center gap-2">
                  <UserCog className="h-3 w-3" />
                  {t.testRole}
                </DropdownMenuLabel>
                <DropdownMenuItem 
                  onClick={() => setTestRole('coach')}
                  className={testRole === 'coach' ? 'bg-primary/10' : ''}
                >
                  <Shield className="mr-2 h-4 w-4" />
                  {t.coach}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setTestRole('dealer')}
                  className={testRole === 'dealer' ? 'bg-primary/10' : ''}
                >
                  <Building2 className="mr-2 h-4 w-4" />
                  {t.dealer}
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                {/* Organization Selector */}
                {organizations && organizations.length > 0 && (
                  <>
                    <DropdownMenuLabel className="text-xs text-muted-foreground flex items-center gap-2">
                      <Building2 className="h-3 w-3" />
                      {t.organization}
                    </DropdownMenuLabel>
                    {organizations.map((org) => (
                      <DropdownMenuItem 
                        key={org.id}
                        onClick={() => switchOrganization(org.id)}
                        className={currentOrganization?.id === org.id ? 'bg-primary/10' : ''}
                      >
                        {org.name}
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                  </>
                )}
                
                <DropdownMenuItem onClick={() => navigate('/account')}>
                  <User className="mr-2 h-4 w-4" />
                  {t.profile}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/account?tab=security')}>
                  <Settings className="mr-2 h-4 w-4" />
                  {t.security}
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  {t.signOut}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/auth">
              <Button size="sm" variant="default">
                {language === 'de' ? 'Anmelden' : 'Sign In'}
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
