import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useMultiTenant } from '@/hooks/useMultiTenant';
import {
  BarChart3, Building2, Plus, ClipboardList, CheckSquare,
  BookOpen, FileText, LogOut,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

export function AppSidebar() {
  const { user, signOut } = useAuth();
  const { userMemberships, currentOrganization } = useMultiTenant();
  const location = useLocation();
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    const fetchCount = async () => {
      if (!user) return;
      const { count } = await supabase
        .from('assessments')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'completed');
      setCompletedCount(count ?? 0);
    };
    fetchCount();
  }, [user]);

  const currentRole = userMemberships.find(
    m => m.organization_id === currentOrganization?.id
  )?.role;

  const getUserInitials = () => {
    if (!user?.email) return 'U';
    return user.email.substring(0, 2).toUpperCase();
  };

  const getUserName = () => {
    if (!user?.email) return '';
    return user.email.split('@')[0];
  };

  const isActive = (path: string) =>
    location.pathname === path ||
    (path !== '/' && location.pathname.startsWith(path));

  const navItemClass = (path: string) =>
    cn(
      'flex items-center gap-2.5 px-5 py-[9px] text-[13px] transition-all cursor-pointer',
      isActive(path)
        ? 'bg-[hsl(221,82%,51%)]/20 text-white border-r-2 border-[hsl(var(--dd-accent))]'
        : 'text-white/55 hover:bg-white/[0.05] hover:text-white/85'
    );

  const iconClass = (path: string) =>
    cn('w-4 h-4', isActive(path) ? 'text-[hsl(var(--dd-accent))]' : 'opacity-70');

  const sections = [
    {
      label: 'Overview',
      items: [
        { path: '/app/dashboard', label: 'Dashboard', icon: BarChart3 },
        { path: '/account', label: 'My Dealership', icon: Building2 },
      ],
    },
    {
      label: 'Diagnostic',
      items: [
        { path: '/app/assessment', label: 'New Assessment', icon: Plus },
        { path: '/app/results', label: 'History', icon: ClipboardList, badge: completedCount },
        { path: '/actions', label: 'Action Plans', icon: CheckSquare },
      ],
    },
    {
      label: 'Reference',
      items: [
        { path: '/resources', label: 'KPI Encyclopedia', icon: BookOpen },
        { path: '/methodology', label: 'Methodology', icon: FileText },
      ],
    },
  ];

  return (
    <aside className="w-60 shrink-0 bg-[hsl(var(--dd-midnight))] flex flex-col h-screen sticky top-0">
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/[0.06]">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[hsl(var(--dd-accent))] flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="1" width="5" height="5" rx="1" fill="white" />
              <rect x="8" y="1" width="5" height="5" rx="1" fill="white" />
              <rect x="1" y="8" width="5" height="5" rx="1" fill="white" />
              <rect x="8" y="8" width="5" height="5" rx="1" fill="white" />
            </svg>
          </div>
          <div>
            <div className="text-[13px] font-semibold text-white leading-tight">Dealer Diagnostic</div>
            <div className="text-[10px] uppercase tracking-widest text-white/35 leading-tight">Performance Intelligence</div>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2">
        {sections.map((section) => (
          <div key={section.label}>
            <div className="px-5 pt-5 pb-1.5 text-[9px] uppercase tracking-widest text-white/25">
              {section.label}
            </div>
            {section.items.map((item) => (
              <Link key={item.path} to={item.path} className={navItemClass(item.path)}>
                <item.icon className={iconClass(item.path)} />
                <span className="flex-1">{item.label}</span>
                {'badge' in item && item.badge != null && item.badge > 0 && (
                  <span className="min-w-[18px] h-[18px] rounded-full bg-[hsl(var(--dd-accent))]/30 text-[hsl(var(--dd-accent))] text-[10px] font-medium flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="mt-auto border-t border-white/[0.06] p-5">
        <div className="flex items-center gap-2.5">
          <div className="w-[30px] h-[30px] rounded-full bg-gradient-to-br from-[hsl(var(--dd-accent))] to-indigo-500 flex items-center justify-center text-[11px] font-semibold text-white shrink-0">
            {getUserInitials()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[12px] font-medium text-white/75 truncate">{getUserName()}</div>
            <div className="text-[10px] text-white/35 capitalize">{currentRole || 'member'}</div>
          </div>
          <button
            onClick={async () => { await signOut(); }}
            className="text-white/30 hover:text-white/60 transition-colors"
            title="Sign out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
