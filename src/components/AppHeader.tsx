import { useState, useEffect } from 'react';
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
import { useAuth } from '@/hooks/useAuth';
import { useMultiTenant } from '@/hooks/useMultiTenant';
import { useLanguage } from '@/contexts/LanguageContext';
import { User, LogOut, BarChart3, ClipboardList, Home, Settings, CheckSquare, Target } from 'lucide-react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { OrganizationSwitcher } from './OrganizationSwitcher';

export function AppHeader() {
  const { user, signOut } = useAuth();
  const { userMemberships, currentOrganization } = useMultiTenant();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [hasCompletedAssessment, setHasCompletedAssessment] = useState(false);

  useEffect(() => {
    const checkCompleted = async () => {
      if (!user) return;
      const { count } = await supabase
        .from('assessments')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'completed');
      setHasCompletedAssessment((count ?? 0) > 0);
    };
    checkCompleted();
  }, [user]);

  // Safety net: suppress header on sidebar routes
  const sidebarRoutes = ['/app/dashboard', '/app/results', '/app/assessment', '/app/onboarding', '/account', '/actions', '/resources', '/kpi-encyclopedia'];
  const hasSidebar = sidebarRoutes.some(r => location.pathname.startsWith(r));
  if (hasSidebar) return null;

  const handleSignOut = async () => {
    await signOut();
    navigate('/', { replace: true });
  };

  const getUserInitials = () => {
    if (!user?.email) return 'U';
    return user.email.substring(0, 2).toUpperCase();
  };

  const currentRole = userMemberships.find(
    m => m.organization_id === currentOrganization?.id
  )?.role;

  const getNavItems = () => {
    if (!user) {
      return [
        { path: '/', label: language === 'de' ? 'Startseite' : 'Home', icon: Home },
        { path: '/app/assessment', label: language === 'de' ? 'Bewertung' : 'Assessment', icon: ClipboardList },
        { path: '/auth', label: language === 'de' ? 'Anmelden' : 'Sign In', icon: User },
      ];
    }

    if (currentRole === 'owner' || currentRole === 'admin') {
      return [
        { path: '/', label: language === 'de' ? 'Startseite' : 'Home', icon: Home },
        { path: '/app/dashboard', label: language === 'de' ? 'Dashboard' : 'Dashboard', icon: BarChart3 },
        { path: '/account', label: language === 'de' ? 'Konto' : 'Account', icon: Settings },
      ];
    }

    const items = [
      { path: '/', label: language === 'de' ? 'Startseite' : 'Home', icon: Home },
      { path: '/app/assessment', label: language === 'de' ? 'Bewertung' : 'Assessment', icon: ClipboardList },
    ];

    if (hasCompletedAssessment) {
      items.push(
        { path: '/app/results', label: language === 'de' ? 'Ergebnisse' : 'Results', icon: BarChart3 },
        { path: '/actions', label: language === 'de' ? 'Maßnahmenplan' : 'Action Plan', icon: CheckSquare },
      );
    }

    items.push(
      { path: '/account', label: language === 'de' ? 'Konto' : 'Account', icon: Settings },
    );

    return items;
  };

  const navItems = getNavItems();

  return (
    <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="flex h-14 items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2 text-h5 text-foreground hover:opacity-80 transition-opacity">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">D</span>
            </div>
            <span className="hidden sm:inline">Dealer Diagnostic</span>
          </Link>

          {user && <OrganizationSwitcher />}
          
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || 
                (item.path !== '/' && location.pathname.startsWith(item.path));
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "gap-2 rounded-lg",
                      isActive && "bg-accent text-accent-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary/10 text-primary text-label">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-body-md font-medium leading-none">{user?.email}</p>
                    <p className="text-caption leading-none text-muted-foreground">
                      {language === 'de' ? 'Kontoeinstellungen' : 'Account Settings'}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/account')}>
                  <User className="mr-2 h-4 w-4" />
                  {language === 'de' ? 'Profil' : 'Profile'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  {language === 'de' ? 'Abmelden' : 'Sign Out'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
