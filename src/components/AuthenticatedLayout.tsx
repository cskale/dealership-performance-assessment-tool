import { AppSidebar } from '@/components/AppSidebar';
import { NotificationBell } from '@/components/NotificationBell';

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  return (
    <div className="flex min-h-screen w-full">
      <AppSidebar />
      <div className="flex flex-col flex-1 min-w-0">
        {/* Top bar — notification bell lives here, right-aligned */}
        <header className="h-11 shrink-0 flex items-center justify-end px-5 border-b border-border/40 bg-background sticky top-0 z-30">
          <NotificationBell headerMode />
        </header>
        <main className="flex-1 overflow-y-auto bg-neutral-100">
          {children}
        </main>
      </div>
    </div>
  );
}
