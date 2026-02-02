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
import { OrganizationSwitcher } from './OrganizationSwitcher';
import { RoleSelector } from './RoleSelector';
import { LanguageSelector } from './LanguageSelector';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { User, Settings, LogOut, BarChart3, ClipboardList, Home } from 'lucide-react';
import { useNavigate, Link, useLocation } from 'react-router-dom';

export function AppHeader() {
  const { user, signOut } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [hasCompletedAssessment, setHasCompletedAssessment] = useState(false);

  useEffect(() => {
    const completedResults = localStorage.getItem('completed_assessment_results');
    setHasCompletedAssessment(!!completedResults);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/', { replace: true });
  };

  const getUserInitials = () => {
    if (!user?.email) return 'U';
    return user.email.substring(0, 2).toUpperCase();
  };

  // Navigation items - Resources REMOVED from nav (it's inside Results now)
  const navItems = [
    { path: '/', label: language === 'de' ? 'Start' : 'Home', icon: Home, alwaysShow: true },
    { path: '/app/assessment', label: language === 'de' ? 'Bewertung' : 'Assessment', icon: ClipboardList, alwaysShow: true },
    { path: '/app/results', label: language === 'de' ? 'Ergebnisse' : 'Results', icon: BarChart3, alwaysShow: false },
  ];

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-6">
          <Link to="/" className="text-xl font-semibold text-primary hover:opacity-80 transition-opacity">
            Dealership Assessment
          </Link>
          
          {/* Navigation Links - Smart hiding based on assessment completion */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              // Hide Results if no completed assessment
              if (!item.alwaysShow && !hasCompletedAssessment) return null;
              
              const Icon = item.icon;
              const isActive = location.pathname === item.path || 
                (item.path !== '/' && location.pathname.startsWith(item.path));
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    size="sm"
                    className="gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>
          
          <OrganizationSwitcher />
        </div>

        <div className="flex items-center gap-4">
          <LanguageSelector />
          <RoleSelector />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{getUserInitials()}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.email}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {language === 'de' ? 'Kontoeinstellungen' : 'Account Settings'}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/account')}>
                <User className="mr-2 h-4 w-4" />
                {language === 'de' ? 'Profil' : 'Profile'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/account?tab=security')}>
                <Settings className="mr-2 h-4 w-4" />
                {language === 'de' ? 'Sicherheit' : 'Security'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                {language === 'de' ? 'Abmelden' : 'Sign Out'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
