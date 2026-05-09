import { AppSidebar } from '@/components/AppSidebar';

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  return (
    <div className="flex h-screen w-full overflow-hidden">
      <AppSidebar />
      <main className="flex-1 min-w-0 h-full overflow-y-auto bg-canvas-warm">
        {children}
      </main>
    </div>
  );
}
