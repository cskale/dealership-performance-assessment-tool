import { useState } from 'react';
import { useMultiTenant } from '@/hooks/useMultiTenant';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, ChevronDown, Building2 } from 'lucide-react';

const roleBadgeVariant: Record<string, 'default' | 'secondary' | 'outline'> = {
  owner: 'default',
  admin: 'default',
  manager: 'secondary',
  analyst: 'outline',
  viewer: 'outline',
};

export function OrganizationSwitcher() {
  const {
    currentOrganization,
    organizations,
    switchOrganization,
    loading,
    userMemberships,
  } = useMultiTenant();
  const [switching, setSwitching] = useState(false);

  const handleSwitch = async (orgId: string) => {
    if (orgId === currentOrganization?.id) return;
    setSwitching(true);
    try {
      await switchOrganization(orgId);
    } finally {
      setSwitching(false);
    }
  };

  if (loading || !currentOrganization) return null;

  // Single org — non-interactive display only
  if (!organizations || organizations.length <= 1) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground px-2">
        <Building2 className="h-4 w-4" />
        <span className="truncate max-w-[160px]">{currentOrganization.name}</span>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 max-w-[200px]">
          {switching ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Building2 className="h-4 w-4" />
          )}
          <span className="truncate">{currentOrganization.name}</span>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Your Organisations
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {organizations.map((org) => {
          const isActive = org.id === currentOrganization.id;
          const membership = userMemberships.find(m => m.organization_id === org.id);
          const role = membership?.role ?? 'member';
          return (
            <DropdownMenuItem
              key={org.id}
              onClick={() => handleSwitch(org.id)}
              className={`flex items-center justify-between gap-2 cursor-pointer py-2 ${isActive ? 'bg-accent' : ''}`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{org.name}</p>
                  {isActive && (
                    <p className="text-xs text-muted-foreground">Current</p>
                  )}
                </div>
              </div>
              <Badge variant={roleBadgeVariant[role] || 'outline'} className="text-xs shrink-0">
                {role}
              </Badge>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default OrganizationSwitcher;
