import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useMultiTenant } from '@/hooks/useMultiTenant';
import { useActiveRole } from '@/hooks/useActiveRole';
import {
  BarChart3, Plus, ClipboardList, CheckSquare,
  BookOpen, FileText, LogOut, Database, Globe, Users, Settings,
  ChevronLeft, ChevronRight,
} from 'lucide-react';
import { NotificationBell } from '@/components/NotificationBell';
import { cn } from '@/lib/utils';

export function AppSidebar() {
  const { user, signOut } = useAuth();
  const { userMemberships, currentOrganization } = useMultiTenant();
  const { actorType } = useActiveRole();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  // Route guard — never render on public pages
  const publicRoutes = ['/', '/auth', '/methodology', '/invite'];
  const isPublic = publicRoutes.some(r => location.pathname === r || location.pathname.startsWith(r + '/'));

  if (isPublic) return null;

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
      'flex items-center gap-2.5 h-9 text-[13px] transition-colors duration-100 mr-3',
      collapsed ? 'px-0 justify-center rounded-md' : 'px-3 rounded-r-md',
      isActive(path)
        ? 'sidebar-pill-active border-l-2 border-brand-500 text-white'
        : 'text-white/55 hover:text-white/85 hover:bg-white/5 border-l-2 border-transparent'
    );

  const iconClass = (path: string) =>
    cn('w-4 h-4 shrink-0', isActive(path) ? 'text-[hsl(var(--brand-500))]' : 'opacity-70');

  const sections = [
    {
      label: 'Overview',
      items: [
        ...(actorType !== 'coach' ? [{ path: '/app/dashboard', label: 'Dashboard', icon: BarChart3 }] : []),
        ...(actorType === 'oem' ? [
          { path: '/app/oem-dashboard', label: 'OEM Dashboard',    icon: Globe },
          { path: '/app/oem-settings',  label: 'Network Settings', icon: Settings },
        ] : []),
        ...(actorType === 'coach' ? [
          { path: '/app/coach-dashboard', label: 'Coach Dashboard', icon: Users },
          { path: '/app/coach-actions', label: 'Action Tracker', icon: CheckSquare },
        ] : []),
      ],
    },
    {
      label: 'Diagnostic',
      items: [
        ...(actorType !== 'coach' ? [{ path: '/app/assessment', label: 'New Assessment', icon: Plus }] : []),
        { path: '/app/results', label: 'History', icon: ClipboardList },
        { path: '/actions', label: 'Action Plans', icon: CheckSquare },
      ],
    },
    {
      label: 'Reference',
      items: [
        { path: '/kpi-encyclopedia', label: 'KPI Encyclopedia', icon: Database },
        { path: '/resources', label: 'Resource Hub', icon: BookOpen },
        { path: '/methodology', label: 'Methodology', icon: FileText },
      ],
    },
  ];

  return (
    <aside
      className={cn(
        'shrink-0 bg-[hsl(var(--dd-midnight))] flex flex-col h-screen sticky top-0 transition-all duration-300 overflow-hidden',
        collapsed ? 'w-14' : 'w-60'
      )}
    >
      {/* Header — h-14 with always-visible collapse button */}
      <div className={cn(
        'flex items-center h-14 border-b border-white/[0.06] shrink-0 relative',
        collapsed ? 'px-3 justify-center' : 'px-5'
      )}>
        <Link to="/app/dashboard" className="flex items-center gap-2.5 flex-1 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center shrink-0">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="1" width="5" height="5" rx="1" fill="white" />
              <rect x="8" y="1" width="5" height="5" rx="1" fill="white" />
              <rect x="1" y="8" width="5" height="5" rx="1" fill="white" />
              <rect x="8" y="8" width="5" height="5" rx="1" fill="white" />
            </svg>
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="text-[13px] font-semibold text-white leading-tight truncate">Dealer Diagnostic</div>
              <div className="text-[10px] uppercase tracking-widest text-white/35 leading-tight">Performance Intelligence</div>
            </div>
          )}
        </Link>
        {/* Collapse toggle — pokes out from right edge when collapsed */}
        <button
          type="button"
          onClick={() => setCollapsed(prev => !prev)}
          className={cn(
            'absolute top-1/2 -translate-y-1/2 h-6 w-6 rounded-full z-10',
            'bg-[hsl(var(--dd-midnight))] border border-white/20',
            'flex items-center justify-center hover:bg-white/20 transition-colors shrink-0',
            collapsed ? 'right-0 translate-x-1/2' : 'right-2'
          )}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed
            ? <ChevronRight className="h-3 w-3 text-white/60" />
            : <ChevronLeft  className="h-3 w-3 text-white/60" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2">
        {sections.map((section) => (
          <div key={section.label}>
            {!collapsed && (
              <p className="px-5 pt-4 pb-0.5 text-[9px] uppercase tracking-[0.12em] text-white/25 font-medium select-none">
                {section.label}
              </p>
            )}
            {collapsed && <div className="pt-2" />}
            {section.items.map((item) => (
              <Link key={item.path} to={item.path} className={navItemClass(item.path)}>
                <item.icon className={iconClass(item.path)} />
                {!collapsed && <span className="flex-1">{item.label}</span>}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className={cn('mt-auto border-t border-white/[0.06]', collapsed ? 'p-2' : 'p-5')}>
        {/* Notification bell */}
        <div className={cn('mb-3', collapsed ? 'flex justify-center' : '')}>
          <NotificationBell />
        </div>
        <div className="flex items-center gap-2.5">
          <Link
            to="/account"
            className={cn(
              'flex items-center gap-2.5 flex-1 min-w-0 rounded-md transition-colors hover:bg-white/10',
              collapsed ? 'p-1 justify-center' : '-mx-2 px-2 py-1.5'
            )}
            title="Account settings"
          >
            <div className="w-[30px] h-[30px] rounded-full bg-gradient-to-br from-[hsl(var(--brand-500))] to-indigo-500 flex items-center justify-center text-[11px] font-semibold text-white shrink-0">
              {getUserInitials()}
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <div className="text-[12px] font-medium text-white/75 truncate">{getUserName()}</div>
                <div className="text-[10px] text-white/35">{actorType === 'oem' ? 'OEM' : actorType === 'coach' ? 'Coach' : actorType === 'dealer' ? 'Dealer' : (currentRole ? currentRole.charAt(0).toUpperCase() + currentRole.slice(1) : 'Member')}</div>
              </div>
            )}
          </Link>
          {!collapsed && (
            <button
              onClick={async () => { await signOut(); }}
              className="text-white/30 hover:text-white/60 transition-colors"
              title="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
