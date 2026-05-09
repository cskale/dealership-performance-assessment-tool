import { AppSidebar } from '@/components/AppSidebar';
import { NotificationBell } from '@/components/NotificationBell';
import { Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const { user } = useAuth();

  const initials: string = (() => {
    const fullName = user?.user_metadata?.full_name as string | undefined;
    if (fullName) {
      return fullName
        .split(' ')
        .map((n: string) => n[0] ?? '')
        .join('')
        .slice(0, 2)
        .toUpperCase();
    }
    return (user?.email ?? 'U').substring(0, 2).toUpperCase();
  })();

  return (
    <div className="flex min-h-screen w-full">
      <AppSidebar />

      <div className="flex flex-col flex-1 min-w-0">
        {/* Top bar */}
        <header
          className="h-12 shrink-0 flex items-center justify-between px-6
                     border-b border-border/40 bg-background/95 backdrop-blur-sm
                     sticky top-0 z-30"
        >
          {/* Search trigger — wired to Ctrl+K in Sprint 7 */}
          <button
            type="button"
            aria-label="Search (⌘K)"
            className="flex items-center gap-2 h-8 w-56 px-3 rounded-lg border
                       border-border text-muted-foreground hover:border-brand-300
                       transition-colors"
          >
            <Search className="h-3.5 w-3.5 shrink-0" />
            <span className="text-body-sm flex-1 text-left">Search...</span>
            <kbd className="text-caption bg-muted rounded px-1.5 py-0.5 font-mono leading-none">
              ⌘K
            </kbd>
          </button>

          {/* Right: notification bell + user avatar */}
          <div className="flex items-center gap-3">
            <NotificationBell headerMode />
            <Link
              to="/account"
              title="Account settings"
              className="h-7 w-7 rounded-full bg-gradient-to-br from-brand-500 to-indigo-500
                         flex items-center justify-center text-[11px] font-semibold text-white
                         hover:opacity-90 transition-opacity"
            >
              {initials}
            </Link>
          </div>
        </header>

        {/* Page canvas with warm gradient */}
        <main className="flex-1 overflow-y-auto bg-canvas-warm">
          {children}
        </main>
      </div>
    </div>
  );
}
