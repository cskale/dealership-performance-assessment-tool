import { AppSidebar } from '@/components/AppSidebar';

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  return (
    <div className="flex min-h-screen w-full">
      <AppSidebar />
      <main className="flex-1 min-w-0 overflow-y-auto bg-neutral-100">
        {children}
      </main>
    </div>
  );
}
