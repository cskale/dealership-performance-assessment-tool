import { useRoleContext } from '@/contexts/RoleContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

export const RoleSelector = () => {
  const { testRole, setTestRole } = useRoleContext();

  return (
    <div className="flex items-center gap-2">
      <Label htmlFor="role-selector" className="text-sm text-muted-foreground">
        Test Role:
      </Label>
      <Select value={testRole} onValueChange={(value) => setTestRole(value as 'coach' | 'dealer')}>
        <SelectTrigger id="role-selector" className="w-[120px] h-8">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="coach">Coach</SelectItem>
          <SelectItem value="dealer">Dealer</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
