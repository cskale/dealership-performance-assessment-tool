import { AppSidebar } from '@/components/AppSidebar';
import { useLocation } from 'react-router-dom';

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const { pathname } = useLocation();

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <AppSidebar />
      <main className="flex-1 min-w-0 h-full overflow-y-auto bg-canvas-warm">
        <div key={pathname} className="page-enter">
          {children}
        </div>
      </main>
    </div>
  );
}
