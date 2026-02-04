/**
 * Route-aware navigation visibility policy
 * Single source of truth for which navigation elements show on each route
 */

export type NavigationMode = 'full' | 'minimal' | 'results' | 'assessment';

interface NavigationConfig {
  showLogo: boolean;
  showLanguageSelector: boolean;
  showNavLinks: boolean;
  showProfileDropdown: boolean;
  showOrgSwitcher: boolean;
  showTestRole: boolean;
  showBackToHome: boolean;
}

const navigationConfigs: Record<NavigationMode, NavigationConfig> = {
  full: {
    showLogo: true,
    showLanguageSelector: true,
    showNavLinks: true,
    showProfileDropdown: true,
    showOrgSwitcher: true,
    showTestRole: false, // Never show on production
    showBackToHome: false,
  },
  minimal: {
    showLogo: false,
    showLanguageSelector: false,
    showNavLinks: false,
    showProfileDropdown: false,
    showOrgSwitcher: false,
    showTestRole: false,
    showBackToHome: true, // Only show back button
  },
  results: {
    showLogo: true,
    showLanguageSelector: true,
    showNavLinks: false, // Results page has its own tab navigation
    showProfileDropdown: true,
    showOrgSwitcher: false, // Don't show org switcher on results
    showTestRole: false,
    showBackToHome: false,
  },
  assessment: {
    showLogo: true,
    showLanguageSelector: true,
    showNavLinks: false,
    showProfileDropdown: true,
    showOrgSwitcher: false,
    showTestRole: false,
    showBackToHome: false,
  },
};

/**
 * Get the navigation mode for a given route
 * @param pathname - Current route pathname
 * @returns NavigationMode
 */
export function getNavMode(pathname: string): NavigationMode {
  // Methodology page shows only back button
  if (pathname === '/methodology') {
    return 'minimal';
  }
  
  // Results page has specialized navigation
  if (pathname.startsWith('/app/results') || pathname === '/results') {
    return 'results';
  }
  
  // Assessment page has minimal nav
  if (pathname.startsWith('/app/assessment') || pathname === '/assessment') {
    return 'assessment';
  }
  
  // Default: full navigation
  return 'full';
}

/**
 * Get navigation configuration for a route
 * @param pathname - Current route pathname
 * @returns NavigationConfig
 */
export function getNavConfig(pathname: string): NavigationConfig {
  const mode = getNavMode(pathname);
  return navigationConfigs[mode];
}
